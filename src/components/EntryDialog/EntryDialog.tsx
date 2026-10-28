"use client";

import { todayIso } from "@/lib/dates";
import { blankDraft } from "@/lib/draft";
import { formatVndInput, parseVndInput } from "@/lib/money";
import { AD_PLATFORMS, EXPENSE_CATEGORIES, REVENUE_CATEGORIES, type EntryDraft, type EntryKind } from "@/lib/types";
import { categoryLabel, platformLabel } from "@/lib/labels";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState, type FormEvent } from "react";
import "./EntryDialog.scss";

type EntryDialogProps = {
  open: boolean;
  initial: EntryDraft | null;
  onClose: () => void;
  onSave: (draft: EntryDraft) => Promise<void>;
};

export function EntryDialog({ open, initial, onClose, onSave }: EntryDialogProps) {
  const [draft, setDraft] = useState<EntryDraft>(initial ?? blankDraft(todayIso()));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function changeKind(kind: EntryKind) {
    const category = kind === "expense" ? "ads" : "sales";
    setDraft((current) => ({
      ...current,
      kind,
      category,
      platform: category === "ads" ? current.platform ?? "facebook" : null,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (draft.amount <= 0) {
      setError("Nhập số tiền lớn hơn 0.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        ...draft,
        platform: draft.category === "ads" ? draft.platform ?? "facebook" : null,
      });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không lưu được khoản.");
    } finally {
      setBusy(false);
    }
  }

  const categories = draft.kind === "expense" ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <Box className="EntryDialog" component="form" onSubmit={(event) => void handleSubmit(event)}>
        <DialogTitle>{initial ? "Sửa khoản" : "Thêm khoản"}</DialogTitle>
        <DialogContent className="EntryDialogContent">
          {error ? <Alert severity="error">{error}</Alert> : null}
          <ToggleButtonGroup
            exclusive
            value={draft.kind}
            onChange={(_event, value: EntryKind | null) => {
              if (value) changeKind(value);
            }}
            aria-label="Loại khoản"
          >
            <ToggleButton value="expense">Chi phí</ToggleButton>
            <ToggleButton value="revenue">Doanh thu</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            select
            label="Danh mục"
            value={draft.category}
            onChange={(event) => {
              const category = event.target.value as EntryDraft["category"];
              setDraft((current) => ({
                ...current,
                category,
                platform: category === "ads" ? current.platform ?? "facebook" : null,
              }));
            }}
            fullWidth
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {categoryLabel(draft.kind, category)}
              </MenuItem>
            ))}
          </TextField>
          {draft.category === "ads" ? (
            <TextField
              select
              label="Nền tảng"
              value={draft.platform ?? "facebook"}
              onChange={(event) =>
                setDraft((current) => ({ ...current, platform: event.target.value as EntryDraft["platform"] }))
              }
              fullWidth
            >
              {AD_PLATFORMS.map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platformLabel(platform)}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          <TextField
            label="Số tiền (VND)"
            value={formatVndInput(draft.amount)}
            onChange={(event) => setDraft((current) => ({ ...current, amount: parseVndInput(event.target.value) }))}
            inputMode="numeric"
            fullWidth
            required
          />
          <TextField
            label="Ngày"
            type="date"
            value={draft.occurredOn}
            onChange={(event) => setDraft((current) => ({ ...current, occurredOn: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />
          <TextField
            label="Nhà cung cấp"
            value={draft.vendor}
            onChange={(event) => setDraft((current) => ({ ...current, vendor: event.target.value }))}
            fullWidth
          />
          <TextField
            label="Mã hoá đơn"
            value={draft.invoiceCode}
            onChange={(event) => setDraft((current) => ({ ...current, invoiceCode: event.target.value }))}
            fullWidth
          />
          <TextField
            label="Ghi chú"
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? <CircularProgress size={18} color="inherit" /> : "Lưu khoản"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
