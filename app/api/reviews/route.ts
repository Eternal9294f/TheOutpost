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

    const { restaurantId, menuItemId, nomadCallsign, rating, comment } = body;

    // Check 1: rating is an integer from 1 to 5
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be a whole number between 1 and 5." },
        { status: 400 }
      );
    }

    // Check 2: comment is a non-empty string after trimming whitespace
    if (typeof comment !== "string" || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 }
      );
    }

    // Check 3: restaurantId refers to a restaurant that actually exists
    if (
      typeof restaurantId !== "number" ||
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return NextResponse.json(
        { error: "Outpost does not exist." },
        { status: 400 }
      );
    }

    const restaurantExists = await sql`
      SELECT id FROM restaurants WHERE id = ${restaurantId} LIMIT 1;
    `;

    if (restaurantExists.length === 0) {
      return NextResponse.json(
        { error: "Outpost does not exist." },
        { status: 400 }
      );
    }

    // Optional Check 4: menuItemId validation
    let validMenuItemId: number | null = null;
    if (menuItemId !== undefined && menuItemId !== null && menuItemId !== "") {
      const parsedItemId = Number(menuItemId);
      if (Number.isInteger(parsedItemId) && parsedItemId > 0) {
        const itemExists = await sql`
          SELECT id FROM menu_items WHERE id = ${parsedItemId} AND restaurant_id = ${restaurantId} LIMIT 1;
        `;
        if (itemExists.length > 0) {
          validMenuItemId = parsedItemId;
        }
      }
    }

    const cleanCallsign = typeof nomadCallsign === "string" && nomadCallsign.trim().length > 0
      ? nomadCallsign.trim().slice(0, 50)
      : "Anonymous Wanderer";

    const trimmedComment = comment.trim();

    // Insert review using raw SQL
    const result = await sql`
      INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment)
      VALUES (${restaurantId}, ${validMenuItemId}, ${cleanCallsign}, ${rating}, ${trimmedComment})
      RETURNING id;
    `;

    return NextResponse.json(
      { success: true, reviewId: result[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
