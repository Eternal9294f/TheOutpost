import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const cityId = body.cityId ?? body.restaurantId;
    const { nomadCallsign, rating, comment } = body;

    // Check 1: rating is an integer from 1 to 5
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    // Check 2: comment is a non-empty string after trimming whitespace
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Field observation comment cannot be empty." },
        { status: 400 }
      );
    }

    // Check 3: cityId refers to a city that actually exists
    const parsedCityId = Number(cityId);
    if (!parsedCityId || !Number.isInteger(parsedCityId) || parsedCityId <= 0) {
      return NextResponse.json(
        { error: "Outpost destination does not exist." },
        { status: 400 }
      );
    }

    const cityExists = await sql`
      SELECT id FROM cities WHERE id = ${parsedCityId} LIMIT 1;
    `;

    if (cityExists.length === 0) {
      return NextResponse.json(
        { error: "Outpost destination does not exist." },
        { status: 400 }
      );
    }

    const cleanCallsign = typeof nomadCallsign === "string" && nomadCallsign.trim().length > 0
      ? nomadCallsign.trim().slice(0, 50)
      : "Anonymous Nomad";

    const trimmedComment = comment.trim();

    // Insert review using raw SQL
    const result = await sql`
      INSERT INTO reviews (city_id, nomad_callsign, rating, comment)
      VALUES (${parsedCityId}, ${cleanCallsign}, ${rating}, ${trimmedComment})
      RETURNING id;
    `;

    return NextResponse.json(
      { success: true, reviewId: result[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating field review:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
