import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      databaseUrl = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
      break;
    }
  }
}

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env.local or environment.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setup() {
  console.log("Applying schema...");
  const schemaSql = fs.readFileSync(path.resolve(process.cwd(), "db/schema.sql"), "utf-8");
  
  // Execute schema DDL
  await sql.transaction([
    sql`DROP TABLE IF EXISTS reviews CASCADE`,
    sql`DROP TABLE IF EXISTS restaurants CASCADE`,
    sql`CREATE TABLE restaurants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      area TEXT NOT NULL
    )`,
    sql`CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  ]);

  console.log("Seeding initial data...");
  const [restaurant] = await sql`
    INSERT INTO restaurants (name, cuisine, area)
    VALUES ('The Falcon''s Rest', 'Hearth & Nomad Roasts', 'District 4 — Falcon Quarter')
    RETURNING *;
  `;

  await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at)
    VALUES 
      (${restaurant.id}, 5, 'Smoked boar roast was unreal. Fast uplink to grind for hours.', NOW() - INTERVAL '8 days'),
      (${restaurant.id}, 4, 'Solid fuel, but slow service during the evening rush.', NOW() - INTERVAL '6 days'),
      (${restaurant.id}, 4, 'Reliable table and warm hearth. Would repeat.', NOW() - INTERVAL '2 days');
  `;

  console.log("\n--- Restaurants in database ---");
  const restaurants = await sql`SELECT * FROM restaurants;`;
  console.table(restaurants);

  console.log("\n--- Reviews in database ---");
  const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at DESC;`;
  console.table(reviews);

  console.log("\nDatabase setup complete!");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
