"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  const router = useRouter();

  const [cityName, setCityName] = useState<string>("");
  const [callsign, setCallsign] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/cities/${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setCityName(`${data.city}, ${data.country}`);
        } else {
          setCityName(`Station #${restaurantId}`);
        }
      } catch {
        setCityName(`Station #${restaurantId}`);
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
          cityId: parseInt(restaurantId, 10),
          nomadCallsign: callsign.trim() || "Anonymous Nomad",
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        router.push(`/`);
      } else {
        setBackendError(data.error || "Submission rejected by server.");
      }
    } catch {
      setBackendError("Network failure. Could not connect to database.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#1C1E21] pb-16 flex flex-col items-center">
      <main className="w-full max-w-[560px] px-5 py-12 flex flex-col gap-6">
        {/* Navigation */}
        <nav>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-[#7A7D85] hover:text-[#1C1E21] transition-colors"
          >
            ← Back to The Outpost
          </Link>
        </nav>

        {/* Header */}
        <div className="border-b border-[#E6E3DB] pb-4">
          <span className="text-[10px] uppercase font-mono font-semibold tracking-[0.2em] text-[#7A7D85]">
            FIELD DISPATCH LOG
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1E21] font-mono mt-1">
            Log Station Observations
          </h1>
          <p className="text-xs text-[#5C6066] font-mono mt-1">
            Station: <span className="text-[#1C1E21] font-semibold">{cityName || "Loading..."}</span>
          </p>
        </div>

        {/* Backend Error Box */}
        {backendError && (
          <div className="bg-[#FBF0EE] border border-[#F0D5D0] rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#963426]">
              Error: Dispatch Rejected
            </span>
            <p className="text-xs text-[#963426]">{backendError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#E2DFD6] bg-white p-6 rounded-2xl flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {/* Nomad Callsign */}
          <div className="flex flex-col gap-1.5 font-mono">
            <label className="text-[10px] uppercase font-semibold text-[#7A7D85]">
              Nomad Callsign / Handle
            </label>
            <input
              type="text"
              placeholder="e.g. Scout_Levi or Nomad_Elena"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="bg-[#FAF9F5] border border-[#E2DFD6] rounded-lg px-3.5 py-2.5 text-xs text-[#1C1E21] focus:outline-none focus:border-[#1C1E21]"
            />
          </div>

          {/* Star Picker (1 to 5) */}
          <div className="flex flex-col gap-2 font-mono">
            <label className="text-[10px] uppercase font-semibold text-[#7A7D85]">
              Score (1 to 5 Stars)
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
                    className={`flex-1 h-11 flex items-center justify-center rounded-lg border text-xl transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1C1E21] bg-[#1C1E21] text-white"
                        : isFilled
                        ? "border-[#C8C5BB] bg-[#F2EFE8] text-[#C27803]"
                        : "border-[#E2DFD6] bg-[#FAF9F5] text-[#A2A6AF] hover:border-[#1C1E21]"
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
            <span className="text-[10px] text-[#7A7D85] font-mono">
              {rating !== null ? `${rating} of 5 selected` : "Select a score"}
            </span>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5 font-mono">
            <label htmlFor="comment" className="text-[10px] uppercase font-semibold text-[#7A7D85]">
              Field Notes / Observations
            </label>
            <textarea
              id="comment"
              rows={4}
              required
              placeholder="Record wifi stability, focus cafes, walkability, safety, community vibe..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-[#FAF9F5] border border-[#E2DFD6] rounded-lg p-3 text-xs text-[#1C1E21] placeholder-[#A2A6AF] focus:outline-none focus:border-[#1C1E21] resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all font-mono ${
              isFormValid && !isSubmitting
                ? "bg-[#1C1E21] hover:bg-[#35393F] text-white cursor-pointer shadow-sm"
                : "bg-[#EAE7DF] text-[#A2A6AF] cursor-not-allowed border border-[#DDD9CE]"
            }`}
          >
            {isSubmitting ? "Transmitting..." : "Submit Field Report"}
          </button>
        </form>
      </main>
    </div>
  );
}
