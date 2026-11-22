"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function HomePage() {
  const [destinations, setDestinations] = useState<CityDestination[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("Japan");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [cityData, setCityData] = useState<CityDetail | null>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingCity, setLoadingCity] = useState(false);

  // Seamless Enlist Drawer / Modal
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [callsign, setCallsign] = useState("");
  const [enlistDone, setEnlistDone] = useState(false);

  // Inline Quick Review State
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
            setSelectedCountry(list[0].country);
            setSelectedCityId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load destinations:", err);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadDestinations();
  }, []);

  // 2. Fetch specific city detail whenever selectedCityId changes
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

  // Distinct countries list
  const countries = Array.from(new Set(destinations.map((d) => d.country)));

  // Cities belonging to the currently selected country
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
    }, 2200);
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
        // Refresh city data to dynamically reflect fresh average & reviews
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
    <div className="min-h-screen bg-black text-[#EDEDED] flex flex-col items-center selection:bg-zinc-800">
      <div className="w-full max-w-[680px] px-5 py-16 flex flex-col gap-12">
        
        {/* ============================================================== */}
        {/* 1. CENTRALIZED BIG HEADER & MINIMAL ONE-LINE BRIEF */}
        {/* ============================================================== */}
        <header className="flex flex-col items-center text-center gap-3 pt-6 border-b border-zinc-900 pb-12">
          <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-zinc-500">
            REGISTRY // 01
          </span>
          
          <h1 className="text-4xl sm:text-5xl font-light tracking-[0.2em] uppercase text-white font-mono">
            THE OUTPOST
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wide max-w-[460px] leading-relaxed">
            A decentralized field intelligence and travel review platform for digital nomads.
          </p>

          {/* Seamless Join Trigger (Invisible, elegant monochrome pill) */}
          <div className="mt-3">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="text-[11px] font-mono tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white transition-all bg-black cursor-pointer"
            >
              + Enlist in Network
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* 2. SEAMLESS COUNTRY NAVIGATION (JAPAN, CHINA, INDIA, ETC.) */}
        {/* ============================================================== */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600">
              TERRITORIES
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {countries.length} COUNTRIES
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {countries.map((c) => {
              const active = c === selectedCountry;
              return (
                <button
                  key={c}
                  onClick={() => handleCountryChange(c)}
                  className={`text-xs font-mono tracking-widest uppercase px-4 py-2 rounded-md transition-all cursor-pointer border ${
                    active
                      ? "bg-white text-black border-white font-semibold"
                      : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. CITIES UNDER SELECTED COUNTRY */}
        {/* ============================================================== */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600">
              STATIONS // {selectedCountry.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {citiesInCountry.length} CITIES
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
                      ? "border-zinc-300 bg-zinc-950 text-white"
                      : "border-zinc-800/80 bg-black text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono font-semibold tracking-wide text-white">
                      {city.city}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {city.averageRating ? `★ ${city.averageRating}` : "—"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    {city.area}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. ACTIVE CITY STATION PROFILE & REVIEWS */}
        {/* ============================================================== */}
        {loadingCity ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-5 h-5 border border-zinc-700 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
              Fetching station telemetry...
            </span>
          </div>
        ) : cityData ? (
          <div className="flex flex-col gap-10 border-t border-zinc-900 pt-8">
            
            {/* City Overview & Hero Vitals */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
                    {cityData.country} · {cityData.area}
                  </span>
                  <h2 className="text-3xl font-light tracking-wide text-white font-mono mt-1">
                    {cityData.city}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-2 leading-relaxed max-w-[440px]">
                    {cityData.description}
                  </p>
                </div>

                {/* Big Dynamic Computed Rating (Zero Frontend Math) */}
                <div className="flex flex-col items-end text-right border border-zinc-800 rounded-lg p-4 bg-zinc-950 min-w-[100px]">
                  <span className="text-4xl font-light font-mono text-white tracking-tight leading-none">
                    {cityData.averageRating !== null ? cityData.averageRating : "—"}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 mt-2">
                    {cityData.totalReviews} {cityData.totalReviews === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>

              {/* Minimalist Vitals Bar (Wifi, Cost, Tagline) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-y border-zinc-900 py-3 font-mono text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-600">Wifi Metric</span>
                  <span className="text-zinc-200 mt-0.5">{cityData.wifiSpeed}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-600">Monthly Est.</span>
                  <span className="text-zinc-200 mt-0.5">{cityData.monthlyCost}</span>
                </div>
                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase text-zinc-600">Environment</span>
                  <span className="text-zinc-400 mt-0.5 truncate">{cityData.tagline}</span>
                </div>
              </div>
            </div>

            {/* Field Reviews Section */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
                  FIELD DISPATCHES ({cityData.totalReviews})
                </span>

                <button
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                  className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isReviewOpen ? "− Cancel" : "+ File Report"}
                </button>
              </div>

              {/* Inline Review Form */}
              {isReviewOpen && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg flex flex-col gap-4 font-mono"
                >
                  <span className="text-xs uppercase tracking-widest text-white font-semibold">
                    Record Field Observation for {cityData.city}
                  </span>

                  {reviewError && (
                    <p className="text-xs text-red-400 border border-red-900/50 p-2 rounded bg-red-950/20">
                      {reviewError}
                    </p>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-zinc-500">Nomad Callsign</label>
                    <input
                      type="text"
                      placeholder="e.g. Scout_Levi or Nomad_Alex"
                      value={reviewCallsign}
                      onChange={(e) => setReviewCallsign(e.target.value)}
                      className="bg-black border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-zinc-500">Rating (1 to 5 Stars)</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`w-9 h-9 rounded border text-sm font-mono transition-all cursor-pointer ${
                            reviewRating === star
                              ? "bg-white text-black border-white font-bold"
                              : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600"
                          }`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-zinc-500">Observations</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Document wifi stability, noise floor, walkability, cafes, or safety..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="bg-black border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-zinc-500 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || !reviewComment.trim()}
                    className="w-full py-2.5 rounded bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submittingReview ? "Logging..." : "Transmit Dispatch"}
                  </button>
                </form>
              )}

              {/* Highlighted Latest Review */}
              {cityData.latestReview && (
                <div className="border border-zinc-800 p-5 rounded-lg flex flex-col gap-2.5 bg-zinc-950/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded">
                      Latest Field Dispatch
                    </span>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {formatDate(cityData.latestReview.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs mt-1">
                    <span className="text-zinc-200 font-semibold">
                      @{cityData.latestReview.nomadCallsign}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-400">
                      {"★".repeat(cityData.latestReview.rating)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono mt-1">
                    &ldquo;{cityData.latestReview.comment}&rdquo;
                  </p>
                </div>
              )}

              {/* Past Reviews List */}
              {cityData.reviews.length > 0 && (
                <div className="flex flex-col divide-y divide-zinc-900 border-y border-zinc-900">
                  {cityData.reviews.map((rev) => (
                    <div key={rev.id} className="py-4 flex flex-col gap-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-300 font-medium">@{rev.nomadCallsign}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-zinc-500">{"★".repeat(rev.rating)}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {cityData.totalReviews === 0 && (
                <div className="py-8 text-center text-xs font-mono text-zinc-600 border border-dashed border-zinc-900 rounded-lg">
                  No dispatches recorded yet for {cityData.city}. Be the first wanderer to log a report.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* 5. MINIMALIST FOOTER */}
        {/* ============================================================== */}
        <footer className="pt-12 pb-6 text-center border-t border-zinc-900 flex flex-col items-center gap-2">
          <p className="text-[10px] text-zinc-600 font-mono tracking-[0.25em] uppercase">
            THE OUTPOST · DECENTRALIZED NOMAD MESH · MADE BY AN
          </p>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* 6. MINIMALIST ENLIST MODAL */}
      {/* ============================================================== */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-zinc-800 w-full max-w-sm rounded-xl p-6 flex flex-col gap-4 font-mono shadow-2xl relative">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              [ESC]
            </button>

            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              RECON NETWORK // ENLIST
            </span>

            <h3 className="text-lg font-light text-white tracking-wide">
              Nomad Mesh Registration
            </h3>

            {enlistDone ? (
              <div className="border border-zinc-700 p-4 rounded text-center">
                <span className="text-xs text-zinc-200">
                  Callsign @{callsign} registered to the mesh.
                </span>
              </div>
            ) : (
              <form onSubmit={handleEnlistSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-zinc-500">Callsign</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scout_Levi"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-zinc-200 transition-colors cursor-pointer mt-1"
                >
                  Join Mesh
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
