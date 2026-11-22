"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface MenuItem {
  id: number;
  name: string;
  category: string;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedItemId = searchParams.get("itemId");

  const [restaurantName, setRestaurantName] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>(preselectedItemId || "");
  const [callsign, setCallsign] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurantName(data.name);
          setMenuItems(data.menuItems || []);
        } else {
          setRestaurantName(`Outpost #${restaurantId}`);
        }
      } catch {
        setRestaurantName(`Outpost #${restaurantId}`);
      }
    }
    loadData();
  }, [restaurantId]);

  const isFormValid = rating !== null && rating >= 1 && rating <= 5 && comment.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setBackendError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: parseInt(restaurantId, 10),
          menuItemId: selectedItemId ? parseInt(selectedItemId, 10) : null,
          nomadCallsign: callsign.trim() || "Anonymous Wanderer",
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        router.push(`/restaurant/${restaurantId}`);
      } else {
        setBackendError(data.error || "Submission rejected by server.");
      }
    } catch {
      setBackendError("Network failure. Could not connect to the Recon Mesh.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#F4F4F6] pb-16">
      <main className="w-full max-w-[560px] mx-auto px-4 py-10 flex flex-col gap-6">
        {/* Navigation */}
        <nav>
          <Link
            href={`/restaurant/${restaurantId}`}
            className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Outpost Station
          </Link>
        </nav>

        {/* Header */}
        <div className="border-b border-zinc-800 pb-4">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-red-500">
            Dispatch Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            File Field Report
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Station: <span className="text-zinc-200 font-semibold">{restaurantName || "Loading..."}</span>
          </p>
        </div>

        {/* Backend Error Box */}
        {backendError && (
          <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-red-400">
              Error: Dispatch Rejected by Backend
            </span>
            <p className="text-xs sm:text-sm text-red-200">{backendError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nomad Callsign */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase font-mono font-bold text-zinc-300">
              Your Callsign / Handle (Optional)
            </label>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="e.g. Scout_Levi or Nomad_Elena"
              className="bg-[#12141A] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Provision Target */}
          {menuItems.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-mono font-bold text-zinc-300">
                Target Provision / Item (Optional)
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="bg-[#12141A] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="">General Outpost Review (No Specific Item)</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Picker (1 to 5) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-mono font-bold text-zinc-300">
              Score Rating (1 to 5)
            </label>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = (hoveredRating !== null ? hoveredRating : (rating ?? 0)) >= starValue;
                const isSelected = rating === starValue;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className={`flex-1 h-12 flex items-center justify-center rounded-lg border text-2xl transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 scale-105"
                        : isFilled
                        ? "border-zinc-700 bg-zinc-900 text-amber-400"
                        : "border-zinc-800 bg-[#12141A] text-zinc-700 hover:border-zinc-700"
                    }`}
                    aria-label={`${starValue} star`}
                    aria-checked={isSelected}
                    role="radio"
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {rating !== null ? `${rating} of 5 selected` : "Select a score"}
            </span>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment" className="text-xs uppercase font-mono font-bold text-zinc-300">
              Field Observations / Review
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Record connection speeds, provision quality, noise levels, seating ergonomics..."
              className="bg-[#12141A] border border-zinc-800 rounded-lg p-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-lg ${
              isFormValid && !isSubmitting
                ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-red-950"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
          >
            {isSubmitting ? "Transmitting..." : "Submit Field Report"}
          </button>
        </form>
      </main>
    </div>
  );
}
