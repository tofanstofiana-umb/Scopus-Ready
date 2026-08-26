import { redirect } from "next/navigation";

export default async function ProjectFeedbackPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/workbook/problem`);
}
