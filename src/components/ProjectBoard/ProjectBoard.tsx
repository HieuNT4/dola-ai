"use client";

import { AiPanel } from "@/components/AiPanel/AiPanel";
import { CategoryChart } from "@/components/CategoryChart/CategoryChart";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { EntryDialog } from "@/components/EntryDialog/EntryDialog";
import { EntryList } from "@/components/EntryList/EntryList";
import { useLedger } from "@/components/LedgerProvider/LedgerProvider";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { MonthField } from "@/components/MonthField/MonthField";
import { ProjectDialog } from "@/components/ProjectDialog/ProjectDialog";
import { currentMonthKey, formatMonth, todayIso } from "@/lib/dates";
import { CATEGORY_COLOR, entryTitle } from "@/lib/labels";
import { formatVnd } from "@/lib/money";
import { entriesInMonth, sortEntries, summarize } from "@/lib/summary";
import type { EntryDraft, EntryKind, EntryView } from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import "./ProjectBoard.scss";

type ProjectBoardProps = {
  projectId: string;
};

type KindFilter = "all" | EntryKind;

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const ledger = useLedger();
  const router = useRouter();
  const [month, setMonth] = useState(currentMonthKey());
  const [kind, setKind] = useState<KindFilter>("all");
  const [editor, setEditor] = useState<EntryView | null>(null);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [removing, setRemoving] = useState<EntryView | null>(null);
  const [removeProject, setRemoveProject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const project = ledger.projects?.find((item) => item.id === projectId) ?? null;
  const storedEntries = ledger.entriesByProject[projectId];

  const view = useMemo(() => {
    const inPeriod = sortEntries(entriesInMonth(storedEntries ?? [], month));
    const visible = kind === "all" ? inPeriod : inPeriod.filter((entry) => entry.kind === kind);
    const summary = summarize(inPeriod);
    const listed: EntryView[] = visible.map((entry) => ({
      ...entry,
      projectId,
      projectName: project?.name ?? "",
    }));
    return { inPeriod, listed, summary };
  }, [storedEntries, month, kind, projectId, project?.name]);

  if (!ledger.projects) return <LoadingScreen />;
  if (!project) {
    return (
      <Box className="ProjectBoardMissing">
        <Typography variant="h2" component="h1">
          Không tìm thấy project
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Về tổng quan
        </Button>
      </Box>
    );
  }

  const profitClass = view.summary.profit < 0 ? "ProjectBoardProfit ProjectBoardLoss" : "ProjectBoardProfit";
  const period = month === "all" ? "Mọi kỳ" : formatMonth(month);

  async function confirmDeleteEntry() {
    if (!removing) return;
    setBusy(true);
    setActionError(null);
    try {
      await ledger.removeEntry(projectId, removing.id);
      setRemoving(null);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Không xoá được khoản.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDeleteProject() {
    setBusy(true);
    setActionError(null);
    try {
      await ledger.removeProject(projectId);
      router.push("/");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Không xoá được project.");
      setBusy(false);
    }
  }

  return (
    <Box className="ProjectBoard">
      <Button className="ProjectBoardBack" component={Link} href="/" startIcon={<ArrowBackRoundedIcon />} type="button">
        Tổng quan
      </Button>
      <Box className="ProjectBoardHead">
        <Box className="ProjectBoardIntro">
          <Typography className="ProjectBoardKicker" component="p">
            {period}
          </Typography>
          <Typography variant="h2" component="h1">
            {project.name}
          </Typography>
          {project.description ? (
            <Typography className="ProjectBoardNote" component="p">
              {project.description}
            </Typography>
          ) : null}
        </Box>
        <Box className="ProjectBoardActions">
          <MonthField
            value={month}
            extraMonths={(storedEntries ?? []).map((entry) => entry.occurredOn.slice(0, 7))}
            onChange={setMonth}
          />
          <Button type="button" variant="outlined" onClick={() => setRenaming(true)}>
            Sửa
          </Button>
          <Button type="button" color="error" onClick={() => setRemoveProject(true)}>
            Xoá
          </Button>
          <Button type="button" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
            Thêm khoản
          </Button>
        </Box>
      </Box>
      {ledger.error || actionError ? <Alert severity="error">{actionError ?? ledger.error}</Alert> : null}
      <Box className="ProjectBoardHero">
        <Box>
          <Typography className="ProjectBoardLabel" component="p">
            Lợi nhuận
          </Typography>
          <Typography className={profitClass} component="p">
            {formatVnd(view.summary.profit)}
          </Typography>
          <Box className="ProjectBoardPills">
            <Typography component="span">Thu {formatVnd(view.summary.revenue)}</Typography>
            <Typography component="span">Chi {formatVnd(view.summary.expense)}</Typography>
          </Box>
        </Box>
        <CategoryChart
          slices={view.summary.expenses.map((item) => ({
            id: item.category,
            label: item.label,
            amount: item.amount,
            color: CATEGORY_COLOR[item.category] ?? "#64748B",
          }))}
        />
      </Box>
      <Box className="ProjectBoardColumns">
        <Box className="ProjectBoardList">
          <Box className="ProjectBoardListHead">
            <Typography variant="h3" component="h2">
              Hoá đơn và khoản
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={kind}
              onChange={(_event, value: KindFilter | null) => {
                if (value) setKind(value);
              }}
              aria-label="Lọc loại khoản"
            >
              <ToggleButton value="all">Tất cả</ToggleButton>
              <ToggleButton value="expense">Chi phí</ToggleButton>
              <ToggleButton value="revenue">Doanh thu</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <EntryList
            entries={view.listed}
            onEdit={(entry) => setEditor(entry)}
            onDelete={(entry) => setRemoving(entry)}
          />
        </Box>
        <AiPanel
          projectName={project.name}
          today={todayIso()}
          evaluation={{
            projectName: project.name,
            revenue: view.summary.revenue,
            expense: view.summary.expense,
            profit: view.summary.profit,
            expenses: view.summary.expenses.map((item) => ({ label: item.label, amount: item.amount })),
            recent: view.inPeriod.slice(0, 30).map((entry) => ({
              kind: entry.kind,
              label: entryTitle(entry.kind, entry.category, entry.platform),
              amount: entry.amount,
              occurredOn: entry.occurredOn,
              note: entry.note,
              vendor: entry.vendor,
              invoiceCode: entry.invoiceCode,
            })),
          }}
          onSave={(drafts) => ledger.saveEntries(projectId, drafts)}
        />
      </Box>
      <EntryDialog
        key={editor?.id ?? (creating ? "new" : "closed")}
        open={creating || editor !== null}
        initial={editor}
        onClose={() => {
          setCreating(false);
          setEditor(null);
        }}
        onSave={async (draft: EntryDraft) => {
          if (editor) {
            await ledger.updateEntry(projectId, editor.id, draft);
            return;
          }
          await ledger.saveEntries(projectId, [draft]);
        }}
      />
      <ProjectDialog
        key={`${project.name}-${project.description}`}
        open={renaming}
        title="Sửa project"
        initialName={project.name}
        initialDescription={project.description}
        onClose={() => setRenaming(false)}
        onSave={(input) => ledger.updateProject(project.id, input)}
      />
      <ConfirmDialog
        open={removing !== null}
        title="Xoá khoản này?"
        body="Khoản sẽ biến khỏi sổ của project."
        confirmLabel="Xoá khoản"
        busy={busy}
        onClose={() => setRemoving(null)}
        onConfirm={() => void confirmDeleteEntry()}
      />
      <ConfirmDialog
        open={removeProject}
        title="Xoá project?"
        body="Mọi hoá đơn và khoản trong project này cũng bị xoá."
        confirmLabel="Xoá project"
        busy={busy}
        onClose={() => setRemoveProject(false)}
        onConfirm={() => void confirmDeleteProject()}
      />
    </Box>
  );
}
