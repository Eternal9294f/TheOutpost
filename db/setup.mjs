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
  console.log("Applying minimalist nomad travel schema...");
  
  await sql.transaction([
    sql`DROP TABLE IF EXISTS reviews CASCADE`,
    sql`DROP TABLE IF EXISTS cities CASCADE`,
    sql`CREATE TABLE cities (
      id SERIAL PRIMARY KEY,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      area TEXT NOT NULL,
      wifi_speed TEXT NOT NULL,
      monthly_cost TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL
    )`,
    sql`CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      nomad_callsign TEXT NOT NULL DEFAULT 'Anonymous Nomad',
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  ]);

  console.log("Seeding real global nomad hubs...");

  const hubs = [
    // Japan
    {
      country: "Japan",
      city: "Tokyo",
      area: "Shibuya & Daikanyama",
      wifi_speed: "850 Mbps",
      monthly_cost: "$2,200/mo",
      tagline: "Hyper-efficient infrastructure, pristine safety, and 24/7 focus hubs.",
      description: "A haven for remote software engineers and designers. Unbeatable optical fiber, whisper-quiet cafes, and seamless train networks across the metropolis."
    },
    {
      country: "Japan",
      city: "Kyoto",
      area: "Gion & Kamogawa",
      wifi_speed: "500 Mbps",
      monthly_cost: "$1,650/mo",
      tagline: "Historic machiya workhouses, zen temple gardens, and contemplative deep-work.",
      description: "For nomads craving stillness. Work alongside the river in 100-year-old wooden teahouses wired with gigabit internet."
    },
    // China
    {
      country: "China",
      city: "Chongqing",
      area: "Yuzhong Peninsula",
      wifi_speed: "650 Mbps",
      monthly_cost: "$950/mo",
      tagline: "Multi-layered cyberpunk architecture, high elevation fog, and 24hr tea houses.",
      description: "A futuristic vertical 3D city. Ridiculously affordable living costs, blazing fiber, and neon skyline views from cliffside cafes."
    },
    {
      country: "China",
      city: "Shanghai",
      area: "Jing'an & Former French Concession",
      wifi_speed: "750 Mbps",
      monthly_cost: "$1,850/mo",
      tagline: "Global tech and venture epicenter flanked by tree-lined boutique avenues.",
      description: "World-class specialty coffee density, bustling expat founder community, and bullet train connectivity to Hangzhou and Suzhou."
    },
    // India
    {
      country: "India",
      city: "Delhi",
      area: "Hauz Khas & Lodhi",
      wifi_speed: "350 Mbps",
      monthly_cost: "$750/mo",
      tagline: "Centuries-old Mughal tombs integrated with contemporary creator lofts.",
      description: "India's capital presents unmatched affordability, vibrant creator hubs, and an energetic tech meetup landscape in South Delhi."
    },
    {
      country: "India",
      city: "Goa",
      area: "Arambol & Anjuna",
      wifi_speed: "250 Mbps",
      monthly_cost: "$850/mo",
      tagline: "Coastal sunsets, beachside work shacks, and a massive nomadic builder culture.",
      description: "The primary nomad capital of South Asia. Open-air cowork spaces, morning yoga on the sand, and sunset community hackathons."
    },
    // Germany
    {
      country: "Germany",
      city: "Frankfurt",
      area: "Innenstadt & Sachsenhausen",
      wifi_speed: "600 Mbps",
      monthly_cost: "$2,300/mo",
      tagline: "The continental digital routing exchange (DE-CIX) with rapid pan-European rail.",
      description: "Extremely low latency internet, international banking and tech headquarters, and serene parks flanking the Main river."
    },
    {
      country: "Germany",
      city: "Hamburg",
      area: "Sternschanze & Speicherstadt",
      wifi_speed: "520 Mbps",
      monthly_cost: "$1,950/mo",
      tagline: "Brick warehouse canals, maritime culture, and an independent developer ethos.",
      description: "Alternative cafes, thriving indie design agencies, and clean public workspaces across one of Europe's greatest port cities."
    },
    // Spain
    {
      country: "Spain",
      city: "Barcelona",
      area: "El Poblenou & Gràcia",
      wifi_speed: "550 Mbps",
      monthly_cost: "$1,800/mo",
      tagline: "300 days of Mediterranean sunlight, beach proximity, and a bustling 22@ tech hub.",
      description: "One of Europe's top digital nomad capitals. Walkable pedestrian boulevards, vibrant tapas bars, and a thriving international remote worker community."
    }
  ];

  const cityIds = [];
  for (const hub of hubs) {
    const [inserted] = await sql`
      INSERT INTO cities (country, city, area, wifi_speed, monthly_cost, tagline, description)
      VALUES (${hub.country}, ${hub.city}, ${hub.area}, ${hub.wifi_speed}, ${hub.monthly_cost}, ${hub.tagline}, ${hub.description})
      RETURNING id;
    `;
    cityIds.push({ id: inserted.id, city: hub.city, country: hub.country });
  }

  console.log("Seeding authentic nomad reviews...");

  // Seed reviews for Tokyo
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[0].id}, 'Scout_Kaito', 5, 'Shibuya fiber speeds clocked 920 Mbps on speedtest. Incredible focus culture in cafes; nobody talks loudly, perfect for marathon coding sessions.', NOW() - INTERVAL '10 days'),
      (${cityIds[0].id}, 'Elena_Codes', 4, 'Safest city on the planet to walk around at 3 AM with a laptop. Only downside is rent in central wards can get steep.', NOW() - INTERVAL '6 days'),
      (${cityIds[0].id}, 'Dev_Nomad', 5, 'The coffee roasteries in Daikanyama are unmatched. Reliable sockets everywhere and 7-Eleven runs for midnight brain fuel.', NOW() - INTERVAL '2 days');
  `;

  // Seed reviews for Kyoto
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[1].id}, 'ZenCoder', 5, 'Rented a machiya near Kamogawa for 2 months. My productivity tripled. The quiet temple surroundings remove all mental friction.', NOW() - INTERVAL '8 days'),
      (${cityIds[1].id}, 'Marcus_V', 4, 'High speed internet even in older traditional houses. Just note that public transportation is mostly buses rather than subway.', NOW() - INTERVAL '3 days');
  `;

  // Seed reviews for Chongqing
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[2].id}, 'CyberWanderer', 5, 'The scale of Chongqing is mind-blowing. High-speed 5G everywhere, incredible spicy street food for $3, and modern apartments under $500/mo.', NOW() - INTERVAL '12 days'),
      (${cityIds[2].id}, 'NeoScout', 4, 'Spectacular scenery and warm locals. Make sure to set up your Alipay/WeChat Pay before arriving.', NOW() - INTERVAL '4 days');
  `;

  // Seed reviews for Delhi
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[4].id}, 'Aryan_Founder', 5, 'Hauz Khas Village has such creative energy. Fantastic artisan coffee shops overlooking 13th-century reservoirs. Costs are a fraction of Europe.', NOW() - INTERVAL '9 days'),
      (${cityIds[4].id}, 'Wanderlust_Sam', 4, 'Great coworking spaces in South Delhi. Uber is practically instant and dirt cheap.', NOW() - INTERVAL '5 days');
  `;

  // Seed reviews for Goa
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[5].id}, 'GoaHacker', 5, 'Work all morning with ocean views in Arambol, swim at sunset, and attend crypto/AI meetups at night. Starlink and optical fiber made Goa a real nomad paradise.', NOW() - INTERVAL '7 days'),
      (${cityIds[5].id}, 'Nomad_Priya', 5, 'Unmatched community spirit. You make friends for life within 48 hours of arriving.', NOW() - INTERVAL '1 day');
  `;

  // Seed reviews for Frankfurt
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[6].id}, 'Lukas_Dev', 4, 'Latency to European cloud servers is single-digit milliseconds. Clean, punctual, and central to everything in Europe.', NOW() - INTERVAL '11 days');
  `;

  // Seed reviews for Barcelona
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityIds[8].id}, 'Mateo_UX', 5, 'Poblenou is the gold standard of nomad neighborhoods. 5 minutes from the beach, converted industrial warehouses with fiber, and endless sunny days.', NOW() - INTERVAL '6 days'),
      (${cityIds[8].id}, 'Sophie_Remote', 5, 'High quality of life. The nomad meetups every Thursday bring together 100+ international remote workers.', NOW() - INTERVAL '2 days');
  `;

  console.log("Nomad platform database successfully reset and seeded!");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
