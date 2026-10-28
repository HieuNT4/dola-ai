import { formatDay } from "@/lib/dates";
import { entryTitle } from "@/lib/labels";
import { formatVnd } from "@/lib/money";
import type { EntryView } from "@/lib/types";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import "./EntryList.scss";

type EntryListProps = {
  entries: EntryView[];
  onEdit?: (entry: EntryView) => void;
  onDelete?: (entry: EntryView) => void;
};

export function EntryList({ entries, onEdit, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Typography className="EntryListEmpty" component="p">
        Chưa có khoản nào trong kỳ này.
      </Typography>
    );
  }
  return (
    <Box className="EntryList">
      {entries.map((entry) => {
        const meta = [entry.vendor, entry.invoiceCode ? `HĐ ${entry.invoiceCode}` : "", entry.note]
          .filter(Boolean)
          .join(" · ");
        return (
          <Box className="EntryListRow" key={`${entry.projectId}-${entry.id}`}>
            <Typography className="EntryListDate" component="p">
              {formatDay(entry.occurredOn)}
            </Typography>
            <Box className="EntryListCopy">
              <Typography className="EntryListTitle" component="p">
                {entryTitle(entry.kind, entry.category, entry.platform)}
              </Typography>
              <Typography className="EntryListMeta" component="p">
                {entry.projectName}
                {meta ? ` · ${meta}` : ""}
              </Typography>
            </Box>
            <Box className="EntryListEnd">
              <Typography
                className={entry.kind === "revenue" ? "EntryListAmount EntryListIncome" : "EntryListAmount EntryListExpense"}
                component="p"
              >
                {entry.kind === "revenue" ? "+" : "−"}
                {formatVnd(entry.amount)}
              </Typography>
              {onEdit || onDelete ? (
                <Box className="EntryListActions">
                  {onEdit ? (
                    <IconButton type="button" aria-label="Sửa khoản" onClick={() => onEdit(entry)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                  {onDelete ? (
                    <IconButton type="button" aria-label="Xoá khoản" onClick={() => onDelete(entry)} size="small">
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
