import { formatMonth, recentMonthKeys } from "@/lib/dates";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

type MonthFieldProps = {
  value: string;
  extraMonths: string[];
  onChange: (value: string) => void;
};

export function MonthField({ value, extraMonths, onChange }: MonthFieldProps) {
  const months = recentMonthKeys(18, extraMonths);
  return (
    <TextField
      className="MonthField"
      select
      label="Kỳ"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="small"
    >
      <MenuItem value="all">Tất cả</MenuItem>
      {months.map((month) => (
        <MenuItem key={month} value={month}>
          {formatMonth(month)}
        </MenuItem>
      ))}
    </TextField>
  );
}
