import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const outposts = await sql`
      SELECT 
        r.id,
        r.name,
        r.cuisine,
        r.area,
        r.region,
        r.tagline,
        COALESCE(ROUND(AVG(rev.rating)::numeric, 1), NULL) AS "averageRating",
        COUNT(rev.id)::int AS "totalReviews"
      FROM restaurants r
      LEFT JOIN reviews rev ON rev.restaurant_id = r.id
      GROUP BY r.id, r.name, r.cuisine, r.area, r.region, r.tagline
      ORDER BY r.id ASC;
    `;

    return NextResponse.json({
      outposts: outposts.map((o) => ({
        id: Number(o.id),
        name: o.name,
        cuisine: o.cuisine,
        area: o.area,
        region: o.region,
        tagline: o.tagline,
        averageRating: o.averageRating !== null ? Number(o.averageRating) : null,
        totalReviews: Number(o.totalReviews),
      })),
    });
  } catch (error) {
    console.error("Error fetching outposts:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
