"use client";

import { CategoryChart } from "@/components/CategoryChart/CategoryChart";
import { EntryList } from "@/components/EntryList/EntryList";
import { useLedger } from "@/components/LedgerProvider/LedgerProvider";
import { MonthField } from "@/components/MonthField/MonthField";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { ProjectDialog } from "@/components/ProjectDialog/ProjectDialog";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { CATEGORY_COLOR } from "@/lib/labels";
import { currentMonthKey, formatMonth } from "@/lib/dates";
import { formatVnd } from "@/lib/money";
import { entriesInMonth, sortEntries, summarize } from "@/lib/summary";
import type { EntryView } from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import "./Dashboard.scss";

export function Dashboard() {
  const ledger = useLedger();
  const [month, setMonth] = useState(currentMonthKey());
  const [creating, setCreating] = useState(false);
  const projects = ledger.projects;

  const view = useMemo(() => {
    const rows = projects ?? [];
    const all: EntryView[] = [];
    const perProject = rows.map((project) => {
      const entries = sortEntries(entriesInMonth(ledger.entriesByProject[project.id] ?? [], month));
      entries.forEach((entry) => all.push({ ...entry, projectId: project.id, projectName: project.name }));
      const summary = summarize(entries);
      return { project, ...summary };
    });
    const summary = summarize(all);
    return { perProject, summary, recent: sortEntries(all).slice(0, 8) };
  }, [projects, ledger.entriesByProject, month]);

  if (!projects) return <LoadingScreen />;

  const profitClass = view.summary.profit < 0 ? "DashboardProfit DashboardLoss" : "DashboardProfit";
  const period = month === "all" ? "Mọi kỳ" : formatMonth(month);

  return (
    <Box className="Dashboard">
      <Box className="DashboardTop">
        <Box>
          <Typography className="DashboardKicker" component="p">
            {period}
          </Typography>
          <Typography variant="h2" component="h1">
            Sổ của bạn
          </Typography>
        </Box>
        <Box className="DashboardTools">
          <MonthField value={month} extraMonths={[]} onChange={setMonth} />
          <Button type="button" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
            Tạo project
          </Button>
        </Box>
      </Box>
      {ledger.error ? <Alert severity="error">{ledger.error}</Alert> : null}
      <Box className="DashboardHero">
        <Box className="DashboardHeroCopy">
          <Typography className="DashboardLabel" component="p">
            Lợi nhuận
          </Typography>
          <Typography className={profitClass} component="p">
            {formatVnd(view.summary.profit)}
          </Typography>
          <Box className="DashboardPills">
            <Box className="DashboardPill">
              <Typography className="DashboardPillLabel" component="span">
                Doanh thu
              </Typography>
              <Typography className="DashboardPillValue" component="span">
                {formatVnd(view.summary.revenue)}
              </Typography>
            </Box>
            <Box className="DashboardPill">
              <Typography className="DashboardPillLabel" component="span">
                Chi phí
              </Typography>
              <Typography className="DashboardPillValue" component="span">
                {formatVnd(view.summary.expense)}
              </Typography>
            </Box>
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
      <Box className="DashboardSection">
        <Typography variant="h3" component="h2">
          Project
        </Typography>
        {view.perProject.length === 0 ? (
          <Box className="DashboardEmpty">
            <Typography className="DashboardEmptyText" component="p">
              Chưa có project nào. Tạo project đầu tiên để bắt đầu ghi hoá đơn.
            </Typography>
            <Button type="button" variant="contained" onClick={() => setCreating(true)}>
              Tạo project
            </Button>
          </Box>
        ) : (
          <Box className="DashboardGrid">
            {view.perProject.map((item) => (
              <ProjectCard
                key={item.project.id}
                project={item.project}
                revenue={item.revenue}
                expense={item.expense}
              />
            ))}
          </Box>
        )}
      </Box>
      {view.recent.length > 0 ? (
        <Box className="DashboardSection">
          <Typography variant="h3" component="h2">
            Khoản gần đây
          </Typography>
          <EntryList entries={view.recent} />
        </Box>
      ) : null}
      <ProjectDialog
        key={creating ? "open" : "closed"}
        open={creating}
        title="Project mới"
        initialName=""
        initialDescription=""
        onClose={() => setCreating(false)}
        onSave={ledger.createProject}
      />
    </Box>
  );
}
