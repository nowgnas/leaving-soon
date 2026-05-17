import { describe, expect, it } from "vitest";
import { createReportStore } from "../src/repository.js";
import type { SeatReport } from "../src/types.js";

const report: SeatReport = {
  id: "report-1",
  cafeId: "cafe-1",
  cafeName: "테스트 카페",
  leavingInMinutes: 20,
  seatCount: 2,
  hasOutlet: true,
  seatSpace: "wide",
  crowdLevel: "normal",
  hasWaiting: false,
  note: "창가 자리입니다.",
  createdAt: "2026-05-17T01:00:00.000Z",
  expiresAt: "2026-05-17T01:50:00.000Z",
};

describe("report repository", () => {
  it("stores and returns active reports in memory", async () => {
    const store = createReportStore();

    await store.saveReport(report);
    const active = await store.listActiveReports("cafe-1", new Date("2026-05-17T01:10:00.000Z"));

    expect(active).toEqual([report]);
  });

  it("deletes expired reports while keeping recent ones", async () => {
    const store = createReportStore();
    const oldReport = {
      ...report,
      id: "report-old",
      expiresAt: "2026-05-16T01:00:00.000Z",
    };
    const freshReport = {
      ...report,
      id: "report-fresh",
      expiresAt: "2026-05-18T01:00:00.000Z",
    };

    await store.saveReport(oldReport);
    await store.saveReport(freshReport);

    const deleted = await store.deleteExpiredReports(new Date("2026-05-17T12:00:00.000Z"));
    const active = await store.listActiveReports("cafe-1", new Date("2026-05-17T12:00:00.000Z"));

    expect(deleted).toBe(1);
    expect(active).toEqual([freshReport]);
  });
});
