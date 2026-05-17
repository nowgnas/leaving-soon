import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { createSeatReport, getActiveReports } from "./domain.js";
import { searchNaverCafes } from "./naver.js";
import { summarizeCafeReportsWithGemini } from "./summary.js";
import type { SeatReport } from "./types.js";

type ReportParams = {
  cafeId: string;
};

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false,
  });
  const reportsByCafe = new Map<string, SeatReport[]>();

  void app.register(cors, {
    origin: true,
  });

  app.get("/api/health", async () => {
    return {
      status: "ok",
      service: "leaving-soon",
    };
  });

  app.get<{ Querystring: { query?: string } }>("/api/cafes/search", async (request, reply) => {
    const query = request.query.query?.trim();

    if (!query) {
      return reply.code(400).send({
        error: {
          code: "INVALID_QUERY",
          message: "query is required",
        },
      });
    }

    try {
      return {
        items: await searchNaverCafes(query.includes("카페") ? query : `${query} 카페`),
      };
    } catch (error) {
      return reply.code(502).send({
        error: {
          code: "NAVER_SEARCH_FAILED",
          message: error instanceof Error ? error.message : "Naver cafe search failed",
        },
      });
    }
  });

  app.get<{ Params: ReportParams }>("/api/cafes/:cafeId/reports", async (request) => {
    const cafeId = request.params.cafeId;
    const reports = reportsByCafe.get(cafeId) ?? [];
    const activeReports = getActiveReports(reports);

    return {
      cafeId,
      reports: activeReports,
      summary: await summarizeCafeReportsWithGemini(activeReports),
    };
  });

  app.post<{ Params: ReportParams; Body: unknown }>("/api/cafes/:cafeId/reports", async (request, reply) => {
    try {
      const cafeId = request.params.cafeId;
      const reports = reportsByCafe.get(cafeId) ?? [];
      const report = createSeatReport(cafeId, request.body as never);
      const updatedReports = [report, ...reports];
      reportsByCafe.set(cafeId, updatedReports);

      return reply.code(201).send({
        report,
      });
    } catch (error) {
      if (error instanceof ZodError || error instanceof Error) {
        return reply.code(400).send({
          error: {
            code: "INVALID_REPORT",
            message: error.message,
          },
        });
      }

      throw error;
    }
  });

  return app;
}
