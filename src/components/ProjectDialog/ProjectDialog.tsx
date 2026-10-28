"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState, type FormEvent } from "react";
import "./ProjectDialog.scss";

type ProjectDialogProps = {
  open: boolean;
  title: string;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (input: { name: string; description: string }) => Promise<void>;
};

export function ProjectDialog({ open, title, initialName, initialDescription, onClose, onSave }: ProjectDialogProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave({ name, description });
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không lưu được project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <Box className="ProjectDialog" component="form" onSubmit={(event) => void handleSubmit(event)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent className="ProjectDialogContent">
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Tên project" value={name} onChange={(event) => setName(event.target.value)} fullWidth required />
          <TextField
            label="Ghi chú"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
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
            {busy ? <CircularProgress size={18} color="inherit" /> : "Lưu"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
