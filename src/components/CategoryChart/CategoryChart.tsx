import { formatVnd } from "@/lib/money";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import "./CategoryChart.scss";

export type ChartSlice = {
  id: string;
  label: string;
  amount: number;
  color: string;
};

type CategoryChartProps = {
  slices: ChartSlice[];
};

export function CategoryChart({ slices }: CategoryChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);
  if (total <= 0) {
    return (
      <Typography className="CategoryChartEmpty" component="p">
        Chưa có chi phí trong kỳ này.
      </Typography>
    );
  }
  return (
    <Box className="CategoryChart">
      <PieChart
        series={[
          {
            data: slices.map((slice) => ({
              id: slice.id,
              value: slice.amount,
              label: slice.label,
              color: slice.color,
            })),
            innerRadius: 48,
            outerRadius: 78,
            paddingAngle: 2,
            cornerRadius: 6,
          },
        ]}
        width={220}
        height={200}
        hideLegend
      />
      <Box className="CategoryChartLegend">
        {slices.map((slice) => (
          <Box className="CategoryChartRow" key={slice.id}>
            <Box className="CategoryChartSwatch" style={{ background: slice.color }} aria-hidden="true" />
            <Typography className="CategoryChartLabel" component="span">
              {slice.label}
            </Typography>
            <Typography className="CategoryChartValue" component="span">
              {formatVnd(slice.amount)} · {Math.round((slice.amount / total) * 100)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
