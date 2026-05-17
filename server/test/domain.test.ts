import { describe, expect, it } from "vitest";
import { createSeatReport, getActiveReports, summarizeCafeReports } from "../src/domain.js";

describe("seat report domain", () => {
  it("normalizes a valid leaving-soon report", () => {
    const report = createSeatReport(
      "place-123",
      {
        cafeName: "테스트 카페",
        leavingInMinutes: "20",
        seatCount: "2",
        hasOutlet: true,
        seatSpace: "wide",
        crowdLevel: "normal",
        hasWaiting: false,
        note: "창가 자리입니다.",
      },
      new Date("2026-05-16T12:00:00.000Z"),
    );

    expect(report).toMatchObject({
      cafeId: "place-123",
      cafeName: "테스트 카페",
      leavingInMinutes: 20,
      seatCount: 2,
      hasOutlet: true,
      seatSpace: "wide",
      crowdLevel: "normal",
      hasWaiting: false,
      note: "창가 자리입니다.",
      expiresAt: "2026-05-16T12:50:00.000Z",
    });
  });

  it("rejects invalid required fields", () => {
    expect(() => createSeatReport("", { leavingInMinutes: 20, seatCount: 2 })).toThrow("cafeId is required");
    expect(() => createSeatReport("place-123", { leavingInMinutes: 181, seatCount: 2 })).toThrow(
      "leavingInMinutes must be between 1 and 180",
    );
    expect(() => createSeatReport("place-123", { leavingInMinutes: 20, seatCount: 9 })).toThrow(
      "seatCount must be between 1 and 8",
    );
  });

  it("filters expired reports and sorts by soonest leaving time", () => {
    const now = new Date("2026-05-16T12:00:00.000Z");
    const reports = [
      createSeatReport("cafe-a", { leavingInMinutes: 40, seatCount: 2 }, now),
      createSeatReport("cafe-a", { leavingInMinutes: 10, seatCount: 1 }, now),
      {
        ...createSeatReport("cafe-a", { leavingInMinutes: 5, seatCount: 4 }, now),
        expiresAt: "2026-05-16T11:59:00.000Z",
      },
    ];

    expect(getActiveReports(reports, now).map((report) => report.leavingInMinutes)).toEqual([10, 40]);
  });

  it("gives a practical visitor summary", () => {
    const now = new Date("2026-05-16T12:00:00.000Z");
    const reports = [
      createSeatReport(
        "cafe-a",
        {
          leavingInMinutes: 20,
          seatCount: 2,
          hasOutlet: true,
          seatSpace: "wide",
          crowdLevel: "busy",
          hasWaiting: true,
        },
        now,
      ),
      createSeatReport(
        "cafe-a",
        {
          leavingInMinutes: 45,
          seatCount: 4,
          hasOutlet: false,
          seatSpace: "normal",
          crowdLevel: "normal",
          hasWaiting: false,
        },
        now,
      ),
    ];

    const summary = summarizeCafeReports(reports, now);

    expect(summary.activeCount).toBe(2);
    expect(summary.leavingSoonCount).toBe(1);
    expect(summary.outletSeatCount).toBe(1);
    expect(summary.message).toContain("30분 이내에 나가는 제보가 1건");
    expect(summary.message).toContain("콘센트가 있는 자리 1건");
    expect(summary.message).toContain("웨이팅 제보가 있어");
  });

  it("returns a no-report message when there are no active reports", () => {
    const summary = summarizeCafeReports([], new Date("2026-05-16T12:00:00.000Z"));

    expect(summary.activeCount).toBe(0);
    expect(summary.leavingSoonCount).toBe(0);
    expect(summary.outletSeatCount).toBe(0);
    expect(summary.hasWaiting).toBe(false);
    expect(summary.source).toBe("rule");
    expect(summary.message).toBe("아직 제보된 정보가 없어요.");
  });
});
