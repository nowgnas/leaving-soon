export type SeatSpace = "wide" | "normal" | "narrow";
export type CrowdLevel = "relaxed" | "normal" | "busy";

export type SeatReport = {
  id: string;
  cafeId: string;
  cafeName: string;
  leavingInMinutes: number;
  seatCount: number;
  hasOutlet: boolean;
  seatSpace: SeatSpace;
  crowdLevel: CrowdLevel;
  hasWaiting: boolean;
  note: string;
  createdAt: string;
  expiresAt: string;
};

export type ActiveCafeSummary = {
  cafeId: string;
  cafeName: string;
  activeCount: number;
  latestCreatedAt: string;
};

export type CafeReportSummary = {
  activeCount: number;
  leavingSoonCount: number;
  outletSeatCount: number;
  hasWaiting: boolean;
  message: string;
  source: "ai" | "rule";
};

export type CreateSeatReportInput = {
  cafeName?: string;
  leavingInMinutes: number | string;
  seatCount: number | string;
  hasOutlet?: boolean;
  seatSpace?: SeatSpace;
  crowdLevel?: CrowdLevel;
  hasWaiting?: boolean;
  note?: string;
};
