import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cityId = parseInt(id, 10);

    if (isNaN(cityId) || cityId <= 0) {
      return NextResponse.json({ error: "Outpost destination not found." }, { status: 404 });
    }

    const cities = await sql`
      SELECT id, country, city, area, wifi_speed, monthly_cost, tagline, description
      FROM cities
      WHERE id = ${cityId}
      LIMIT 1;
    `;

    if (cities.length === 0) {
      return NextResponse.json({ error: "Outpost destination not found." }, { status: 404 });
    }

    const c = cities[0];

    const reviewsList = await sql`
      SELECT id, rating, comment, nomad_callsign, created_at
      FROM reviews
      WHERE city_id = ${cityId}
      ORDER BY created_at DESC;
    `;

    const stats = await sql`
      SELECT 
        AVG(rating)::numeric AS avg_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE city_id = ${cityId};
    `;

    const totalReviews = Number(stats[0]?.total_reviews ?? 0);
    const rawAvg = stats[0]?.avg_rating;
    const averageRating = rawAvg !== null && rawAvg !== undefined
      ? Math.round(Number(rawAvg) * 10) / 10
      : null;

    const formatReview = (r: Record<string, any>) => ({
      id: Number(r.id),
      rating: Number(r.rating),
      comment: String(r.comment),
      nomadCallsign: String(r.nomad_callsign || "Anonymous Nomad"),
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    });

    const latestReview = reviewsList.length > 0 ? formatReview(reviewsList[0]) : null;
    const remainingReviews = reviewsList.slice(1).map(formatReview);

    return NextResponse.json({
      id: Number(c.id),
      country: String(c.country),
      city: String(c.city),
      name: `${c.city}, ${c.country}`,
      area: String(c.area),
      cuisine: String(c.tagline),
      wifiSpeed: String(c.wifi_speed),
      monthlyCost: String(c.monthly_cost),
      tagline: String(c.tagline),
      description: String(c.description),
      averageRating,
      totalReviews,
      latestReview,
      reviews: remainingReviews,
    });
  } catch (error) {
    console.error("Error fetching city outpost:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
