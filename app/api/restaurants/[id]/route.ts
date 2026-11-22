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
        { error: "Outpost not found." },
        { status: 404 }
      );
    }

    // 1. Fetch restaurant details
    const restaurants = await sql`
      SELECT id, name, cuisine, area, region, tagline, description
      FROM restaurants
      WHERE id = ${restaurantId}
      LIMIT 1;
    `;

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Outpost not found." },
        { status: 404 }
      );
    }

    const restaurant = restaurants[0];

    // 2. Fetch provisions (menu items) with dynamic rating per item
    const menuItems = await sql`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.category,
        m.is_signature,
        ROUND(AVG(rev.rating)::numeric, 1) AS avg_rating,
        COUNT(rev.id)::int AS review_count
      FROM menu_items m
      LEFT JOIN reviews rev ON rev.menu_item_id = m.id
      WHERE m.restaurant_id = ${restaurantId}
      GROUP BY m.id, m.name, m.description, m.price, m.category, m.is_signature
      ORDER BY m.is_signature DESC, m.id ASC;
    `;

    // 3. Fetch all reviews sorted newest first, with provision name attached
    const reviewsList = await sql`
      SELECT 
        rev.id,
        rev.rating,
        rev.comment,
        rev.nomad_callsign,
        rev.created_at,
        m.name AS item_name
      FROM reviews rev
      LEFT JOIN menu_items m ON m.id = rev.menu_item_id
      WHERE rev.restaurant_id = ${restaurantId}
      ORDER BY rev.created_at DESC;
    `;

    // 4. Compute overall outpost stats
    const stats = await sql`
      SELECT 
        AVG(rating)::numeric AS avg_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE restaurant_id = ${restaurantId};
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
      nomadCallsign: String(r.nomad_callsign || "Anonymous Wanderer"),
      itemName: r.item_name ? String(r.item_name) : null,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    });

    const latestReview = reviewsList.length > 0 ? formatReview(reviewsList[0]) : null;
    const remainingReviews = reviewsList.slice(1).map(formatReview);

    const formattedMenuItems = menuItems.map((m: Record<string, any>) => ({
      id: Number(m.id),
      name: String(m.name),
      description: String(m.description),
      price: Number(m.price),
      category: String(m.category),
      isSignature: Boolean(m.is_signature),
      averageRating: m.avg_rating !== null ? Number(m.avg_rating) : null,
      reviewCount: Number(m.review_count),
    }));

    return NextResponse.json({
      id: Number(restaurant.id),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      region: restaurant.region,
      tagline: restaurant.tagline,
      description: restaurant.description,
      averageRating,
      totalReviews,
      latestReview,
      reviews: remainingReviews,
      menuItems: formattedMenuItems,
    });
  } catch (error) {
    console.error("Error fetching outpost details:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
