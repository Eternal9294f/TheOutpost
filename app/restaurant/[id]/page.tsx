"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isSignature: boolean;
  averageRating: number | null;
  reviewCount: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  nomadCallsign: string;
  itemName: string | null;
  createdAt: string;
}

interface OutpostSummary {
  id: number;
  name: string;
  area: string;
  region: string;
  averageRating: number | null;
  totalReviews: number;
}

interface RestaurantData {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  region: string;
  tagline: string;
  description: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
  menuItems: MenuItem[];
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<RestaurantData | null>(null);
  const [allOutposts, setAllOutposts] = useState<OutpostSummary[]>([]);
  const [activeTab, setActiveTab] = useState<"provisions" | "dispatches">("provisions");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join Network Modal
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [callsignInput, setCallsignInput] = useState("");
  const [roleInput, setRoleInput] = useState("Engineer");
  const [enlistSuccess, setEnlistSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch current outpost
        const res = await fetch(`/api/restaurants/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setError("Outpost not found in the global registry.");
          return;
        }
        const json = await res.json();
        setData(json);

        // 2. Fetch all outposts for the global switcher
        const allRes = await fetch("/api/restaurants", { cache: "no-store" });
        if (allRes.ok) {
          const allJson = await allRes.json();
          setAllOutposts(allJson.outposts || []);
        }
      } catch {
        setError("Network error. Could not connect to the Recon Mesh.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const renderStars = (rating: number, max: number = 5) => {
    return (
      <span className="text-amber-400 font-mono tracking-widest text-sm inline-flex items-center">
        {"★".repeat(Math.min(rating, max))}
        <span className="text-zinc-700">{"★".repeat(Math.max(0, max - rating))}</span>
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleEnlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsignInput.trim()) return;
    setEnlistSuccess(true);
    setTimeout(() => {
      setIsJoinOpen(false);
      setEnlistSuccess(false);
      setCallsignInput("");
    }, 2000);
  };

  if (loading) {
    return (
      <main className="w-full max-w-[620px] mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Connecting to Recon Mesh...
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="w-full max-w-[620px] mx-auto px-4 py-16">
        <div className="bg-[#12141A] border border-zinc-800 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">{error || "Outpost Missing"}</h2>
          <p className="text-sm text-zinc-400 mb-6">No active station registered for Outpost #{id}.</p>
          <Link
            href="/restaurant/1"
            className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs uppercase tracking-wider font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ← Fallback to HQ (Tokyo Station)
          </Link>
        </div>
      </main>
    );
  }

  // Group menu items by category
  const categories = Array.from(new Set(data.menuItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#F4F4F6] pb-16">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0B0E]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-[620px] mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-xs uppercase tracking-widest font-bold text-white font-mono">
              THE OUTPOST
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 hidden sm:inline-block">
              Nomad Mesh
            </span>
          </div>

          <button
            onClick={() => setIsJoinOpen(true)}
            className="text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm shadow-red-950 cursor-pointer"
          >
            Enlist / Join
          </button>
        </div>
      </header>

      <main className="w-full max-w-[620px] mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* 2. Global Outpost Selector (Tokyo, Bali, Lisbon, Medellín, Goa) */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 font-mono">
              Global Stations ({allOutposts.length})
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">Select Hub</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allOutposts.map((outpost) => {
              const isSelected = outpost.id === data.id;
              return (
                <button
                  key={outpost.id}
                  onClick={() => router.push(`/restaurant/${outpost.id}`)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800 text-white border-zinc-600 font-semibold shadow-inner"
                      : "bg-[#12141A] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] text-red-400 mr-1.5">#{outpost.id}</span>
                  {outpost.name.replace("The ", "")}
                  <span className="ml-2 text-[10px] text-zinc-500">
                    {outpost.averageRating ? `★ ${outpost.averageRating}` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Outpost Hero Profile Card */}
        <section className="bg-[#12141A] border border-zinc-800 rounded-xl p-6 flex flex-col gap-5 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/60">
                  {data.region}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {data.area}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {data.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {data.cuisine}
              </p>
            </div>

            {/* Hero Big Dynamic Average Rating */}
            <div className="flex flex-col items-end text-right bg-[#0A0B0E] border border-zinc-800 rounded-lg px-4 py-3 min-w-[95px]">
              <span className="text-4xl font-extrabold tracking-tight text-white leading-none">
                {data.averageRating !== null ? data.averageRating : "—"}
              </span>
              <div className="mt-1">
                {data.averageRating !== null && renderStars(Math.round(data.averageRating))}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-1">
                {data.totalReviews} {data.totalReviews === 1 ? "report" : "reports"}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-4">
            {data.description}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono bg-[#0A0B0E]/60 p-2.5 rounded-lg border border-zinc-800/60">
            <span className="text-emerald-400 font-semibold">● ACTIVE HUB</span>
            <span className="text-zinc-600">|</span>
            <span className="truncate">{data.tagline}</span>
          </div>
        </section>

        {/* 4. Interactive Tabs: Provisions vs Field Dispatches */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("provisions")}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "provisions"
                  ? "border-red-500 text-white bg-zinc-900/40"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Provisions & Rations</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                {data.menuItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("dispatches")}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "dispatches"
                  ? "border-red-500 text-white bg-zinc-900/40"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Field Reports</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                {data.totalReviews}
              </span>
            </button>
          </div>

          {/* TAB 1: PROVISIONS (Menu Items) */}
          {activeTab === "provisions" && (
            <div className="flex flex-col gap-6">
              {categories.map((cat) => {
                const itemsInCat = data.menuItems.filter((i) => i.category === cat);
                return (
                  <div key={cat} className="flex flex-col gap-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 font-mono">
                      {cat}
                    </span>
                    <div className="flex flex-col gap-2.5">
                      {itemsInCat.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#12141A] border border-zinc-800 hover:border-zinc-700 transition-all rounded-xl p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-white">
                                {item.name}
                              </h3>
                              {item.isSignature && (
                                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  Signature
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-mono font-bold text-white bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                              ${item.price}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-1">
                            <div className="flex items-center gap-2">
                              {item.averageRating !== null ? (
                                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                                  <span>★ {item.averageRating}</span>
                                  <span className="text-[11px] text-zinc-500">
                                    ({item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-500 font-mono">
                                  No ratings yet
                                </span>
                              )}
                            </div>

                            <Link
                              href={`/review/${data.id}?itemId=${item.id}`}
                              className="text-xs text-red-400 hover:text-red-300 font-mono uppercase tracking-wider transition-colors"
                            >
                              Review Item →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: FIELD DISPATCHES (Reviews) */}
          {activeTab === "dispatches" && (
            <div className="flex flex-col gap-6">
              {/* Highlighted Latest Review */}
              {data.latestReview && (
                <div className="bg-[#12141A] border-2 border-red-900/60 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50">
                      Latest Field Dispatch
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {formatDate(data.latestReview.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderStars(data.latestReview.rating)}
                    <span className="text-xs font-semibold text-white font-mono">
                      @{data.latestReview.nomadCallsign}
                    </span>
                    {data.latestReview.itemName && (
                      <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {data.latestReview.itemName}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-zinc-200 leading-relaxed italic">
                    &ldquo;{data.latestReview.comment}&rdquo;
                  </p>
                </div>
              )}

              {/* Past Reviews List */}
              {data.reviews.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest font-bold text-zinc-400 font-mono">
                    Prior Reports ({data.reviews.length})
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {data.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-[#12141A] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {renderStars(rev.rating)}
                            <span className="text-xs font-semibold text-white font-mono">
                              @{rev.nomadCallsign}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>

                        {rev.itemName && (
                          <div className="text-[11px] text-zinc-400 font-mono">
                            Provision: <span className="text-zinc-300 font-semibold">{rev.itemName}</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state if zero reviews */}
              {data.totalReviews === 0 && (
                <div className="bg-[#12141A] border border-zinc-800 rounded-xl p-8 text-center flex flex-col items-center gap-3">
                  <p className="text-sm text-zinc-400">
                    No field reports filed for this station yet. Be the first scout to file a dispatch.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. Sticky / Primary CTA: File a Field Report */}
        <section className="pt-4">
          <Link
            href={`/review/${data.id}`}
            className="w-full block bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl text-center text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-950 cursor-pointer"
          >
            File a Field Report
          </Link>
        </section>

        {/* 6. High-Contrast Footer */}
        <footer className="pt-8 pb-4 text-center border-t border-zinc-800/80 mt-6">
          <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
            The Outpost · Global Nomad Network · Made by AN
          </p>
        </footer>
      </main>

      {/* 7. Enlist in Nomad Network Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141A] border border-zinc-700 w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative">
            <button
              onClick={() => setIsJoinOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-mono cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-400">
                Nomad Network Roster
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Enlist in the Recon Corp
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Join 1,400+ remote engineers, founders, and creators roaming verified global outposts.
              </p>
            </div>

            {enlistSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-center">
                <p className="text-emerald-400 text-sm font-semibold">
                  ✓ Dispatch Confirmed!
                </p>
                <p className="text-xs text-zinc-300 mt-1 font-mono">
                  Welcome to the mesh, @{callsignInput}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnlistSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-mono text-zinc-400 font-semibold">
                    Callsign / Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={callsignInput}
                    onChange={(e) => setCallsignInput(e.target.value)}
                    placeholder="e.g. Scout_Levi or Nomad_Alex"
                    className="bg-[#0A0B0E] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-mono text-zinc-400 font-semibold">
                    Nomad Role
                  </label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="bg-[#0A0B0E] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Engineer">Software Engineer</option>
                    <option value="Founder">Founder / Builder</option>
                    <option value="Designer">Product Designer</option>
                    <option value="Researcher">Researcher / Writer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer mt-2"
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
