import { ArrowLeft, Clock3, Coffee, MapPin, Plug, Search, Sparkles, Users } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

async function fetchCafeReports(cafeId: string): Promise<ReportResponse> {
  const response = await fetch(`/api/cafes/${encodeURIComponent(cafeId)}/reports`);

  if (!response.ok) {
    throw new Error("제보를 불러오지 못했습니다.");
  }

  return response.json();
}

async function fetchCafeSearch(query: string): Promise<Cafe[]> {
  const response = await fetch(`/api/cafes/search?query=${encodeURIComponent(query)}`);

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

  const title = mode === "reporter" ? "내 자리 제보하기" : "갈 카페 찾기";
  const modeLabel = mode === "reporter" ? "곧 나가요" : "카페 갈래요";

  const selectedAddress = useMemo(() => {
    return selectedCafe ? getCafeAddress(selectedCafe) : "";
  }, [selectedCafe]);

  async function selectCafe(cafe: Cafe) {
    setSelectedCafe(cafe);
    setMessage("");
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
    const response = await fetch(`/api/cafes/${encodeURIComponent(selectedCafe.id)}/reports`, {
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
    setMessage("제보가 등록되었습니다.");
  }

  if (mode === "landing") {
    return (
      <main className="min-h-dvh overflow-hidden bg-[linear-gradient(150deg,#fff7d6_0%,#fffdf6_43%,#d9f7ec_100%)] px-4 py-5 text-foreground sm:px-6 md:px-10">
        <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-6xl content-between gap-6 py-4 md:content-center md:gap-8">
          <div className="max-w-3xl pt-4 md:pt-0">
            <Badge className="mb-4 bg-[#2f7d68] text-white hover:bg-[#2f7d68]">자리 한 잔 나왔습니다</Badge>
            <h1 className="whitespace-nowrap text-[3.6rem] font-black leading-[0.9] tracking-normal text-[#2c2118] min-[380px]:text-[4.2rem] sm:text-8xl md:text-9xl">
              곧나가요
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d4b3a] sm:text-lg md:text-xl">
              카페에 가기 전, 곧 비는 자리가 있는지 짧은 제보로 확인하세요.
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="border-[#f0cf61] bg-white/90 shadow-lg shadow-[#f4c430]/15">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-2xl text-[#2c2118]">
                  <Coffee className="h-6 w-6 text-[#d88716]" />
                  카페 갈래요
                </CardTitle>
                <CardDescription>지금 갈 만한 카페와 곧 비는 자리를 확인합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="h-12 w-full bg-[#f4c430] text-[#2c2118] hover:bg-[#eab308]" size="lg" onClick={() => setMode("visitor")}>
                  진입하기
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#8fdcc7] bg-white/90 shadow-lg shadow-[#2f7d68]/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-2xl text-[#173f35]">
                  <Users className="h-6 w-6 text-[#2f7d68]" />
                  곧 나가요
                </CardTitle>
                <CardDescription>내가 앉은 자리 정보를 짧게 남깁니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="h-12 w-full bg-[#2f7d68] text-white hover:bg-[#256b58]" size="lg" onClick={() => setMode("reporter")}>
                  제보하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#fff8dd_0%,#fffdf6_46%,#eefaf5_100%)] px-3 py-4 text-foreground sm:px-5 md:px-8">
      <section className="mx-auto grid max-w-7xl gap-4 md:gap-5">
        <header className="sticky top-0 z-20 -mx-3 flex items-center gap-3 border-b border-[#efd991] bg-[#fff8dd]/90 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
          <Button className="shrink-0 border-[#d9be55] bg-white/80" variant="outline" onClick={() => setMode("landing")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">처음으로</span>
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#2f7d68] sm:text-sm">{modeLabel}</p>
            <h2 className="truncate text-2xl font-black tracking-normal text-[#2c2118] sm:text-3xl">{title}</h2>
          </div>
        </header>

        <Card className="border-[#efd991] bg-white/90 shadow-md shadow-[#f4c430]/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-[#d88716]" />
              카페 검색
            </CardTitle>
            <CardDescription>네이버 지역 검색 API로 카페를 찾습니다. 서버 키가 없으면 샘플 카페로 체험합니다.</CardDescription>
          </CardHeader>
          <CardContent>
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
              <Button className="h-12 bg-[#f4c430] text-[#2c2118] hover:bg-[#eab308]" onClick={() => void searchCafes()}>
                <Search className="h-4 w-4" />
                {isSearching ? "검색 중" : "검색"}
              </Button>
            </div>
            {searchMessage ? (
              <p className="mt-3 rounded-md border border-[#cde9df] bg-[#f4fffb] px-3 py-2 text-sm text-[#173f35]">
                {searchMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[390px_1fr]">
          <Card className="border-[#cde9df] bg-white/90">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl">카페 목록</CardTitle>
                <Badge className="bg-[#2f7d68] text-white hover:bg-[#2f7d68]">{cafes.length}곳</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid max-h-none gap-2 lg:max-h-[calc(100dvh-15rem)] lg:overflow-auto">
              {cafes.length === 0 ? (
                <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              ) : (
                cafes.map((cafe) => (
                  <Button
                    key={cafe.id}
                    className={
                      selectedCafe?.id === cafe.id
                        ? "h-auto justify-start whitespace-normal border-[#2f7d68] bg-[#e1f6ef] px-4 py-3 text-left text-[#173f35] hover:bg-[#d4f0e7]"
                        : "h-auto justify-start whitespace-normal border-[#ead9b0] bg-white px-4 py-3 text-left hover:bg-[#fff7db]"
                    }
                    variant="outline"
                    onClick={() => void selectCafe(cafe)}
                  >
                    <span>
                      <span className="block font-semibold">{cafe.place_name}</span>
                      <span className="block text-xs text-muted-foreground">{getCafeAddress(cafe)}</span>
                    </span>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

        <Card className="border-[#efd991] bg-white/95">
          <CardHeader>
            <CardTitle className="text-xl text-[#2c2118] sm:text-2xl">
              {selectedCafe ? selectedCafe.place_name : "카페를 선택하세요"}
            </CardTitle>
            <CardDescription>
              {selectedCafe
                ? selectedAddress
                : mode === "reporter"
                  ? "선택한 카페에 제보를 남길 수 있습니다."
                  : "선택한 카페의 최근 제보와 요약을 볼 수 있습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {message ? <p className="rounded-md border border-[#8fdcc7] bg-[#e1f6ef] px-4 py-3 text-sm text-[#173f35]">{message}</p> : null}
            {mode === "visitor" && reportData ? (
              <div className="rounded-md border border-[#f0cf61] bg-[#fff4c7] px-4 py-3 text-sm leading-6 text-[#4b351c]">
                <div className="mb-1 flex items-center gap-2 font-bold">
                  <Sparkles className="h-4 w-4" />
                  자리 요약
                </div>
                {reportData.summary.message}
              </div>
            ) : null}

            {mode === "reporter" && selectedCafe ? (
              <form className="grid gap-4 rounded-xl border border-[#c9a77a] bg-[linear-gradient(180deg,#fff9f0_0%,#f8efe0_100%)] p-4 shadow-sm shadow-[#c9a77a]/10" onSubmit={submitReport}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="leavingInMinutes">몇 분 뒤 나가나요?</Label>
                    <Input className="bg-white/95" id="leavingInMinutes" name="leavingInMinutes" type="number" min={1} max={180} defaultValue={20} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seatCount">몇 인석인가요?</Label>
                    <Input className="bg-white/95" id="seatCount" name="seatCount" type="number" min={1} max={8} defaultValue={2} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>자리 넓이</Label>
                    <Select value={seatSpace} onValueChange={(value) => setSeatSpace(value as SeatSpace)}>
                      <SelectTrigger className="bg-white/95 border-[#c9a77a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="wide">넓음</SelectItem>
                          <SelectItem value="normal">보통</SelectItem>
                          <SelectItem value="narrow">좁음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="grid gap-2">
                    <Label>현재 분위기</Label>
                    <Select value={crowdLevel} onValueChange={(value) => setCrowdLevel(value as CrowdLevel)}>
                      <SelectTrigger className="bg-white/95 border-[#c9a77a]">
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

                  <div className="flex flex-wrap gap-4 text-sm">
                    <Label className="flex items-center gap-2">
                      <input name="hasOutlet" type="checkbox" />
                      콘센트 있음
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input name="hasWaiting" type="checkbox" />
                      웨이팅 있음
                    </Label>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="note">추가 메모</Label>
                    <Textarea className="bg-white/95" id="note" name="note" maxLength={160} placeholder="예: 창가 2인석, 의자가 편해요" />
                  </div>

                  <Button className="h-11 bg-[#6f4e37] text-white hover:bg-[#5e4031]" type="submit">제보 등록</Button>
                </form>
              ) : null}

              {mode === "visitor" ? (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">최근 제보</h3>
                    <Badge className="bg-[#f4c430] text-[#2c2118] hover:bg-[#f4c430]">{reportData?.reports.length ?? 0}건</Badge>
                  </div>
                  {!reportData || reportData.reports.length === 0 ? (
                    <p className="text-sm text-muted-foreground">아직 최근 제보가 없습니다.</p>
                  ) : (
                    reportData.reports.map((report) => (
                      <Card key={report.id} className="border-[#ead9b0] bg-[#fffdf8]">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Clock3 className="h-4 w-4 text-[#d88716]" />
                            {report.leavingInMinutes}분 뒤 {report.seatCount}인석이 비어요
                          </CardTitle>
                          <CardDescription>{report.note || "추가 메모 없음"}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                          <Badge className="bg-[#e1f6ef] text-[#173f35] hover:bg-[#e1f6ef]">{report.seatSpace === "wide" ? "넓은 자리" : report.seatSpace === "narrow" ? "좁은 자리" : "보통 자리"}</Badge>
                          {report.hasOutlet ? (
                            <Badge className="bg-[#6f4e37] text-white hover:bg-[#6f4e37]">
                              <Plug className="mr-1 h-3 w-3" />
                              콘센트
                            </Badge>
                          ) : null}
                          {report.hasWaiting ? <Badge variant="destructive">웨이팅</Badge> : null}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
