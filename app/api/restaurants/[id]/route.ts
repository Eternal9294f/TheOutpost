import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurantId = parseInt(id, 10);

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    // 1. Fetch restaurant details
    const restaurants = await sql`
      SELECT id, name, cuisine, area
      FROM restaurants
      WHERE id = ${restaurantId}
      LIMIT 1;
    `;

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const restaurant = restaurants[0];

    // 2. Fetch all reviews sorted newest first
    const reviewsList = await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC;
    `;

    // 3. Compute stats with raw SQL
    const stats = await sql`
      SELECT 
        AVG(rating)::numeric AS avg_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE restaurant_id = ${restaurantId};
    `;

    const totalReviews = Number(stats[0]?.total_reviews ?? 0);
    const rawAvg = stats[0]?.avg_rating;

    // Rule 18: If there are no reviews at all
    if (totalReviews === 0) {
      return NextResponse.json({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        area: restaurant.area,
        averageRating: null,
        totalReviews: 0,
        latestReview: null,
        reviews: [],
      });
    }

    // Rule 14: averageRating rounded to one decimal place in the backend
    const averageRating = rawAvg !== null && rawAvg !== undefined
      ? Math.round(Number(rawAvg) * 10) / 10
      : null;

    // Helper to format review object
    const formatReview = (r: { id: number; rating: number; comment: string; created_at: string | Date }) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    });

    // Rule 16: latestReview is the newest review
    const latestReview = formatReview(reviewsList[0]);

    // Rule 17: reviews is every review except the latest one, newest first
    const remainingReviews = reviewsList.slice(1).map(formatReview);

    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating,
      totalReviews,
      latestReview,
      reviews: remainingReviews,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
