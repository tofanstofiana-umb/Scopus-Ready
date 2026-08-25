import { redirect } from "next/navigation";
import { ProblemBuilderPreview } from "@/components/workbook/ProblemBuilderPreview";

export default async function LegacyWorkbookModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;

  if (module === "problem-builder") {
    return <ProblemBuilderPreview />;
  }

  redirect("/workbook/problem-builder");
}
