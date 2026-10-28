"use client";

import { apiSend } from "@/lib/client";
import { entryTitle } from "@/lib/labels";
import { formatVnd } from "@/lib/money";
import type { EntryDraft } from "@/lib/types";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import "./AiPanel.scss";

const SAMPLES = [
  "Chi 2.000.000 quảng cáo Facebook hôm nay",
  "Server 450.000 và tài nguyên 300.000",
  "Doanh thu bán hàng 8.500.000",
];

type AiMode = "parse" | "evaluate";

type EvaluatePayload = {
  projectName: string;
  revenue: number;
  expense: number;
  profit: number;
  expenses: { label: string; amount: number }[];
  recent: {
    kind: "expense" | "revenue";
    label: string;
    amount: number;
    occurredOn: string;
    note: string;
    vendor: string;
    invoiceCode: string;
  }[];
};

type AiPanelProps = {
  projectName: string;
  today: string;
  evaluation: EvaluatePayload;
  onSave: (entries: EntryDraft[]) => Promise<void>;
};

export function AiPanel({ projectName, today, evaluation, onSave }: AiPanelProps) {
  const [mode, setMode] = useState<AiMode>("parse");
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<EntryDraft[]>([]);
  const [headline, setHeadline] = useState<string | null>(null);
  const [points, setPoints] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function askParse(source: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await apiSend<{ message: string; entries: EntryDraft[] }>("/api/ai", {
        method: "POST",
        body: JSON.stringify({ action: "parse", text: source, projectName, today }),
      });
      setMessage(result.message);
      setDrafts(result.entries);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Mistral chưa trả lời.");
    } finally {
      setBusy(false);
    }
  }

  async function askEvaluation() {
    setBusy(true);
    setError(null);
    try {
      const result = await apiSend<{ headline: string; points: string[] }>("/api/ai", {
        method: "POST",
        body: JSON.stringify({ action: "evaluate", ...evaluation }),
      });
      setHeadline(result.headline);
      setPoints(result.points);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Mistral chưa trả lời.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDrafts() {
    setBusy(true);
    setError(null);
    try {
      await onSave(drafts);
      setDrafts([]);
      setMessage("Đã ghi vào sổ.");
      setText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không ghi được vào sổ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="AiPanel">
      <Box className="AiPanelHeading">
        <Typography variant="h3" component="h2">
          Trợ lý Mistral
        </Typography>
        <Typography className="AiPanelLead" component="p">
          Nói một câu để tách khoản, hoặc nhờ đánh giá lời lỗ. Mình hỏi lại trước khi ghi sổ.
        </Typography>
      </Box>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_event, value: AiMode | null) => {
          if (value) setMode(value);
        }}
        aria-label="Chế độ trợ lý"
      >
        <ToggleButton value="parse">Nhập</ToggleButton>
        <ToggleButton value="evaluate">Đánh giá</ToggleButton>
      </ToggleButtonGroup>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {mode === "parse" ? (
        <Box className="AiPanelForm">
          <TextField
            label="Câu nhập"
            placeholder="Hôm nay chi 1.500.000 quảng cáo Facebook, mã HĐ FB-102"
            value={text}
            onChange={(event) => setText(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Box className="AiPanelChips">
            {SAMPLES.map((sample) => (
              <Chip key={sample} label={sample} onClick={() => setText(sample)} variant="outlined" />
            ))}
          </Box>
          <Button type="button" variant="contained" disabled={busy || text.trim().length === 0} onClick={() => void askParse(text)}>
            {busy ? <CircularProgress size={18} color="inherit" /> : "Tách khoản"}
          </Button>
          {message ? (
            <Typography className="AiPanelMessage" component="p">
              {message}
            </Typography>
          ) : null}
          {drafts.length > 0 ? (
            <Box className="AiPanelDrafts">
              {drafts.map((draft, index) => (
                <Box className="AiPanelDraft" key={`${draft.occurredOn}-${draft.amount}-${index}`}>
                  <Box>
                    <Typography className="AiPanelDraftTitle" component="p">
                      {entryTitle(draft.kind, draft.category, draft.platform)}
                    </Typography>
                    <Typography className="AiPanelDraftMeta" component="p">
                      {draft.occurredOn}
                      {draft.note ? ` · ${draft.note}` : ""}
                    </Typography>
                  </Box>
                  <Typography className="AiPanelDraftAmount" component="p">
                    {formatVnd(draft.amount)}
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    onClick={() => setDrafts((current) => current.filter((_, item) => item !== index))}
                  >
                    Bỏ
                  </Button>
                </Box>
              ))}
              <Button type="button" variant="contained" disabled={busy} onClick={() => void saveDrafts()}>
                Lưu {drafts.length} khoản
              </Button>
            </Box>
          ) : null}
        </Box>
      ) : (
        <Box className="AiPanelForm">
          <Button type="button" variant="contained" disabled={busy} onClick={() => void askEvaluation()}>
            {busy ? <CircularProgress size={18} color="inherit" /> : "Đánh giá kỳ này"}
          </Button>
          {headline ? (
            <Box className="AiPanelResult" aria-live="polite">
              <Typography className="AiPanelHeadline" component="p">
                {headline}
              </Typography>
              {points.map((point) => (
                <Typography className="AiPanelPoint" component="p" key={point}>
                  {point}
                </Typography>
              ))}
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
