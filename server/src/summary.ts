import { getActiveReports, summarizeCafeReports } from "./domain.js";
import type { CafeReportSummary, SeatReport } from "./types.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiSummaryOptions = {
  now?: Date;
  generate?: (prompt: string) => Promise<string>;
};

export function buildRuleBasedSummary(reports: SeatReport[], now = new Date()): CafeReportSummary {
  return summarizeCafeReports(reports, now);
}

function buildPrompt(activeReports: SeatReport[]): string {
  const compactReports = activeReports.map((report) => ({
    leavingInMinutes: report.leavingInMinutes,
    seatCount: report.seatCount,
    hasOutlet: report.hasOutlet,
    seatSpace: report.seatSpace,
    crowdLevel: report.crowdLevel,
    hasWaiting: report.hasWaiting,
    note: report.note,
  }));

  return [
    "너는 카페 방문 결정을 도와주는 한국어 요약 도우미다.",
    "아래 자리 제보만 근거로 2문장 이내의 완성된 한국어 문장으로 요약한다.",
    "예약 가능, 좌석 보장처럼 확정적으로 말하지 않는다.",
    "방문자가 지금 갈지, 조금 기다릴지, 다른 카페를 볼지 판단할 수 있게 쓴다.",
    "과장하지 말고 친근하지만 간결하게 답한다.",
    "문장을 중간에 끊지 말고, 최소 25자 이상으로 답한다.",
    "예: 20분 안에 콘센트 있는 2인석이 비는 제보가 있어 노트북 작업 목적이면 방문을 고려할 만해요. 다만 웨이팅 제보가 있어 바로 앉기는 어려울 수 있어요.",
    "",
    `자리 제보 JSON: ${JSON.stringify(compactReports)}`,
  ].join("\n");
}

async function generateGeminiText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 180,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini summary failed with ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    throw new Error("Gemini summary returned empty text");
  }

  return text;
}

export async function summarizeCafeReportsWithGemini(
  reports: SeatReport[],
  options: GeminiSummaryOptions = {},
): Promise<CafeReportSummary> {
  const now = options.now ?? new Date();
  const ruleSummary = buildRuleBasedSummary(reports, now);
  const activeReports = getActiveReports(reports, now);

  if (activeReports.length === 0) {
    return ruleSummary;
  }

  try {
    const generate = options.generate ?? generateGeminiText;
    const message = (await generate(buildPrompt(activeReports))).trim();

    if (message.length < 25 || !/[.!?。요다]$/.test(message)) {
      return ruleSummary;
    }

    return {
      ...ruleSummary,
      message,
      source: "ai",
    };
  } catch (_error) {
    return ruleSummary;
  }
}
