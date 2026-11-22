import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        c.id,
        c.country,
        c.city,
        c.area,
        c.wifi_speed AS "wifiSpeed",
        c.monthly_cost AS "monthlyCost",
        c.tagline,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), NULL) AS "averageRating",
        COUNT(r.id)::int AS "totalReviews"
      FROM cities c
      LEFT JOIN reviews r ON r.city_id = c.id
      GROUP BY c.id, c.country, c.city, c.area, c.wifi_speed, c.monthly_cost, c.tagline
      ORDER BY c.country ASC, c.id ASC;
    `;

    return NextResponse.json({
      destinations: rows.map((row) => ({
        id: Number(row.id),
        country: String(row.country),
        city: String(row.city),
        area: String(row.area),
        wifiSpeed: String(row.wifiSpeed),
        monthlyCost: String(row.monthlyCost),
        tagline: String(row.tagline),
        averageRating: row.averageRating !== null ? Number(row.averageRating) : null,
        totalReviews: Number(row.totalReviews),
      })),
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
