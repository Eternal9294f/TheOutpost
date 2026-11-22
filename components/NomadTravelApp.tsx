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
  const [selectedCountry, setSelectedCountry] = useState<string>("Japan");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(defaultCityId || null);
  const [cityData, setCityData] = useState<CityDetail | null>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingCity, setLoadingCity] = useState(false);

  // Enlist Modal
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
              : list[0];
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
    }, 2000);
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
    <div className="min-h-screen bg-[#F6F5F0] text-[#1C1E21] flex flex-col items-center">
      <div className="w-full max-w-[680px] px-5 py-12 flex flex-col gap-10">
        
        {/* 1. CENTRALIZED TITLE & PLEASING MINIMAL HEADER */}
        <header className="flex flex-col items-center text-center gap-2.5 pt-4 border-b border-[#E6E3DB] pb-10">
          <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-[#7A7D85]">
            FIELD INTELLIGENCE // 01
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[0.15em] uppercase text-[#1C1E21] font-mono">
            THE OUTPOST
          </h1>

          <p className="text-xs sm:text-sm text-[#5C6066] font-mono tracking-wide max-w-[460px] leading-relaxed">
            A decentralized field intelligence and travel review platform for digital nomads.
          </p>

          <div className="mt-2">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="text-[11px] font-mono tracking-wider uppercase px-4 py-1.5 rounded-full border border-[#D5D2C8] bg-white hover:bg-[#EFECE4] text-[#4A4E54] hover:text-[#1C1E21] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer"
            >
              + Enlist in Network
            </button>
          </div>
        </header>

        {/* 2. TERRITORIES / COUNTRIES */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-[#E6E3DB] pb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7D85]">
              TERRITORIES
            </span>
            <span className="text-[10px] font-mono text-[#7A7D85]">
              {countries.length} REGIONS
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {countries.map((c) => {
              const active = c === selectedCountry;
              return (
                <button
                  key={c}
                  onClick={() => handleCountryChange(c)}
                  className={`text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-lg transition-all cursor-pointer border ${
                    active
                      ? "bg-white text-[#1C1E21] border-[#C8C5BB] font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.04)]"
                      : "bg-[#ECE9E1] text-[#63666E] border-transparent hover:border-[#D5D2C8] hover:text-[#1C1E21]"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. CITIES IN SELECTED COUNTRY */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-[#E6E3DB] pb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7D85]">
              STATIONS // {selectedCountry.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-[#7A7D85]">
              {citiesInCountry.length} HUBS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {citiesInCountry.map((city) => {
              const active = city.id === selectedCityId;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`p-3.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    active
                      ? "border-[#1C1E21] bg-white text-[#1C1E21] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                      : "border-[#E2DFD6] bg-white/70 text-[#5C6066] hover:border-[#C8C5BB] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono font-semibold tracking-wide text-[#1C1E21]">
                      {city.city}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#C27803]">
                      {city.averageRating ? `★ ${city.averageRating}` : "—"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7A7D85] truncate">
                    {city.area}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. ACTIVE CITY PROFILE & REVIEWS */}
        {loadingCity ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-[#1C1E21] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-mono tracking-wider text-[#7A7D85] uppercase">
              Accessing station records...
            </span>
          </div>
        ) : cityData ? (
          <div className="flex flex-col gap-8 border-t border-[#E6E3DB] pt-6">
            
            {/* Overview Card */}
            <div className="bg-white border border-[#E2DFD6] rounded-xl p-6 flex flex-col gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7D85] bg-[#F2EFE8] px-2 py-0.5 rounded">
                    {cityData.country} · {cityData.area}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1E21] font-mono mt-2">
                    {cityData.city}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A4E54] font-mono mt-1.5 leading-relaxed max-w-[440px]">
                    {cityData.description}
                  </p>
                </div>

                <div className="flex flex-col items-end text-right border border-[#E8E5DD] rounded-lg p-3.5 bg-[#FAF9F5] min-w-[95px]">
                  <span className="text-3xl sm:text-4xl font-normal font-mono text-[#1C1E21] tracking-tight leading-none">
                    {cityData.averageRating !== null ? cityData.averageRating : "—"}
                  </span>
                  <span className="text-[10px] font-mono text-[#C27803] mt-1 font-semibold">
                    {cityData.averageRating ? "★ VERIFIED" : "UNRATED"}
                  </span>
                  <span className="text-[10px] font-mono text-[#7A7D85] mt-1">
                    {cityData.totalReviews} {cityData.totalReviews === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#EFECE4] pt-4 font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-[#7A7D85]">Verified Wifi</span>
                  <span className="text-[#1C1E21] font-semibold mt-0.5">{cityData.wifiSpeed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-[#7A7D85]">Monthly Living Est.</span>
                  <span className="text-[#1C1E21] font-semibold mt-0.5">{cityData.monthlyCost}</span>
                </div>
                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase text-[#7A7D85]">Nomad Atmosphere</span>
                  <span className="text-[#5C6066] mt-0.5 truncate">{cityData.tagline}</span>
                </div>
              </div>
            </div>

            {/* Field Reviews Feed */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E6E3DB] pb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7D85]">
                  FIELD DISPATCHES ({cityData.totalReviews})
                </span>

                <button
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                  className="text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded bg-[#EAE7DF] hover:bg-[#DDD9CE] text-[#1C1E21] font-medium transition-colors cursor-pointer"
                >
                  {isReviewOpen ? "− Cancel" : "+ File Report"}
                </button>
              </div>

              {/* Inline Review Form */}
              {isReviewOpen && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="border border-[#E2DFD6] bg-white p-5 rounded-xl flex flex-col gap-3.5 font-mono shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                >
                  <span className="text-xs uppercase tracking-wider text-[#1C1E21] font-semibold">
                    Record Field Observation for {cityData.city}
                  </span>

                  {reviewError && (
                    <p className="text-xs text-[#963426] border border-[#F0D5D0] p-2 rounded bg-[#FBF0EE]">
                      {reviewError}
                    </p>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#7A7D85]">Your Callsign</label>
                    <input
                      type="text"
                      placeholder="e.g. Scout_Levi or Nomad_Elena"
                      value={reviewCallsign}
                      onChange={(e) => setReviewCallsign(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#E2DFD6] rounded p-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#1C1E21]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#7A7D85]">Score (1 to 5 Stars)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`w-9 h-9 rounded border text-sm font-mono transition-all cursor-pointer ${
                            reviewRating === star
                              ? "bg-[#1C1E21] text-white border-[#1C1E21] font-bold"
                              : "bg-[#FAF9F5] text-[#5C6066] border-[#E2DFD6] hover:border-[#1C1E21]"
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-[#7A7D85]">Field Notes</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detail internet speeds, noise levels, focus cafes, walkability, or community..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#E2DFD6] rounded p-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#1C1E21] resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || !reviewComment.trim()}
                    className="w-full py-2.5 rounded bg-[#1C1E21] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#35393F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submittingReview ? "Submitting..." : "Submit Dispatch"}
                  </button>
                </form>
              )}

              {/* Highlighted Latest Review */}
              {cityData.latestReview && (
                <div className="border border-[#E2DFD6] p-5 rounded-xl flex flex-col gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#824D1B] bg-[#F7F0E6] px-2 py-0.5 rounded border border-[#EDE2D2]">
                      Latest Field Dispatch
                    </span>
                    <span className="text-[10px] font-mono text-[#7A7D85]">
                      {formatDate(cityData.latestReview.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs mt-1">
                    <span className="text-[#1C1E21] font-semibold">
                      @{cityData.latestReview.nomadCallsign}
                    </span>
                    <span className="text-[#A2A6AF]">·</span>
                    <span className="text-[#C27803]">
                      {"★".repeat(cityData.latestReview.rating)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#383B40] leading-relaxed font-mono mt-0.5">
                    &ldquo;{cityData.latestReview.comment}&rdquo;
                  </p>
                </div>
              )}

              {/* Past Reviews List */}
              {cityData.reviews.length > 0 && (
                <div className="flex flex-col divide-y divide-[#EAE7DF] border-y border-[#EAE7DF] bg-white px-5 rounded-xl border">
                  {cityData.reviews.map((rev) => (
                    <div key={rev.id} className="py-4 flex flex-col gap-1 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1C1E21] font-medium">@{rev.nomadCallsign}</span>
                          <span className="text-[#A2A6AF]">·</span>
                          <span className="text-[#C27803]">{"★".repeat(rev.rating)}</span>
                        </div>
                        <span className="text-[10px] text-[#7A7D85]">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A4E54] leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {cityData.totalReviews === 0 && (
                <div className="py-8 text-center text-xs font-mono text-[#7A7D85] border border-dashed border-[#DCD9D0] rounded-xl bg-white/50">
                  No dispatches recorded yet for {cityData.city}. Be the first wanderer to log an observation.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* 5. MINIMALIST FOOTER */}
        <footer className="pt-8 pb-4 text-center border-t border-[#E6E3DB] flex flex-col items-center gap-1.5">
          <p className="text-[10px] text-[#7A7D85] font-mono tracking-[0.2em] uppercase">
            THE OUTPOST · DECENTRALIZED NOMAD MESH · MADE BY AN
          </p>
        </footer>
      </div>

      {/* 6. SEAMLESS ENLIST MODAL */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1E21]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2DFD6] w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 font-mono shadow-xl relative">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute top-4 right-4 text-[#7A7D85] hover:text-[#1C1E21] text-xs cursor-pointer"
            >
              [ESC]
            </button>

            <span className="text-[10px] uppercase tracking-wider text-[#7A7D85]">
              RECON NETWORK // ENLIST
            </span>

            <h3 className="text-lg font-normal text-[#1C1E21] tracking-tight">
              Nomad Mesh Registration
            </h3>

            {enlistDone ? (
              <div className="border border-[#D4E8DC] bg-[#F2F8F4] p-4 rounded-xl text-center">
                <span className="text-xs text-[#206638] font-semibold">
                  Callsign @{callsign} registered to the mesh.
                </span>
              </div>
            ) : (
              <form onSubmit={handleEnlistSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-[#7A7D85]">Nomad Callsign</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scout_Levi"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="bg-[#FAF9F5] border border-[#E2DFD6] rounded p-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#1C1E21]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#1C1E21] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#35393F] transition-colors cursor-pointer mt-1"
                >
                  Confirm Enlistment
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
