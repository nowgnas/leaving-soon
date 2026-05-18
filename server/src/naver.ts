export type NaverLocalItem = {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
};

export type CafePlace = {
  id: string;
  platform: "naver";
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  category: string;
  x: string;
  y: string;
};

type NaverLocalResponse = {
  items?: NaverLocalItem[];
};

const NAVER_LOCAL_SEARCH_URL = "https://openapi.naver.com/v1/search/local.json";

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
}

function isCafeLike(item: NaverLocalItem): boolean {
  const category = stripHtml(item.category);
  const title = stripHtml(item.title);

  return /카페|디저트|커피|coffee|cafe/i.test(`${category} ${title}`);
}

export function normalizeNaverLocalItems(items: NaverLocalItem[]): CafePlace[] {
  return items.filter(isCafeLike).map((item) => {
    const name = stripHtml(item.title);
    const x = item.mapx || "";
    const y = item.mapy || "";

    return {
      id: `naver-${x}-${y}`,
      platform: "naver",
      place_name: name,
      address_name: stripHtml(item.address || ""),
      road_address_name: stripHtml(item.roadAddress || item.address || ""),
      phone: stripHtml(item.telephone || ""),
      category: stripHtml(item.category || ""),
      x,
      y,
    };
  });
}

export async function searchNaverCafes(query: string): Promise<CafePlace[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_CLIENT_ID and NAVER_CLIENT_SECRET are required");
  }

  const params = new URLSearchParams({
    query,
    display: "10",
    start: "1",
    sort: "random",
  });

  const response = await fetch(`${NAVER_LOCAL_SEARCH_URL}?${params.toString()}`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!response.ok) {
    throw new Error(`Naver Local Search failed with ${response.status}`);
  }

  const payload = (await response.json()) as NaverLocalResponse;
  return normalizeNaverLocalItems(payload.items ?? []);
}
