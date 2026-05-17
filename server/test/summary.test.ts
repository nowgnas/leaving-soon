import { describe, expect, it } from "vitest";
import { buildRuleBasedSummary, summarizeCafeReportsWithGemini } from "../src/summary.js";
import type { SeatReport } from "../src/types.js";

const reports: SeatReport[] = [
  {
    id: "report-1",
    cafeId: "cafe-1",
    cafeName: "테스트 카페",
    leavingInMinutes: 20,
    seatCount: 2,
    hasOutlet: true,
    seatSpace: "wide",
    crowdLevel: "busy",
    hasWaiting: true,
    note: "창가 자리입니다.",
    createdAt: "2026-05-17T01:00:00.000Z",
    expiresAt: "2026-05-17T01:50:00.000Z",
  },
];

describe("AI cafe summary", () => {
  it("builds a rule-based summary with source metadata", () => {
    const summary = buildRuleBasedSummary(reports, new Date("2026-05-17T01:10:00.000Z"));

    expect(summary.source).toBe("rule");
    expect(summary.activeCount).toBe(1);
    expect(summary.leavingSoonCount).toBe(1);
    expect(summary.message).toContain("30분 이내");
  });

  it("uses Gemini text when a client returns a valid summary", async () => {
    const summary = await summarizeCafeReportsWithGemini(reports, {
      now: new Date("2026-05-17T01:10:00.000Z"),
      generate: async () => "20분 안에 콘센트 있는 2인석이 비는 제보가 있어 방문을 고려할 만해요.",
    });

    expect(summary.source).toBe("ai");
    expect(summary.message).toBe("20분 안에 콘센트 있는 2인석이 비는 제보가 있어 방문을 고려할 만해요.");
    expect(summary.activeCount).toBe(1);
  });

  it("falls back to rule summary when Gemini fails", async () => {
    const summary = await summarizeCafeReportsWithGemini(reports, {
      now: new Date("2026-05-17T01:10:00.000Z"),
      generate: async () => {
        throw new Error("Gemini unavailable");
      },
    });

    expect(summary.source).toBe("rule");
    expect(summary.message).toContain("현재 유효한 자리 제보가 1건");
  });

  it("falls back to rule summary when Gemini returns an incomplete sentence", async () => {
    const summary = await summarizeCafeReportsWithGemini(reports, {
      now: new Date("2026-05-17T01:10:00.000Z"),
      generate: async () => "현재 카페는",
    });

    expect(summary.source).toBe("rule");
    expect(summary.message).toContain("현재 유효한 자리 제보가 1건");
  });
});
