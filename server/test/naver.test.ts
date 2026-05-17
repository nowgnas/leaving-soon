import { describe, expect, it } from "vitest";
import { normalizeNaverLocalItems } from "../src/naver.js";

describe("naver local search normalization", () => {
  it("removes html tags and keeps cafe-like local results", () => {
    const places = normalizeNaverLocalItems([
      {
        title: "<b>성수 브루잉</b> 카페",
        link: "https://example.com",
        category: "카페,디저트",
        description: "",
        telephone: "02-000-0000",
        address: "서울 성동구 성수동",
        roadAddress: "서울 성동구 연무장길 10",
        mapx: "1270123456",
        mapy: "375123456",
      },
      {
        title: "성수 음식점",
        link: "",
        category: "한식",
        description: "",
        telephone: "",
        address: "서울 성동구",
        roadAddress: "",
        mapx: "",
        mapy: "",
      },
    ]);

    expect(places).toEqual([
      {
        id: "naver-1270123456-375123456-성수 브루잉 카페",
        platform: "naver",
        place_name: "성수 브루잉 카페",
        address_name: "서울 성동구 성수동",
        road_address_name: "서울 성동구 연무장길 10",
        phone: "02-000-0000",
        category: "카페,디저트",
        x: "1270123456",
        y: "375123456",
      },
    ]);
  });
});
