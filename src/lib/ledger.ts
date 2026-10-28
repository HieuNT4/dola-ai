import { parseDraft } from "@/lib/draft";
import type { EntryRecord, ProjectRecord } from "@/lib/types";

function isProject(value: unknown): value is ProjectRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.description === "string" &&
    typeof record.createdAt === "number"
  );
}

export function parseLedger(input: unknown): {
  projects: ProjectRecord[];
  entriesByProject: Record<string, EntryRecord[]>;
} | null {
  if (typeof input !== "object" || input === null) return null;
  const record = input as Record<string, unknown>;
  if (!Array.isArray(record.projects) || typeof record.entriesByProject !== "object" || record.entriesByProject === null) {
    return null;
  }
  const projects: ProjectRecord[] = [];
  for (const item of record.projects) {
    if (!isProject(item)) return null;
    projects.push(item);
  }
  const bag = record.entriesByProject as Record<string, unknown>;
  const entriesByProject: Record<string, EntryRecord[]> = {};
  for (const project of projects) {
    const rows = bag[project.id];
    if (!Array.isArray(rows)) {
      entriesByProject[project.id] = [];
      continue;
    }
    entriesByProject[project.id] = rows.flatMap((row) => {
      if (typeof row !== "object" || row === null) return [];
      const data = row as Record<string, unknown>;
      const draft = parseDraft(data);
      if (!draft || typeof data.id !== "string" || typeof data.createdAt !== "number") return [];
      return [{ ...draft, id: data.id, createdAt: data.createdAt }];
    });
  }
  return { projects, entriesByProject };
}
