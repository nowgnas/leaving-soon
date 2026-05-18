import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Coffee, MapPin, Plug, Search, Sparkles, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type Mode = "landing" | "visitor" | "reporter";
type SeatSpace = "wide" | "normal" | "narrow";
type CrowdLevel = "relaxed" | "normal" | "busy";

type Cafe = {
  id: string;
  platform?: "naver" | "sample";
  place_name: string;
  address_name?: string;
  road_address_name?: string;
  phone?: string;
  category?: string;
};

type SeatReport = {
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
};

type ReportResponse = {
  cafeId: string;
  reports: SeatReport[];
  summary: {
    activeCount: number;
    leavingSoonCount: number;
    outletSeatCount: number;
    hasWaiting: boolean;
    message: string;
  };
};

const fallbackCafes: Cafe[] = [
  {
    id: "sample-seongsu-1",
    place_name: "성수 브루잉 라운지",
    address_name: "서울 성동구 성수동",
    road_address_name: "서울 성동구 연무장길 10",
    phone: "02-000-0001",
  },
  {
    id: "sample-hapjeong-1",
    place_name: "합정 워크 커피",
    address_name: "서울 마포구 합정동",
    road_address_name: "서울 마포구 독막로 22",
    phone: "02-000-0002",
  },
  {
    id: "sample-gangnam-1",
    place_name: "강남 플러그 카페",
    address_name: "서울 강남구 역삼동",
    road_address_name: "서울 강남구 테헤란로 101",
    phone: "02-000-0003",
  },
];

function getCafeAddress(cafe: Cafe) {
  return cafe.road_address_name || cafe.address_name || "주소 정보 없음";
}

function getSeatSpaceLabel(seatSpace: SeatSpace) {
  if (seatSpace === "wide") {
    return "넓은 자리";
  }

  if (seatSpace === "narrow") {
    return "좁은 자리";
  }

  return "보통 자리";
}

async function fetchCafeReports(cafeId: string): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE}/api/cafes/${encodeURIComponent(cafeId)}/reports`);

  if (!response.ok) {
    throw new Error("제보를 불러오지 못했습니다.");
  }

  return response.json();
}

async function fetchCafeSearch(query: string): Promise<Cafe[]> {
  const response = await fetch(`${API_BASE}/api/cafes/search?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "네이버 카페 검색을 사용할 수 없어 샘플 카페를 보여줍니다.");
  }

  const payload = (await response.json()) as { items: Cafe[] };
  return payload.items;
}

