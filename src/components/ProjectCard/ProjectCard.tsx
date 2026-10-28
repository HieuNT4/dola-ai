import { formatVnd } from "@/lib/money";
import type { ProjectRecord } from "@/lib/types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import "./ProjectCard.scss";

type ProjectCardProps = {
  project: ProjectRecord;
  revenue: number;
  expense: number;
};

export function ProjectCard({ project, revenue, expense }: ProjectCardProps) {
  const profit = revenue - expense;
  const profitClass = profit < 0 ? "ProjectCardProfit ProjectCardLoss" : "ProjectCardProfit";
  return (
    <Box className="ProjectCard" component={Link} href={`/projects/${project.id}`}>
      <Box className="ProjectCardTop">
        <Typography className="ProjectCardName" component="h3">
          {project.name}
        </Typography>
        {project.description ? (
          <Typography className="ProjectCardNote" component="p">
            {project.description}
          </Typography>
        ) : null}
      </Box>
      <Typography className={profitClass} component="p">
        {formatVnd(profit)}
      </Typography>
      <Box className="ProjectCardMeta">
        <Typography component="span">Thu {formatVnd(revenue)}</Typography>
        <Typography component="span">Chi {formatVnd(expense)}</Typography>
      </Box>
    </Box>
  );
}
