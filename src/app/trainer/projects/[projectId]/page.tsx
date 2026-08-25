import { redirect } from "next/navigation";
export default async function TrainerProjectPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; redirect(`/trainer/projects/${projectId}/problem`); }
