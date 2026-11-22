"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RestaurantData {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/${id}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setError("Outpost not found.");
          } else {
            setError("Unable to load outpost data.");
          }
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Network error. Could not connect to the outpost.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [id]);

  if (loading) {
    return (
      <main className="w-full max-w-[560px] mx-auto px-5 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-sm text-[#73726C] animate-pulse">Consulting the archives...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="w-full max-w-[560px] mx-auto px-5 py-12">
        <div className="bg-white border border-[#E5E5E0] rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-[#141413] mb-2">{error || "Not found"}</h2>
          <p className="text-sm text-[#73726C] mb-4">No records exist for Outpost #{id}.</p>
          <Link
            href="/restaurant/1"
            className="text-sm text-[#9E382B] hover:underline font-medium"
          >
            ← Return to primary outpost
          </Link>
        </div>
      </main>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <span className="text-sm tracking-wider text-[#9E382B]" aria-label={`${rating} out of 5 stars`}>
        {"★".repeat(rating)}
        <span className="text-[#D4D4CE]">{"★".repeat(5 - rating)}</span>
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

  return (
    <main className="w-full max-w-[560px] mx-auto px-5 py-10 flex flex-col gap-8">
      {/* Brand Header */}
      <header className="border-b border-[#E5E5E0] pb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#8C8B85]">
          The Outpost · Dispatch #0{id}
        </span>
        <span className="text-xs text-[#8C8B85] font-mono">NOMAD NETWORK</span>
      </header>

      {/* 1. Restaurant Name, with cuisine and area underneath */}
      <section>
        <h1 className="text-3xl font-medium tracking-tight text-[#141413]">
          {data.name}
        </h1>
        <p className="text-sm text-[#73726C] mt-1.5">
          {data.cuisine} · {data.area}
        </p>
      </section>

      {/* 2. The average rating, large — the biggest thing on the page — with review count */}
      <section className="flex items-baseline gap-3 pt-2 pb-4 border-b border-[#E5E5E0]">
        <span className="text-6xl font-light tracking-tight text-[#141413] leading-none">
          {data.averageRating !== null ? data.averageRating : "—"}
        </span>
        <div className="flex flex-col">
          {data.averageRating !== null && renderStars(Math.round(data.averageRating))}
          <span className="text-xs text-[#73726C] mt-1 font-mono">
            {data.totalReviews} {data.totalReviews === 1 ? "field review" : "field reviews"}
          </span>
        </div>
      </section>

      {/* 6. Empty state if there are no reviews yet */}
      {data.totalReviews === 0 && (
        <section className="bg-white border border-[#E5E5E0] rounded-lg p-6 text-center">
          <p className="text-sm text-[#73726C] mb-4">
            No reports filed for this outpost yet. Be the first wanderer to record a dispatch.
          </p>
          <Link
            href={`/review/${id}`}
            className="inline-block bg-[#141413] hover:bg-[#2A2928] text-white py-2.5 px-6 rounded-lg text-sm font-medium transition-colors"
          >
            File First Review
          </Link>
        </section>
      )}

      {/* 3. The latest review, visually highlighted so it clearly sits apart from the rest */}
      {data.latestReview && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#9E382B]">
              Latest Field Report
            </span>
            <span className="text-xs text-[#8C8B85] font-mono">
              {formatDate(data.latestReview.createdAt)}
            </span>
          </div>
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-5">
            <div className="mb-2">
              {renderStars(data.latestReview.rating)}
            </div>
            <p className="text-base text-[#141413] leading-relaxed">
              &ldquo;{data.latestReview.comment}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* 4. Older reviews below, in a plain list */}
      {data.reviews.length > 0 && (
        <section className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C8B85]">
            Previous Dispatches ({data.reviews.length})
          </span>
          <div className="divide-y divide-[#EFEFEA] border-y border-[#EFEFEA]">
            {data.reviews.map((rev) => (
              <div key={rev.id} className="py-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  {renderStars(rev.rating)}
                  <span className="text-xs text-[#8C8B85] font-mono">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#383734] leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. A link to /review/[id] */}
      <section className="pt-2">
        <Link
          href={`/review/${id}`}
          className="w-full block bg-[#141413] hover:bg-[#2A2928] text-white py-3.5 px-5 rounded-lg text-sm font-medium text-center transition-colors tracking-wide"
        >
          Submit a Field Review
        </Link>
      </section>

      {/* Footer attribution */}
      <footer className="pt-4 pb-2 text-center border-t border-[#EFEFEA]">
        <p className="text-xs text-[#8C8B85] font-mono tracking-widest uppercase">
          The Outpost · Made by AN
        </p>
      </footer>
    </main>
  );
}
