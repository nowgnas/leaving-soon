import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("report routes", () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("normalizes legacy Naver cafe IDs before saving reports", async () => {
    const app = buildApp();
    await app.ready();

    const response = await app.inject({
      method: "POST",
      url: "/api/cafes/naver-1270574118-375428659-%EC%A0%A0%EC%A0%A0%20%EC%84%B1%EC%88%98%EC%A0%90/reports",
      payload: {
        cafeName: "젠젠 성수점",
        leavingInMinutes: 20,
        seatCount: 2,
      },
    });

    await app.close();

    expect(response.statusCode).toBe(201);
    expect(response.json().report.cafeId).toBe("naver-1270574118-375428659");
  });

  it("normalizes legacy Naver cafe IDs before loading reports", async () => {
    const app = buildApp();
    await app.ready();

    await app.inject({
      method: "POST",
      url: "/api/cafes/naver-1270574118-375428659/reports",
      payload: {
        cafeName: "젠젠 성수점",
        leavingInMinutes: 20,
        seatCount: 2,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/cafes/naver-1270574118-375428659-%EC%A0%A0%EC%A0%A0%20%EC%84%B1%EC%88%98%EC%A0%90/reports",
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json().cafeId).toBe("naver-1270574118-375428659");
    expect(response.json().reports).toHaveLength(1);
  });
});
