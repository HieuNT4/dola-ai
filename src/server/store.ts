import { parseDraft, parseProjectInput } from "@/lib/draft";
import type { EntryDraft, EntryRecord, ProjectRecord } from "@/lib/types";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const OWNER = "owner";

type ServiceAccountFile = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function database(): Firestore {
  const existing = getApps()[0];
  const app =
    existing ??
    initializeApp({
      credential: cert(readAccount()),
    });
  return getFirestore(app);
}

function readAccount(): { projectId: string; clientEmail: string; privateKey: string } {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  const parsed = JSON.parse(raw) as ServiceAccountFile;
  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

function projects() {
  return database().collection("users").doc(OWNER).collection("projects");
}

function entries(projectId: string) {
  return projects().doc(projectId).collection("entries");
}

function readNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  return typeof value === "number" ? value : 0;
}

function readText(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

function toProject(id: string, data: Record<string, unknown>): ProjectRecord {
  return {
    id,
    name: readText(data, "name"),
    description: readText(data, "description"),
    createdAt: readNumber(data, "createdAt"),
  };
}

function toEntry(id: string, data: Record<string, unknown>): EntryRecord | null {
  const draft = parseDraft({
    kind: data.kind,
    category: data.category,
    platform: data.platform ?? null,
    amount: data.amount,
    occurredOn: data.occurredOn,
    note: readText(data, "note"),
    invoiceCode: readText(data, "invoiceCode"),
    vendor: readText(data, "vendor"),
  });
  if (!draft) return null;
  return { ...draft, id, createdAt: readNumber(data, "createdAt") };
}

export async function listLedger(): Promise<{
  projects: ProjectRecord[];
  entriesByProject: Record<string, EntryRecord[]>;
}> {
  const snapshot = await projects().orderBy("createdAt", "desc").get();
  const projectRows: ProjectRecord[] = [];
  const entriesByProject: Record<string, EntryRecord[]> = {};
  for (const project of snapshot.docs) {
    projectRows.push(toProject(project.id, project.data() as Record<string, unknown>));
    const entrySnapshot = await entries(project.id).orderBy("occurredOn", "desc").get();
    entriesByProject[project.id] = entrySnapshot.docs.flatMap((entry) => {
      const row = toEntry(entry.id, entry.data() as Record<string, unknown>);
      return row ? [row] : [];
    });
  }
  return { projects: projectRows, entriesByProject };
}

export async function createProject(input: { name: string; description: string }): Promise<void> {
  const parsed = parseProjectInput(input);
  if (!parsed) throw new Error("invalid project");
  const ref = projects().doc();
  await ref.set({ ...parsed, createdAt: Date.now() });
}

export async function updateProject(id: string, input: { name: string; description: string }): Promise<boolean> {
  const parsed = parseProjectInput(input);
  if (!parsed) throw new Error("invalid project");
  const ref = projects().doc(id);
  const current = await ref.get();
  if (!current.exists) return false;
  const createdAt = readNumber(current.data() as Record<string, unknown>, "createdAt");
  await ref.set({ ...parsed, createdAt });
  return true;
}

export async function deleteProject(id: string): Promise<boolean> {
  const ref = projects().doc(id);
  const current = await ref.get();
  if (!current.exists) return false;
  const entrySnapshot = await entries(id).get();
  const docs = entrySnapshot.docs;
  for (let index = 0; index < docs.length; index += 400) {
    const batch = database().batch();
    docs.slice(index, index + 400).forEach((entry) => batch.delete(entry.ref));
    await batch.commit();
  }
  await ref.delete();
  return true;
}

function entryPayload(draft: EntryDraft, createdAt: number) {
  return { ...draft, createdAt };
}

export async function createEntries(projectId: string, drafts: EntryDraft[]): Promise<boolean> {
  const project = await projects().doc(projectId).get();
  if (!project.exists) return false;
  const batch = database().batch();
  const now = Date.now();
  drafts.forEach((draft, index) => {
    const ref = entries(projectId).doc();
    batch.set(ref, entryPayload(draft, now + index));
  });
  await batch.commit();
  return true;
}

export async function updateEntry(projectId: string, entryId: string, draft: EntryDraft): Promise<boolean> {
  const ref = entries(projectId).doc(entryId);
  const current = await ref.get();
  if (!current.exists) return false;
  const createdAt = readNumber(current.data() as Record<string, unknown>, "createdAt");
  await ref.set(entryPayload(draft, createdAt));
  return true;
}

export async function deleteEntry(projectId: string, entryId: string): Promise<boolean> {
  const ref = entries(projectId).doc(entryId);
  const current = await ref.get();
  if (!current.exists) return false;
  await ref.delete();
  return true;
}
