import { getActiveReports } from "./domain.js";
import type { ActiveCafeSummary, SeatReport } from "./types.js";

type ReportRow = {
  id: string;
  cafe_id: string;
  cafe_name: string;
  leaving_in_minutes: number;
  seat_count: number;
  has_outlet: boolean;
  seat_space: SeatReport["seatSpace"];
  crowd_level: SeatReport["crowdLevel"];
  has_waiting: boolean;
  note: string;
  created_at: string;
  expires_at: string;
};

type ReportStore = {
  saveReport(report: SeatReport): Promise<void>;
  listActiveReports(cafeId: string, now?: Date): Promise<SeatReport[]>;
  listActiveCafes(now?: Date): Promise<ActiveCafeSummary[]>;
  deleteExpiredReports(cutoff: Date): Promise<number>;
};

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

function toRow(report: SeatReport): ReportRow {
  return {
    id: report.id,
    cafe_id: report.cafeId,
    cafe_name: report.cafeName,
    leaving_in_minutes: report.leavingInMinutes,
    seat_count: report.seatCount,
    has_outlet: report.hasOutlet,
    seat_space: report.seatSpace,
    crowd_level: report.crowdLevel,
    has_waiting: report.hasWaiting,
    note: report.note,
    created_at: report.createdAt,
    expires_at: report.expiresAt,
  };
}

function fromRow(row: ReportRow): SeatReport {
  return {
    id: row.id,
    cafeId: row.cafe_id,
    cafeName: row.cafe_name,
    leavingInMinutes: row.leaving_in_minutes,
    seatCount: row.seat_count,
    hasOutlet: row.has_outlet,
    seatSpace: row.seat_space,
    crowdLevel: row.crowd_level,
    hasWaiting: row.has_waiting,
    note: row.note,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

function summarizeActiveCafes(reports: SeatReport[], now = new Date()): ActiveCafeSummary[] {
  const activeReports = getActiveReports(reports, now);
  const cafes = new Map<string, ActiveCafeSummary>();

  for (const report of activeReports) {
    const existing = cafes.get(report.cafeId);

    if (!existing) {
      cafes.set(report.cafeId, {
        cafeId: report.cafeId,
        cafeName: report.cafeName,
        activeCount: 1,
        latestCreatedAt: report.createdAt,
      });
      continue;
    }

    const latestCreatedAt =
      new Date(report.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()
        ? report.createdAt
        : existing.latestCreatedAt;

    cafes.set(report.cafeId, {
      cafeId: report.cafeId,
      cafeName: new Date(report.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime() ? report.cafeName : existing.cafeName,
      activeCount: existing.activeCount + 1,
      latestCreatedAt,
    });
  }

  return Array.from(cafes.values()).sort((left, right) => {
    if (right.activeCount !== left.activeCount) {
      return right.activeCount - left.activeCount;
    }

    const latestDiff = new Date(right.latestCreatedAt).getTime() - new Date(left.latestCreatedAt).getTime();
    if (latestDiff !== 0) {
      return latestDiff;
    }

    return left.cafeName.localeCompare(right.cafeName, "ko");
  });
}

function createSupabaseHeaders(serviceRoleKey: string): HeadersInit {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function createSupabaseReportStore(
  config: SupabaseConfig,
  fetchImpl: typeof fetch = fetch,
): ReportStore {
  const baseUrl = config.url.replace(/\/$/, "");
  const headers = createSupabaseHeaders(config.serviceRoleKey);

  return {
    async saveReport(report: SeatReport) {
      const response = await fetchImpl(`${baseUrl}/rest/v1/seat_reports`, {
        method: "POST",
        headers,
        body: JSON.stringify([toRow(report)]),
      });

      if (!response.ok) {
        throw new Error(`Failed to save report: ${response.status}`);
      }
    },
    async listActiveReports(cafeId: string, now = new Date()) {
      const url = new URL(`${baseUrl}/rest/v1/seat_reports`);
      url.searchParams.set("select", "*");
      url.searchParams.set("cafe_id", `eq.${cafeId}`);
      url.searchParams.set("expires_at", `gt.${now.toISOString()}`);
      url.searchParams.set("order", "leaving_in_minutes.asc,created_at.asc");

      const response = await fetchImpl(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load active reports: ${response.status}`);
      }

      const payload = (await response.json()) as ReportRow[];
      return payload.map(fromRow);
    },
    async listActiveCafes(now = new Date()) {
      const url = new URL(`${baseUrl}/rest/v1/seat_reports`);
      url.searchParams.set("select", "*");
      url.searchParams.set("expires_at", `gt.${now.toISOString()}`);
      url.searchParams.set("order", "created_at.desc");

      const response = await fetchImpl(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load active cafes: ${response.status}`);
      }

      const payload = (await response.json()) as ReportRow[];
      return summarizeActiveCafes(payload.map(fromRow), now);
    },
    async deleteExpiredReports(cutoff: Date) {
      const url = new URL(`${baseUrl}/rest/v1/seat_reports`);
      url.searchParams.set("expires_at", `lt.${cutoff.toISOString()}`);

      const response = await fetchImpl(url, {
        method: "DELETE",
        headers: {
          ...headers,
          Prefer: "count=exact",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete expired reports: ${response.status}`);
      }

      const contentRange = response.headers.get("content-range");
      if (!contentRange) {
        return 0;
      }

      const total = contentRange.split("/").at(-1);
      const parsed = total ? Number.parseInt(total, 10) : Number.NaN;
      return Number.isFinite(parsed) ? parsed : 0;
    },
  };
}

function createMemoryReportStore(): ReportStore {
  const reportsByCafe = new Map<string, SeatReport[]>();

  return {
    async saveReport(report: SeatReport) {
      const reports = reportsByCafe.get(report.cafeId) ?? [];
      reportsByCafe.set(report.cafeId, [report, ...reports]);
    },
    async listActiveReports(cafeId: string, now = new Date()) {
      const reports = reportsByCafe.get(cafeId) ?? [];
      return getActiveReports(reports, now);
    },
    async listActiveCafes(now = new Date()) {
      const allReports = Array.from(reportsByCafe.values()).flat();
      return summarizeActiveCafes(allReports, now);
    },
    async deleteExpiredReports(cutoff: Date) {
      let deleted = 0;

      for (const [cafeId, reports] of reportsByCafe.entries()) {
        const retained = reports.filter((report) => new Date(report.expiresAt).getTime() >= cutoff.getTime());
        deleted += reports.length - retained.length;
        if (retained.length === 0) {
          reportsByCafe.delete(cafeId);
        } else {
          reportsByCafe.set(cafeId, retained);
        }
      }

      return deleted;
    },
  };
}

export function createReportStore(
  config: Partial<SupabaseConfig> = {},
  fetchImpl: typeof fetch = fetch,
): ReportStore {
  if (config.url && config.serviceRoleKey) {
    return createSupabaseReportStore(config as SupabaseConfig, fetchImpl);
  }

  return createMemoryReportStore();
}
