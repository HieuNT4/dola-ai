"use client";

import { ProjectBoard } from "@/components/ProjectBoard/ProjectBoard";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  return <ProjectBoard projectId={projectId} />;
}
