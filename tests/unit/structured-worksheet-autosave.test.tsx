import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveStructuredWorksheetAction } from "@/app/actions/worksheet";
import {
  STRUCTURED_AUTOSAVE_DELAY_MS,
  StructuredWorksheetForm,
} from "@/components/workbook/StructuredWorksheetForm";
import { createEmptyStructuredContent } from "@/domain/worksheets/structured-worksheets";

vi.mock("@/app/actions/worksheet", () => ({
  saveStructuredWorksheetAction: vi.fn(),
}));

const mockedSave = vi.mocked(saveStructuredWorksheetAction);
const projectId = "2f29b16e-cd44-4a7e-9a84-a358902794e8";

describe("structured worksheet autosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedSave.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("saves Literature Map after the debounce period with its module code", async () => {
    mockedSave.mockResolvedValue({
      ok: true,
      data: { updatedAt: "2026-08-26T01:00:00.000Z", completionPercent: 20, status: "in_progress" },
    });
    render(
      <StructuredWorksheetForm
        projectId={projectId}
        moduleCode="literature"
        initialContent={createEmptyStructuredContent("literature")}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apa temuan utama penelitian terdahulu?"), {
      target: { value: "Temuan terpetakan" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRUCTURED_AUTOSAVE_DELAY_MS);
    });

    expect(mockedSave).toHaveBeenCalledWith(expect.objectContaining({
      projectId,
      moduleCode: "literature",
      content: expect.objectContaining({ key_findings: "Temuan terpetakan" }),
    }));
    expect(screen.getByText("Tersimpan otomatis di database")).toBeVisible();
  });

  it("shows a retry control after a Gap Detector network failure", async () => {
    mockedSave.mockRejectedValueOnce(new Error("offline"));
    render(
      <StructuredWorksheetForm
        projectId={projectId}
        moduleCode="gap"
        initialContent={createEmptyStructuredContent("gap")}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apa yang sudah diketahui?"), {
      target: { value: "Pengetahuan mapan" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRUCTURED_AUTOSAVE_DELAY_MS);
    });

    expect(screen.getByText("Koneksi ke server terputus. Perubahan belum tersimpan.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Coba Lagi" })).toBeVisible();
  });

  it("saves Article Blueprint with the shared autosave action", async () => {
    mockedSave.mockResolvedValue({
      ok: true,
      data: { updatedAt: "2026-08-26T02:00:00.000Z", completionPercent: 20, status: "in_progress" },
    });
    render(
      <StructuredWorksheetForm
        projectId={projectId}
        moduleCode="blueprint"
        initialContent={createEmptyStructuredContent("blueprint")}
        initialUpdatedAt={null}
      />,
    );

    const titleField = screen.getByLabelText("Apa judul kerja manuskrip Anda?");
    expect(titleField).toHaveAttribute("maxlength", "500");
    fireEvent.change(titleField, { target: { value: "Kerangka Artikel SCOPUS READY" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRUCTURED_AUTOSAVE_DELAY_MS);
    });

    expect(mockedSave).toHaveBeenCalledWith(expect.objectContaining({
      moduleCode: "blueprint",
      content: expect.objectContaining({ working_title: "Kerangka Artikel SCOPUS READY" }),
    }));
  });

  it("saves Scientific Story through the same autosave boundary", async () => {
    mockedSave.mockResolvedValue({
      ok: true,
      data: { updatedAt: "2026-08-26T03:00:00.000Z", completionPercent: 20, status: "in_progress" },
    });
    render(
      <StructuredWorksheetForm
        projectId={projectId}
        moduleCode="scientific_story"
        initialContent={createEmptyStructuredContent("scientific_story")}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apa pesan ilmiah utama manuskrip Anda?"), {
      target: { value: "Pendampingan adaptif memperkuat keterlibatan." },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRUCTURED_AUTOSAVE_DELAY_MS);
    });

    expect(mockedSave).toHaveBeenCalledWith(expect.objectContaining({
      moduleCode: "scientific_story",
      content: expect.objectContaining({ central_message: "Pendampingan adaptif memperkuat keterlibatan." }),
    }));
  });

  it("saves Internal Review without granting completion on the client", async () => {
    mockedSave.mockResolvedValue({
      ok: true,
      data: { updatedAt: "2026-08-26T04:00:00.000Z", completionPercent: 20, status: "in_progress" },
    });
    render(
      <StructuredWorksheetForm
        projectId={projectId}
        moduleCode="internal_review"
        initialContent={createEmptyStructuredContent("internal_review")}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apakah manuskrip selaras dengan scope jurnal target?"), {
      target: { value: "Scope dan audiens jurnal telah sesuai." },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(STRUCTURED_AUTOSAVE_DELAY_MS);
    });

    expect(mockedSave).toHaveBeenCalledWith(expect.objectContaining({ moduleCode: "internal_review" }));
    expect(screen.getByText("Tersimpan otomatis di database")).toBeVisible();
  });
});
