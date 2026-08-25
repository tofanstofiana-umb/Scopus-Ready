import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveProblemBuilderAction } from "@/app/actions/worksheet";
import {
  AUTOSAVE_DELAY_MS,
  ProblemBuilderForm,
} from "@/components/workbook/ProblemBuilderForm";

vi.mock("@/app/actions/worksheet", () => ({
  saveProblemBuilderAction: vi.fn(),
}));

const mockedSave = vi.mocked(saveProblemBuilderAction);
const emptyContent = {
  topic: "",
  phenomenon: "",
  problem: "",
  evidence: "",
  importance: "",
};

const successResult = {
  ok: true as const,
  data: {
    updatedAt: "2026-08-26T01:00:00.000Z",
    completionPercent: 20,
    status: "in_progress" as const,
  },
};

describe("Problem Builder autosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedSave.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("waits for the debounce period before saving", async () => {
    mockedSave.mockResolvedValue(successResult);
    render(
      <ProblemBuilderForm
        projectId="2f29b16e-cd44-4a7e-9a84-a358902794e8"
        initialContent={emptyContent}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apa topik penelitian Anda?"), {
      target: { value: "Topik baru" },
    });
    expect(screen.getByText("Menunggu autosave...")).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS - 1);
    });
    expect(mockedSave).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(mockedSave).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Tersimpan otomatis di database")).toBeVisible();
  });

  it("serializes saves when content changes during an active request", async () => {
    let finishFirstSave: ((value: typeof successResult) => void) | undefined;
    mockedSave
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          finishFirstSave = resolve;
        }),
      )
      .mockResolvedValueOnce({
        ...successResult,
        data: { ...successResult.data, updatedAt: "2026-08-26T01:00:01.000Z", completionPercent: 40 },
      });

    render(
      <ProblemBuilderForm
        projectId="2f29b16e-cd44-4a7e-9a84-a358902794e8"
        initialContent={emptyContent}
        initialUpdatedAt={null}
      />,
    );
    fireEvent.change(screen.getByLabelText("Apa topik penelitian Anda?"), {
      target: { value: "Topik pertama" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(mockedSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Buka langkah 2" }));
    fireEvent.change(screen.getByLabelText("Fenomena apa yang sedang terjadi?"), {
      target: { value: "Fenomena terbaru" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(mockedSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishFirstSave?.(successResult);
      await Promise.resolve();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(mockedSave).toHaveBeenCalledTimes(2);
  });

  it("allows a failed autosave to be retried", async () => {
    mockedSave
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(successResult);
    render(
      <ProblemBuilderForm
        projectId="2f29b16e-cd44-4a7e-9a84-a358902794e8"
        initialContent={emptyContent}
        initialUpdatedAt={null}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apa topik penelitian Anda?"), {
      target: { value: "Topik retry" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(screen.getByText("Koneksi ke server terputus. Perubahan belum tersimpan.")).toBeVisible();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Coba Lagi" }));
      await Promise.resolve();
    });
    expect(mockedSave).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Tersimpan otomatis di database")).toBeVisible();
  });
});
