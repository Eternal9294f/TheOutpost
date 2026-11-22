"use client";

import { useEffect, useState } from "react";

interface CityDestination {
  id: number;
  country: string;
  city: string;
  area: string;
  wifiSpeed: string;
  monthlyCost: string;
  tagline: string;
  averageRating: number | null;
  totalReviews: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  nomadCallsign: string;
  createdAt: string;
}

interface CityDetail extends CityDestination {
  description: string;
  latestReview: Review | null;
  reviews: Review[];
}

export default function NomadTravelApp({ defaultCityId }: { defaultCityId?: number }) {
  const [destinations, setDestinations] = useState<CityDestination[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("Thailand");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(defaultCityId || null);
  const [cityData, setCityData] = useState<CityDetail | null>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingCity, setLoadingCity] = useState(false);

  // Enlist in Network Modal
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [callsign, setCallsign] = useState("");
  const [enlistDone, setEnlistDone] = useState(false);

  // Inline Review Form
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewCallsign, setReviewCallsign] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // 1. Fetch all destinations
  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoadingDestinations(true);
        const res = await fetch("/api/cities");
        if (res.ok) {
          const json = await res.json();
          const list: CityDestination[] = json.destinations || [];
          setDestinations(list);
          if (list.length > 0) {
            const initialCity = defaultCityId 
              ? list.find(d => d.id === defaultCityId) || list[0]
              : list.find(d => d.country === "Thailand") || list[0];
            setSelectedCountry(initialCity.country);
            setSelectedCityId(initialCity.id);
          }
        }
      } catch (err) {
        console.error("Failed to load destinations:", err);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadDestinations();
  }, [defaultCityId]);

  // 2. Fetch specific city details
  useEffect(() => {
    if (!selectedCityId) return;

    async function loadCityDetail() {
      try {
        setLoadingCity(true);
        const res = await fetch(`/api/cities/${selectedCityId}`);
        if (res.ok) {
          const json = await res.json();
          setCityData(json);
        }
      } catch (err) {
        console.error("Failed to load city details:", err);
      } finally {
        setLoadingCity(false);
      }
    }

    loadCityDetail();
  }, [selectedCityId]);

  const countries = Array.from(new Set(destinations.map((d) => d.country)));
  const citiesInCountry = destinations.filter((d) => d.country === selectedCountry);

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    const firstCity = destinations.find((d) => d.country === c);
    if (firstCity) {
      setSelectedCityId(firstCity.id);
    }
  };

  const handleEnlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim()) return;
    setEnlistDone(true);
    setTimeout(() => {
      setIsJoinOpen(false);
      setEnlistDone(false);
      setCallsign("");
    }, 1800);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId || !reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: selectedCityId,
          nomadCallsign: reviewCallsign.trim() || "Anonymous Nomad",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const json = await res.json();

      if (res.status === 201) {
        setIsReviewOpen(false);
        setReviewComment("");
        setReviewCallsign("");
        const refreshed = await fetch(`/api/cities/${selectedCityId}`);
        if (refreshed.ok) {
          const updatedJson = await refreshed.json();
          setCityData(updatedJson);
        }
        // Also refresh list to update rating count/average
        const resList = await fetch("/api/cities");
        if (resList.ok) {
          const listJson = await resList.json();
          setDestinations(listJson.destinations || []);
        }
      } else {
        setReviewError(json.error || "Failed to submit review.");
      }
    } catch {
      setReviewError("Network error. Could not connect to database.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#1C1E21] flex flex-col items-center selection:bg-[#E2DDD0]">
      <div className="w-full max-w-[700px] px-5 py-12 flex flex-col gap-10">
        
        {/* 1. TOP SECTION WITH HIGH CONTRAST & TYPOGRAPHIC HIERARCHY */}
        <header className="flex flex-col items-center text-center gap-3 pt-2 border-b border-[#DDD9CE] pb-9">
          
          {/* Micro-Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7DE] border border-[#D5D1C4] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.22em] text-[#555962] font-medium">
              FIELD INTELLIGENCE // NETWORK MESH v2.4
            </span>
          </div>
          
          {/* Main Title: Sharp, Deep Obsidian Charcoal */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[0.16em] uppercase text-[#0F1012] font-mono mt-1">
            THE OUTPOST
          </h1>

          {/* Subtitle: Clean Crisp Gray-Charcoal */}
          <p className="text-xs sm:text-sm text-[#454950] font-mono tracking-wide max-w-[500px] leading-relaxed">
            A decentralized field intelligence and travel review platform for digital nomads.
          </p>

          {/* High-Contrast Action Button */}
          <div className="mt-2.5">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="text-[11px] font-mono tracking-wider uppercase px-4 py-1.5 rounded-full bg-[#202328] hover:bg-[#101214] text-[#F6F5F0] transition-all shadow-[0_2px_6px_rgba(0,0,0,0.08)] cursor-pointer border border-[#141618] font-medium flex items-center gap-1.5"
            >
              <span className="text-[#A0A5B0]">+</span>
              <span>Enlist in Network</span>
            </button>
          </div>
        </header>

        {/* 2. REGIONS / TERRITORIES SELECTION */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#DDD9CE] pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#636770] font-semibold">
              REGIONS & TERRITORIES
            </span>
            <span className="text-[10px] font-mono text-[#737780]">
              {countries.length} ACTIVE NATIONS
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {countries.map((c) => {
              const active = c === selectedCountry;
              return (
                <button
                  key={c}
                  onClick={() => handleCountryChange(c)}
                  className={`text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-lg transition-all cursor-pointer border whitespace-nowrap ${
                    active
                      ? "bg-white text-[#0F1012] border-[#BBB7AC] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                      : "bg-[#EAE7DF] text-[#555962] border-transparent hover:border-[#D0CCC1] hover:text-[#0F1012]"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. CITIES IN SELECTED COUNTRY (MINIMUM 3 HUBS PER NATION) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#DDD9CE] pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#636770] font-semibold">
              STATIONS // {selectedCountry.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-[#737780]">
              {citiesInCountry.length} NOMAD HUBS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {citiesInCountry.map((city) => {
              const active = city.id === selectedCityId;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                    active
                      ? "bg-white border-[#B4AF9F] shadow-[0_3px_10px_rgba(0,0,0,0.04)] ring-1 ring-[#B4AF9F]"
                      : "bg-[#ECE9E0] border-[#DCD8CD] hover:border-[#CBC6BA] hover:bg-[#E6E3DA]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-mono font-bold tracking-wide uppercase ${active ? "text-[#0F1012]" : "text-[#2A2D33]"}`}>
                        {city.city}
                      </span>
                      <span className="text-[10px] font-mono text-[#B46200] font-semibold shrink-0">
                        ★ {city.averageRating !== null ? city.averageRating.toFixed(1) : "—"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6A6E78] block truncate mt-0.5">
                      {city.area}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2DED4] text-[10px] font-mono text-[#52565F]">
                    <span>{city.wifiSpeed}</span>
                    <span className="font-semibold text-[#30333A]">{city.monthlyCost}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. STATION DETAIL VIEW (CAREFULLY SPACED & ALIGNED) */}
        {loadingCity ? (
          <div className="p-12 text-center text-xs font-mono text-[#7A7E88] border border-[#DDD9CE] rounded-2xl bg-white/40">
            TRANSMITTING STATION TELEMETRY...
          </div>
        ) : cityData ? (
          <div className="p-6 sm:p-8 rounded-2xl border border-[#D5D1C4] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-7">
            
            {/* Station Header: Spacious, Uncramped Flex Container with Full Word Wrap */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 border-b border-[#E8E5DC] pb-6">
              
              {/* Left Column: Full Width / Spacious */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                
                {/* Meta Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded bg-[#EDEAE1] text-[#4A4E56] font-medium border border-[#DDD9CE]">
                    {cityData.country}
                  </span>
                  <span className="text-[#AAA69D] text-xs font-mono">/</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded bg-[#EDEAE1] text-[#4A4E56] font-medium border border-[#DDD9CE]">
                    {cityData.area}
                  </span>
                </div>

                {/* Station City Name */}
                <h2 className="text-2xl sm:text-3xl font-mono uppercase tracking-wide text-[#0F1012] font-bold">
                  {cityData.city}
                </h2>

                {/* Tagline / Explanation: Spacious, Properly Spaced and Aligned */}
                <p className="text-xs sm:text-sm text-[#42464D] font-mono leading-relaxed max-w-[520px]">
                  {cityData.tagline}
                </p>
              </div>

              {/* Right Column: Rating Box Badge (Shrink-0, Never Compressing Left Content) */}
              <div className="shrink-0 self-start sm:self-auto flex flex-col items-center justify-center px-4 py-3.5 rounded-xl border border-[#DDD9CE] bg-[#FAF9F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-w-[110px] text-center">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-[#0F1012] leading-none">
                  {cityData.averageRating !== null ? cityData.averageRating.toFixed(1) : "—"}
                </span>
                <div className="flex items-center gap-1 mt-1.5 text-[#B46200] text-[10px] font-mono uppercase tracking-wider font-semibold">
                  <span>★</span>
                  <span>{cityData.averageRating !== null ? "VERIFIED" : "UNRATED"}</span>
                </div>
                <span className="text-[10px] font-mono text-[#70747C] mt-0.5">
                  {cityData.totalReviews} {cityData.totalReviews === 1 ? "field review" : "field reviews"}
                </span>
              </div>
            </div>

            {/* Station Telemetry Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F4F1E8] border border-[#DDD9CE]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#6A6E78]">WIFI UPLINK</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#0F1012]">{cityData.wifiSpeed}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#6A6E78]">EST. MONTHLY BURN</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#0F1012]">{cityData.monthlyCost}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#6A6E78]">NOMAD DISTRICT</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#0F1012] truncate">{cityData.area}</span>
              </div>
            </div>

            {/* Field Intelligence Briefing */}
            <div className="flex flex-col gap-2 text-xs font-mono text-[#3E4249] leading-relaxed border-b border-[#E8E5DC] pb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] font-semibold">
                TACTICAL FIELD BRIEFING
              </span>
              <p className="bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E6E3DA]">
                {cityData.description}
              </p>
            </div>

            {/* Latest Field Report */}
            {cityData.latestReview && (
              <div className="flex flex-col gap-2.5 border-b border-[#E8E5DC] pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] font-semibold">
                    LATEST FIELD REPORT
                  </span>
                  <span className="text-[10px] font-mono text-[#737780]">
                    {formatDate(cityData.latestReview.createdAt)}
                  </span>
                </div>
                
                <div className="p-4 rounded-xl border border-[#DDD9CE] bg-[#FAF9F5] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[#B46200] text-sm">
                      {"★".repeat(cityData.latestReview.rating)}
                      <span className="text-[#D8D4C8]">{"★".repeat(5 - cityData.latestReview.rating)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#585C65] font-medium">
                      @{cityData.latestReview.nomadCallsign}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#25282E] leading-relaxed italic">
                    “{cityData.latestReview.comment}”
                  </p>
                </div>
              </div>
            )}

            {/* Historical Dispatches */}
            {cityData.reviews && cityData.reviews.length > 1 && (
              <div className="flex flex-col gap-3 border-b border-[#E8E5DC] pb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#737780] font-semibold">
                  HISTORICAL DISPATCHES ({cityData.reviews.length - 1})
                </span>

                <div className="flex flex-col gap-2.5">
                  {cityData.reviews.slice(1).map((rev) => (
                    <div key={rev.id} className="p-3 rounded-lg border border-[#E6E3DA] bg-[#FAF9F6] flex flex-col gap-1 text-xs font-mono">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center text-[#B46200]">
                          {"★".repeat(rev.rating)}
                          <span className="text-[#D8D4C8]">{"★".repeat(5 - rev.rating)}</span>
                        </div>
                        <span className="text-[#7A7E86]">
                          @{rev.nomadCallsign} · {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <p className="text-[#3A3D44] mt-0.5 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Review Dispatch Form */}
            <div className="flex flex-col gap-4">
              {!isReviewOpen ? (
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="w-full py-3 rounded-xl border border-[#C5C0B2] bg-[#FAF9F5] hover:bg-white text-xs font-mono uppercase tracking-wider text-[#0F1012] font-semibold transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer"
                >
                  + Submit a Field Review for {cityData.city}
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="p-4 sm:p-5 rounded-xl border border-[#C5C0B2] bg-[#FAF9F5] flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#E0DCD2] pb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F1012]">
                      NEW FIELD DISPATCH // {cityData.city.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReviewOpen(false)}
                      className="text-xs font-mono text-[#7A7E86] hover:text-[#0F1012] cursor-pointer"
                    >
                      [CANCEL]
                    </button>
                  </div>

                  {reviewError && (
                    <div className="p-2.5 rounded bg-[#FBEBE8] border border-[#F0BCB4] text-[11px] font-mono text-[#9C2014]">
                      {reviewError}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#6A6E78]">
                      EVALUATION SCORE (1-5 STARS)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`w-9 h-9 rounded-lg text-sm font-mono flex items-center justify-center transition-all cursor-pointer border ${
                            reviewRating >= star
                              ? "bg-[#FAF0D9] text-[#B46200] border-[#E8C888] font-bold"
                              : "bg-white text-[#9CA0AA] border-[#DDD9CE]"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs font-mono text-[#52565F] ml-2 font-medium">
                        {reviewRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Callsign Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#6A6E78]">
                      NOMAD CALLSIGN (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RogueDev_42"
                      value={reviewCallsign}
                      onChange={(e) => setReviewCallsign(e.target.value)}
                      className="p-2.5 rounded-lg border border-[#DDD9CE] bg-white text-xs font-mono text-[#0F1012] outline-none focus:border-[#0F1012]"
                    />
                  </div>

                  {/* Dispatch Comment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#6A6E78]">
                      FIELD DISPATCH INTEL
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Detail wifi stability, coffee shops, noise level, community vibe, power outlets..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="p-2.5 rounded-lg border border-[#DDD9CE] bg-white text-xs font-mono text-[#0F1012] outline-none focus:border-[#0F1012] leading-relaxed resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2.5 rounded-lg bg-[#202328] hover:bg-[#101214] text-[#F6F5F0] text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? "BROADCASTING DISPATCH..." : "BROADCAST FIELD REVIEW"}
                  </button>
                </form>
              )}
            </div>

          </div>
        ) : null}

        {/* 5. FOOTER ATTRIBUTION */}
        <footer className="text-center py-6 border-t border-[#DDD9CE] text-[10px] font-mono text-[#737780] tracking-widest uppercase">
          THE OUTPOST · DECENTRALIZED NOMAD MESH · MADE BY AN
        </footer>

      </div>

      {/* 6. ENLIST IN NETWORK MODAL */}
      {isJoinOpen && (
        <div className="fixed inset-0 bg-[#0F1012]/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[#FAF9F5] border border-[#C5C0B2] p-6 rounded-2xl w-full max-w-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E0DCD2] pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F1012]">
                ENLIST IN NOMAD MESH
              </span>
              <button
                onClick={() => setIsJoinOpen(false)}
                className="text-xs font-mono text-[#7A7E86] hover:text-[#0F1012] cursor-pointer"
              >
                [X]
              </button>
            </div>

            {enlistDone ? (
              <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-center flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-[#2E7D32]">CALLSIGN REGISTERED</span>
                <span className="text-[11px] font-mono text-[#388E3C]">Welcome to the mesh, nomad.</span>
              </div>
            ) : (
              <form onSubmit={handleEnlistSubmit} className="flex flex-col gap-3.5">
                <p className="text-xs font-mono text-[#4E5259] leading-relaxed">
                  Join the decentralized network. Register your nomad callsign to submit verified field intel.
                </p>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#6A6E78]">
                    CALLSIGN / HANDLE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlas_01"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="p-2.5 rounded-lg border border-[#DDD9CE] bg-white text-xs font-mono text-[#0F1012] outline-none focus:border-[#0F1012]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#202328] hover:bg-[#101214] text-[#F6F5F0] text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer"
                >
                  CONFIRM REGISTRATION
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
