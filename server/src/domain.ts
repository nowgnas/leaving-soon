import { z } from "zod";
import type { CafeReportSummary, CreateSeatReportInput, SeatReport } from "./types.js";

const REPORT_TTL_MINUTES = 30;

const integerLike = z.union([z.number().int(), z.string().min(1)]).transform((value, context) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "must be an integer",
    });
    return z.NEVER;
  }

  return parsed;
});

export const createSeatReportSchema = z.object({
  cafeName: z.string().trim().max(80).optional().default(""),
  leavingInMinutes: integerLike.refine((value) => value >= 1 && value <= 180, {
    message: "leavingInMinutes must be between 1 and 180",
  }),
  seatCount: integerLike.refine((value) => value >= 1 && value <= 8, {
    message: "seatCount must be between 1 and 8",
  }),
  hasOutlet: z.boolean().optional().default(false),
  seatSpace: z.enum(["wide", "normal", "narrow"]).optional().default("normal"),
  crowdLevel: z.enum(["relaxed", "normal", "busy"]).optional().default("normal"),
  hasWaiting: z.boolean().optional().default(false),
  note: z.string().trim().max(160).optional().default(""),
});

export function createSeatReport(
  cafeId: string,
  input: CreateSeatReportInput,
  now = new Date(),
): SeatReport {
  if (!cafeId || typeof cafeId !== "string") {
    throw new Error("cafeId is required");
  }

  const parsed = createSeatReportSchema.parse(input);
  const createdAt = new Date(now);
  const expiresAt = new Date(
    createdAt.getTime() + (parsed.leavingInMinutes + REPORT_TTL_MINUTES) * 60 * 1000,
  );

  return {
    id: `report-${createdAt.getTime()}-${crypto.randomUUID().slice(0, 8)}`,
    cafeId,
    cafeName: parsed.cafeName,
    leavingInMinutes: parsed.leavingInMinutes,
    seatCount: parsed.seatCount,
    hasOutlet: parsed.hasOutlet,
    seatSpace: parsed.seatSpace,
    crowdLevel: parsed.crowdLevel,
    hasWaiting: parsed.hasWaiting,
    note: parsed.note,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function getActiveReports(reports: SeatReport[], now = new Date()): SeatReport[] {
  const nowTime = new Date(now).getTime();

  return reports
    .filter((report) => new Date(report.expiresAt).getTime() > nowTime)
    .slice()
    .sort((left, right) => {
      if (left.leavingInMinutes !== right.leavingInMinutes) {
        return left.leavingInMinutes - right.leavingInMinutes;
      }

      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });
}

export function summarizeCafeReports(reports: SeatReport[], now = new Date()): CafeReportSummary {
  const activeReports = getActiveReports(reports, now);
  const leavingSoonCount = activeReports.filter((report) => report.leavingInMinutes <= 30).length;
  const outletSeatCount = activeReports.filter((report) => report.hasOutlet).length;
  const hasWaiting = activeReports.some((report) => report.hasWaiting);

  if (activeReports.length === 0) {
    return {
      activeCount: 0,
      leavingSoonCount: 0,
      outletSeatCount: 0,
      hasWaiting: false,
      message: "아직 제보된 정보가 없어요.",
      source: "rule",
    };
  }

  const parts = [
    `현재 유효한 자리 제보가 ${activeReports.length}건 있어요.`,
    `30분 이내에 나가는 제보가 ${leavingSoonCount}건입니다.`,
  ];

  if (outletSeatCount > 0) {
    parts.push(`콘센트가 있는 자리 ${outletSeatCount}건이 있어 노트북 작업에 참고할 수 있어요.`);
  }

  if (hasWaiting) {
    parts.push("웨이팅 제보가 있어 바로 앉기는 어려울 수 있어요.");
  } else {
    parts.push("웨이팅 제보는 아직 없어요.");
  }

  return {
    activeCount: activeReports.length,
    leavingSoonCount,
    outletSeatCount,
    hasWaiting,
    message: parts.join(" "),
    source: "rule",
  };
}
