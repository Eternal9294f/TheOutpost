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

  const [restaurantName, setRestaurantName] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // 19. Fetch restaurant name so user knows what they are reviewing
  useEffect(() => {
    async function loadName() {
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurantName(data.name);
        } else {
          setRestaurantName(`Outpost #${restaurantId}`);
        }
      } catch {
        setRestaurantName(`Outpost #${restaurantId}`);
      }
    }
    loadName();
  }, [restaurantId]);

  // 22. Disabled until rating is picked and comment is non-empty
  const isFormValid = rating !== null && rating >= 1 && rating <= 5 && comment.trim().length > 0;

  // 23. Submit handler
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
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        // Redirect to /restaurant/[id]
        router.push(`/restaurant/${restaurantId}`);
      } else {
        // 24. Display the exact error message from the backend response
        setBackendError(data.error || "An unexpected error occurred.");
      }
    } catch {
      setBackendError("Network connection failed. Could not reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="w-full max-w-[560px] mx-auto px-5 py-10 flex flex-col gap-8">
      {/* Back navigation */}
      <nav>
        <Link
          href={`/restaurant/${restaurantId}`}
          className="text-xs uppercase tracking-wider font-semibold text-[#8C8B85] hover:text-[#141413] transition-colors"
        >
          ← Back to Outpost
        </Link>
      </nav>

      {/* 19. Restaurant name at the top */}
      <section>
        <span className="text-xs uppercase tracking-widest font-semibold text-[#9E382B]">
          New Field Dispatch
        </span>
        <h1 className="text-2xl font-medium tracking-tight text-[#141413] mt-1">
          {restaurantName || "Loading outpost..."}
        </h1>
        <p className="text-sm text-[#73726C] mt-1">
          Leave an uncensored, factual rating for fellow wanderers.
        </p>
      </section>

      {/* 24. Backend error display */}
      {backendError && (
        <div className="bg-[#FFF5F4] border border-[#F4CCC6] rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9E382B] mb-1">
            Submission Rejected by Backend
          </p>
          <p className="text-sm text-[#73271E]">{backendError}</p>
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* 20. Star picker 1 to 5 with clear selected state */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
            Score (1 to 5)
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
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border text-xl transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#141413] bg-[#141413] text-[#FAF8F5]"
                      : isFilled
                      ? "border-[#E5E5E0] bg-white text-[#9E382B]"
                      : "border-[#E5E5E0] bg-white text-[#D4D4CE] hover:border-[#B8B8B2]"
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
          <span className="text-xs text-[#8C8B85] font-mono mt-1">
            {rating !== null ? `${rating} of 5 selected` : "Select a score"}
          </span>
        </div>

        {/* 21. Comment box */}
        <div className="flex flex-col gap-2">
          <label htmlFor="comment" className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
            Field Notes / Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Document food quality, work environment, hearth warmth, or service speed..."
            className="w-full bg-white border border-[#E5E5E0] rounded-lg p-3.5 text-sm text-[#141413] placeholder-[#A09F9A] focus:outline-none focus:border-[#141413] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 22. Submit button disabled until rating picked and comment non-empty */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3.5 px-5 rounded-lg text-sm font-medium tracking-wide transition-all ${
            isFormValid && !isSubmitting
              ? "bg-[#141413] hover:bg-[#2A2928] text-white cursor-pointer"
              : "bg-[#EFEFEA] text-[#A09F9A] cursor-not-allowed border border-[#E5E5E0]"
          }`}
        >
          {isSubmitting ? "Transmitting..." : "Submit Field Report"}
        </button>
      </form>
    </main>
  );
}
