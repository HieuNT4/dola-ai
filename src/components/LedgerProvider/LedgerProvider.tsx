"use client";

import { apiSend } from "@/lib/client";
import { parseLedger } from "@/lib/ledger";
import type { EntryDraft, EntryRecord, ProjectRecord } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ProjectInput = { name: string; description: string };

type LedgerContextValue = {
  projects: ProjectRecord[] | null;
  entriesByProject: Record<string, EntryRecord[]>;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (input: ProjectInput) => Promise<void>;
  updateProject: (id: string, input: ProjectInput) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  saveEntries: (projectId: string, entries: EntryDraft[]) => Promise<void>;
  updateEntry: (projectId: string, entryId: string, draft: EntryDraft) => Promise<void>;
  removeEntry: (projectId: string, entryId: string) => Promise<void>;
};

const LedgerContext = createContext<LedgerContextValue | null>(null);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null);
  const [entriesByProject, setEntriesByProject] = useState<Record<string, EntryRecord[]>>({});
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = requestId.current + 1;
    requestId.current = id;
    try {
      const payload = await apiSend<unknown>("/api/ledger");
      if (requestId.current !== id) return;
      const ledger = parseLedger(payload);
      if (!ledger) throw new Error("Sổ trả về không đúng định dạng.");
      setProjects(ledger.projects);
      setEntriesByProject(ledger.entriesByProject);
      setError(null);
    } catch (caught) {
      if (requestId.current !== id) return;
      setError(caught instanceof Error ? caught.message : "Không tải được sổ.");
      setProjects((current) => current ?? []);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createProject = useCallback(
    async (input: ProjectInput) => {
      await apiSend("/api/projects", { method: "POST", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const updateProject = useCallback(
    async (id: string, input: ProjectInput) => {
      await apiSend(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) });
      await refresh();
    },
    [refresh],
  );

  const removeProject = useCallback(
    async (id: string) => {
      await apiSend(`/api/projects/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const saveEntries = useCallback(
    async (projectId: string, entries: EntryDraft[]) => {
      await apiSend(`/api/projects/${projectId}/entries`, {
        method: "POST",
        body: JSON.stringify({ entries }),
      });
      await refresh();
    },
    [refresh],
  );

  const updateEntry = useCallback(
    async (projectId: string, entryId: string, draft: EntryDraft) => {
      await apiSend(`/api/projects/${projectId}/entries/${entryId}`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      await refresh();
    },
    [refresh],
  );

  const removeEntry = useCallback(
    async (projectId: string, entryId: string) => {
      await apiSend(`/api/projects/${projectId}/entries/${entryId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      projects,
      entriesByProject,
      error,
      refresh,
      createProject,
      updateProject,
      removeProject,
      saveEntries,
      updateEntry,
      removeEntry,
    }),
    [projects, entriesByProject, error, refresh, createProject, updateProject, removeProject, saveEntries, updateEntry, removeEntry],
  );

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerContextValue {
  const value = useContext(LedgerContext);
  if (!value) throw new Error("Ledger is missing");
  return value;
}