export default function App() {
  const [mode, setMode] = useState<Mode>("landing");
  const [keyword, setKeyword] = useState("");
  const [cafes, setCafes] = useState<Cafe[]>(fallbackCafes);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [message, setMessage] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [seatSpace, setSeatSpace] = useState<SeatSpace>("normal");
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>("normal");
  const [hasSubmittedReport, setHasSubmittedReport] = useState(false);

  const title = mode === "reporter" ? "내 자리 제보하기" : "갈 카페 찾기";
  const modeLabel = mode === "reporter" ? "곧 나가요" : "카페 갈래요";

  const selectedAddress = useMemo(() => {
    return selectedCafe ? getCafeAddress(selectedCafe) : "";
  }, [selectedCafe]);

  async function selectCafe(cafe: Cafe) {
    setSelectedCafe(cafe);
    setMessage("");
    setHasSubmittedReport(false);
    if (mode === "visitor") {
      try {
        setReportData(await fetchCafeReports(cafe.id));
      } catch (error) {
        setReportData(null);
        setMessage(error instanceof Error ? error.message : "제보를 불러오지 못했습니다.");
      }
      return;
    }

    setReportData(null);
  }

  async function searchCafes() {
    const searchKeyword = keyword.trim() || "카페";
    setIsSearching(true);
    setSearchMessage("");
    setMessage("");

    try {
      const results = await fetchCafeSearch(searchKeyword);
      setCafes(results.length > 0 ? results : fallbackCafes);
      setSelectedCafe(null);
      setReportData(null);
      setHasSubmittedReport(false);
      setSearchMessage(results.length > 0 ? `${results.length}곳을 찾았습니다.` : "검색 결과가 없어 샘플 카페를 보여줍니다.");
    } catch (error) {
      const filtered = fallbackCafes.filter((cafe) => {
        return (
          searchKeyword === "카페" ||
          cafe.place_name.includes(searchKeyword) ||
          (cafe.address_name ?? "").includes(searchKeyword) ||
          (cafe.road_address_name ?? "").includes(searchKeyword)
        );
      });
      setCafes(filtered.length > 0 ? filtered : fallbackCafes);
      setSelectedCafe(null);
      setReportData(null);
      setHasSubmittedReport(false);
      setSearchMessage(error instanceof Error ? error.message : "네이버 카페 검색을 사용할 수 없어 샘플 카페를 보여줍니다.");
    } finally {
      setIsSearching(false);
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCafe) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${API_BASE}/api/cafes/${encodeURIComponent(selectedCafe.id)}/reports`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        cafeName: selectedCafe.place_name,
        leavingInMinutes: formData.get("leavingInMinutes"),
        seatCount: formData.get("seatCount"),
        seatSpace,
        crowdLevel,
        hasOutlet: formData.has("hasOutlet"),
        hasWaiting: formData.has("hasWaiting"),
        note: formData.get("note"),
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error?.message ?? "제보 등록에 실패했습니다.");
      return;
    }

    event.currentTarget.reset();
    setSeatSpace("normal");
    setCrowdLevel("normal");
    setHasSubmittedReport(true);
    setMessage("곧 나가요가 등록되었습니다.");
  }

  if (mode === "landing") {
    return (
      <main className="min-h-dvh px-4 py-5 text-foreground sm:px-6">
        <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-md content-center gap-7 sm:max-w-2xl">
          <div className="grid gap-6">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-coffee-900 text-white shadow-sm">
                  <Coffee className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-coffee-900">곧나가요</p>
                  <p className="text-xs text-stone-500">카페 자리 제보</p>
                </div>
              </div>
            </header>

            <div className="grid gap-3">
              <h1 className="text-4xl font-black leading-none text-coffee-900 sm:text-5xl">
                곧 비는 자리,
                <br />
                가기 전에 확인하세요
              </h1>
              <p className="max-w-lg text-base leading-7 text-stone-500">
                카페에 있는 사람이 남긴 짧은 제보로 지금 갈 만한 곳을 빠르게 고릅니다.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                className="group grid gap-4 rounded-lg border border-forest-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-forest-600/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
                onClick={() => setMode("visitor")}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 text-lg font-black text-coffee-900">
                      <Search className="h-5 w-5 text-forest-600" />
                      카페 갈래요
                    </span>
                    <span className="text-sm leading-6 text-stone-500">검색하고 곧 비는 자리와 콘센트 제보를 확인합니다.</span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-700 transition group-hover:bg-forest-600 group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </button>

              <button
                className="group grid gap-4 rounded-lg border border-honey-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-honey-500/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-500"
                onClick={() => setMode("reporter")}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 text-lg font-black text-coffee-900">
                      <Users className="h-5 w-5 text-honey-600" />
                      곧 나가요
                    </span>
                    <span className="text-sm leading-6 text-stone-500">내가 앉은 자리를 곧 찾을 사람에게 짧게 알려줍니다.</span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-honey-50 text-honey-600 transition group-hover:bg-honey-500 group-hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 py-4 text-foreground sm:px-6 md:px-8">
      <section className="mx-auto grid max-w-6xl gap-4">
        <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 border-b border-paper-100 bg-paper-50/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
          <Button className="border-paper-100 bg-white text-coffee-900 hover:bg-paper-100" variant="outline" size="icon" onClick={() => setMode("landing")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-forest-700">{modeLabel}</p>
            <h2 className="truncate text-2xl font-black text-coffee-900 sm:text-3xl">{title}</h2>
          </div>
        </header>

        <section className="rounded-lg border border-paper-100 bg-white/85 p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-honey-50 text-honey-600">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-black text-coffee-900">카페 검색</h3>
              <p className="text-xs text-stone-500">네이버 지역 검색 결과를 불러옵니다.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              className="h-12 bg-white text-base"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void searchCafes();
                }
              }}
              placeholder="예: 성수 작업하기 좋은 카페"
              type="search"
            />
            <Button className="h-12 bg-forest-600 px-5 text-white hover:bg-forest-700" onClick={() => void searchCafes()} disabled={isSearching}>
              {isSearching ? "검색 중" : "검색"}
            </Button>
          </div>
          {searchMessage ? (
            <p className="mt-3 rounded-md border border-forest-100 bg-forest-50 px-3 py-2 text-sm text-forest-700">{searchMessage}</p>
          ) : null}
        </section>

        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <section className="rounded-lg border border-paper-100 bg-white/85 shadow-sm">
            <div className="flex items-center justify-between border-b border-paper-100 px-4 py-3">
              <h3 className="text-base font-black text-coffee-900">카페 목록</h3>
              <Badge className="bg-coffee-900 text-white hover:bg-coffee-900">{cafes.length}곳</Badge>
            </div>
            <div className="grid gap-2 p-3 lg:max-h-[calc(100dvh-16rem)] lg:overflow-auto">
              {cafes.length === 0 ? (
                <p className="px-1 py-6 text-center text-sm text-stone-500">검색 결과가 없습니다.</p>
              ) : (
                cafes.map((cafe) => (
                  <button
                    key={cafe.id}
                    aria-pressed={selectedCafe?.id === cafe.id}
                    className={`grid gap-1 rounded-lg border px-3 py-3 text-left transition ${
                      selectedCafe?.id === cafe.id
                        ? "border-forest-600 bg-forest-50 shadow-sm"
                        : "border-transparent bg-white hover:border-paper-100 hover:bg-paper-50"
                    }`}
                    onClick={() => void selectCafe(cafe)}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-coffee-900">{cafe.place_name}</span>
                        <span className="mt-1 flex items-start gap-1 text-xs leading-5 text-stone-500">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>{getCafeAddress(cafe)}</span>
                        </span>
                      </span>
                      {selectedCafe?.id === cafe.id ? <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-600" /> : null}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-paper-100 bg-white/90 shadow-sm">
            <div className="border-b border-paper-100 px-4 py-4">
              <p className="text-xs font-bold text-forest-700">{selectedCafe ? "선택한 카페" : "대기 중"}</p>
              <h3 className="mt-1 text-xl font-black text-coffee-900">
                {selectedCafe ? selectedCafe.place_name : "카페를 선택하세요"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                {selectedCafe
                  ? selectedAddress
                  : mode === "reporter"
                    ? "검색 결과에서 제보할 카페를 선택하면 입력 폼이 열립니다."
                    : "검색 결과에서 카페를 선택하면 최근 자리 제보를 볼 수 있습니다."}
              </p>
            </div>

            <div className="grid gap-4 p-4">
              {message ? (
                <p className="rounded-md border border-forest-100 bg-forest-50 px-3 py-2 text-sm text-forest-700">{message}</p>
              ) : null}

              {mode === "visitor" && reportData ? (
                <>
                  <div className="rounded-lg border border-honey-100 bg-honey-50 px-4 py-3">
                    <div className="mb-1 flex items-center gap-2 text-sm font-black text-coffee-900">
                      <Sparkles className="h-4 w-4 text-honey-600" />
                      자리 요약
                    </div>
                    <p className="text-sm leading-6 text-coffee-700">{reportData.summary.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-paper-100 bg-white px-3 py-3">
                      <p className="text-xs text-stone-500">최근 제보</p>
                      <p className="mt-1 text-lg font-black text-coffee-900">{reportData.summary.activeCount}건</p>
                    </div>
                    <div className="rounded-lg border border-paper-100 bg-white px-3 py-3">
                      <p className="text-xs text-stone-500">곧 비는 자리</p>
                      <p className="mt-1 text-lg font-black text-forest-700">{reportData.summary.leavingSoonCount}건</p>
                    </div>
                    <div className="rounded-lg border border-paper-100 bg-white px-3 py-3">
                      <p className="text-xs text-stone-500">콘센트 좌석</p>
                      <p className="mt-1 text-lg font-black text-coffee-900">{reportData.summary.outletSeatCount}석</p>
                    </div>
                    <div className="rounded-lg border border-paper-100 bg-white px-3 py-3">
                      <p className="text-xs text-stone-500">웨이팅</p>
                      <p className="mt-1 text-lg font-black text-coffee-900">{reportData.summary.hasWaiting ? "있음" : "없음"}</p>
                    </div>
                  </div>
                </>
              ) : null}

              {mode === "reporter" && selectedCafe && hasSubmittedReport ? (
                <div className="rounded-lg border border-forest-100 bg-forest-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-black text-forest-700">
                    <CheckCircle2 className="h-4 w-4" />
                    곧 나가요가 등록되었습니다.
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    자리 제보가 저장되었습니다. 다른 사람이 이 카페를 조회할 때 최근 제보로 표시됩니다.
                  </p>
                </div>
              ) : null}

              {mode === "reporter" && selectedCafe && !hasSubmittedReport ? (
                <form className="grid gap-4" onSubmit={submitReport}>
                  <div className="rounded-lg border border-honey-100 bg-honey-50 px-4 py-3">
                    <p className="text-sm font-black text-coffee-900">자리 상태를 알려주세요</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">정확한 좌석 번호보다, 몇 분 뒤 어떤 자리가 비는지가 더 중요합니다.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="leavingInMinutes">몇 분 뒤 나가나요?</Label>
                      <Input className="h-11 bg-white" id="leavingInMinutes" name="leavingInMinutes" type="number" min={1} max={180} defaultValue={20} required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="seatCount">몇 인석인가요?</Label>
                      <Input className="h-11 bg-white" id="seatCount" name="seatCount" type="number" min={1} max={8} defaultValue={2} required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>자리 넓이</Label>
                      <Select value={seatSpace} onValueChange={(value) => setSeatSpace(value as SeatSpace)}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wide">넓음</SelectItem>
                          <SelectItem value="normal">보통</SelectItem>
                          <SelectItem value="narrow">좁음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>현재 분위기</Label>
                      <Select value={crowdLevel} onValueChange={(value) => setCrowdLevel(value as CrowdLevel)}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relaxed">여유</SelectItem>
                          <SelectItem value="normal">보통</SelectItem>
                          <SelectItem value="busy">혼잡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Label className="flex min-h-11 items-center gap-2 rounded-lg border border-paper-100 bg-white px-3 text-sm">
                      <input name="hasOutlet" type="checkbox" />
                      콘센트 있음
                    </Label>
                    <Label className="flex min-h-11 items-center gap-2 rounded-lg border border-paper-100 bg-white px-3 text-sm">
                      <input name="hasWaiting" type="checkbox" />
                      웨이팅 있음
                    </Label>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="note">추가 메모</Label>
                    <Textarea className="min-h-24 bg-white" id="note" name="note" maxLength={160} placeholder="예: 창가 2인석, 의자가 편해요" />
                  </div>

                  <Button className="h-12 bg-coffee-900 text-white hover:bg-coffee-700" type="submit">곧 나가요</Button>
                </form>
              ) : null}

              {mode === "visitor" ? (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-coffee-900">최근 제보</h3>
                    <Badge className="bg-honey-500 text-coffee-900 hover:bg-honey-500">{reportData?.reports.length ?? 0}건</Badge>
                  </div>
                  {!reportData || reportData.reports.length === 0 ? (
                    <p className="rounded-lg border border-paper-100 bg-paper-50 px-4 py-6 text-center text-sm text-stone-500">아직 최근 제보가 없습니다.</p>
                  ) : (
                    reportData.reports.map((report) => (
                      <div key={report.id} className="rounded-lg border border-paper-100 bg-white px-3 py-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-coffee-900">
                          <Clock3 className="h-4 w-4 text-honey-600" />
                          {report.leavingInMinutes}분 뒤 {report.seatCount}인석이 비어요
                        </div>
                        {report.note ? (
                          <p className="mt-1 text-sm leading-6 text-stone-500">{report.note}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="secondary">{getSeatSpaceLabel(report.seatSpace)}</Badge>
                          {report.hasOutlet ? (
                            <Badge className="border-forest-100 bg-forest-50 text-forest-700 hover:bg-forest-50">
                              <Plug className="mr-1 h-3 w-3" />
                              콘센트
                            </Badge>
                          ) : null}
                          {report.hasWaiting ? <Badge variant="destructive">웨이팅</Badge> : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
