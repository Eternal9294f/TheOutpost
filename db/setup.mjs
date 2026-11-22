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
  console.log("Applying nomad destination schema...");
  
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

  console.log("Seeding authentic nomad-friendly countries & 3+ cities each...");

  const hubs = [
    // 1. Thailand
    {
      country: "Thailand",
      city: "Chiang Mai",
      area: "Nimman & Santitham",
      wifi_speed: "650 Mbps",
      monthly_cost: "$850/mo",
      tagline: "The global epicenter of digital nomad culture, artisan cafes, and mountain escapes.",
      description: "Unrivaled concentration of remote software engineers and creators. Ridiculously fast optical fiber, high-ergonomic cafes every 50 meters, and vibrant co-living compounds."
    },
    {
      country: "Thailand",
      city: "Bangkok",
      area: "Thong Lo & Ekkamai",
      wifi_speed: "800 Mbps",
      monthly_cost: "$1,450/mo",
      tagline: "Skyscraper coworking lounges, 24/7 transit, and boundless street gastronomy.",
      description: "For nomads who thrive in electric metropolitan energy. Towering coworking high-rises, world-class street food, and seamless Skytrain connectivity."
    },
    {
      country: "Thailand",
      city: "Koh Phangan",
      area: "Sri Thanu & Hin Kong",
      wifi_speed: "300 Mbps",
      monthly_cost: "$1,150/mo",
      tagline: "Beachside wooden work shacks, wellness culture, and crypto/tech mastermind retreats.",
      description: "The island outpost where tech meets tranquility. Work on product architecture while looking at the turquoise Gulf of Thailand, followed by sunset swims."
    },

    // 2. Indonesia
    {
      country: "Indonesia",
      city: "Bali (Canggu)",
      area: "Batu Bolong & Pererenan",
      wifi_speed: "250 Mbps",
      monthly_cost: "$1,350/mo",
      tagline: "Open-air bamboo coworking compounds, surf breaks, and high-protein fuel bowls.",
      description: "The surf and code capital of Southeast Asia. World-renowned nomad spaces like Dojo and Zin, vibrant networking meetups, and lush tropical villa living."
    },
    {
      country: "Indonesia",
      city: "Bali (Ubud)",
      area: "Penestanan & Campuhan",
      wifi_speed: "200 Mbps",
      monthly_cost: "$1,100/mo",
      tagline: "Jungle river valleys, quiet deep-work sanctuaries, and creative stillness.",
      description: "For long-form writing, deep code sprints, and zero city noise. Work surrounded by palm canopies, organic coffee plantations, and meditation gardens."
    },
    {
      country: "Indonesia",
      city: "Lombok",
      area: "Kuta Lombok",
      wifi_speed: "180 Mbps",
      monthly_cost: "$950/mo",
      tagline: "Uncrowded reef bays, pristine nature, and an emerging frontier nomad community.",
      description: "What Bali was 15 years ago. Peaceful, uncrowded roads, emerging high-speed fiber cafes, and breathtaking dramatic headlands."
    },

    // 3. Japan
    {
      country: "Japan",
      city: "Tokyo",
      area: "Shibuya & Daikanyama",
      wifi_speed: "920 Mbps",
      monthly_cost: "$2,200/mo",
      tagline: "Hyper-efficient infrastructure, pristine safety, and 24/7 silent acoustic focus pods.",
      description: "The peak of urban focus culture. Blazing optical fiber, whisper-quiet cafes where everyone is locked in, and 3 AM safety with zero street friction."
    },
    {
      country: "Japan",
      city: "Kyoto",
      area: "Gion & Kamogawa",
      wifi_speed: "500 Mbps",
      monthly_cost: "$1,650/mo",
      tagline: "Historic machiya workhouses, zen temple gardens, and contemplative deep-work.",
      description: "Work in renovated 100-year-old timber machiya teahouses overlooking weeping willows and the Kamogawa river, wired with gigabit internet."
    },
    {
      country: "Japan",
      city: "Fukuoka",
      area: "Tenjin & Daimyo",
      wifi_speed: "750 Mbps",
      monthly_cost: "$1,400/mo",
      tagline: "Japan's designated national startup hub, compact ocean living, and world-class ramen.",
      description: "More affordable and relaxed than Tokyo with dedicated nomad startup visas, ocean breeze, and a thriving developer community in Tenjin."
    },

    // 4. Spain
    {
      country: "Spain",
      city: "Barcelona",
      area: "El Poblenou & Gràcia",
      wifi_speed: "600 Mbps",
      monthly_cost: "$1,850/mo",
      tagline: "300 days of Mediterranean sunlight, beachside cycling, and a massive 22@ tech cluster.",
      description: "Europe's primary nomad powerhouse. Converted industrial lofts with fiber, 10-minute walk to the sea, and Thursday nomad meetups with 200+ attendees."
    },
    {
      country: "Spain",
      city: "Valencia",
      area: "Ruzafa & El Carmen",
      wifi_speed: "500 Mbps",
      monthly_cost: "$1,350/mo",
      tagline: "Lush Turia park corridors, historic plazas, sunny terraces, and lower cost of living.",
      description: "A calmer, more affordable sister to Barcelona. Incredible bike infrastructure, sprawling sunlit public parks, and a fast-growing international tech scene."
    },
    {
      country: "Spain",
      city: "Madrid",
      area: "Malasaña & La Latina",
      wifi_speed: "550 Mbps",
      monthly_cost: "$1,650/mo",
      tagline: "Majestic historic work libraries, endless tapas plazas, and vibrant cultural pulse.",
      description: "Immersive Spanish urban life. Work from grand architectural libraries and specialty cafes in Malasaña, then join lively evening terrace discussions."
    },

    // 5. India
    {
      country: "India",
      city: "Goa",
      area: "Arambol & Anjuna",
      wifi_speed: "250 Mbps",
      monthly_cost: "$850/mo",
      tagline: "Coastal sunsets, seaside work shacks, and a high-energy nomadic builder ecosystem.",
      description: "India's nomad paradise. Work with ocean breezes during the day, attend hacker houses and AI salons in the evening, and live steps from the Arabian Sea."
    },
    {
      country: "India",
      city: "Dharamsala",
      area: "Dharamkot & McLeod Ganj",
      wifi_speed: "220 Mbps",
      monthly_cost: "$650/mo",
      tagline: "Crisp Himalayan pine forests, Tibetan monasteries, and tranquil mountain work decks.",
      description: "Perched at the foot of the snowcapped Dhauladhar range. Pristine mountain air, serene rooftop cafes, and dirt-cheap living costs for deep focus."
    },
    {
      country: "India",
      city: "Bangalore",
      area: "Indiranagar & Koramangala",
      wifi_speed: "500 Mbps",
      monthly_cost: "$950/mo",
      tagline: "India's Silicon Valley, 24/7 third-wave coffee shops, and unmatched founder density.",
      description: "Every table is building a startup. Incredible specialty coffee culture, vibrant tech hackathons every weekend, and intense builder energy."
    }
  ];

  const cityMap = [];
  for (const hub of hubs) {
    const [inserted] = await sql`
      INSERT INTO cities (country, city, area, wifi_speed, monthly_cost, tagline, description)
      VALUES (${hub.country}, ${hub.city}, ${hub.area}, ${hub.wifi_speed}, ${hub.monthly_cost}, ${hub.tagline}, ${hub.description})
      RETURNING id;
    `;
    cityMap.push({ id: inserted.id, city: hub.city, country: hub.country });
  }

  console.log("Seeding verified nomad field reviews...");

  // Chiang Mai reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[0].id}, 'Scout_Alex', 5, 'Nimman is the promised land for remote work. 900 Mbps fiber at Yellow Coworking, $2 iced cold brew, and friendly nomads everywhere.', NOW() - INTERVAL '12 days'),
      (${cityMap[0].id}, 'Dev_Elena', 5, 'Lived in Santitham for 6 months. Monthly costs under $800 including gym and private condo. Zero friction for building software.', NOW() - INTERVAL '5 days');
  `;

  // Bangkok reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[1].id}, 'MetroNomad', 4, 'The modern towers in Thong Lo have unmatched 24hr coworking spaces. Great coffee, fast internet, just brace for city traffic.', NOW() - INTERVAL '7 days');
  `;

  // Koh Phangan reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[2].id}, 'IslandHacker', 5, 'Working right on Hin Kong beach with Starlink backup. Best lifestyle balance on earth.', NOW() - INTERVAL '4 days');
  `;

  // Bali (Canggu) reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[3].id}, 'SurfAndCode', 5, 'Zin Cowork in Canggu is world class. Bamboo architecture, quiet air-conditioned focus booths, and 200 Mbps fiber.', NOW() - INTERVAL '9 days'),
      (${cityMap[3].id}, 'Nomad_Tara', 4, 'Unreal community and food. Rent a scooter to easily get through shortcut traffic.', NOW() - INTERVAL '3 days');
  `;

  // Bali (Ubud) reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[4].id}, 'ZenBuilder', 5, 'Outpost Ubud in the jungle valley cleared my brain fog completely. Wrote an entire compiler backend in 3 weeks.', NOW() - INTERVAL '8 days');
  `;

  // Tokyo reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[6].id}, 'Scout_Kaito', 5, 'Shibuya fiber speeds clocked 920 Mbps on speedtest. Incredible focus culture in cafes; nobody talks loudly, perfect for marathon coding sessions.', NOW() - INTERVAL '10 days'),
      (${cityMap[6].id}, 'Dev_Nomad', 5, 'The coffee roasteries in Daikanyama are unmatched. Reliable sockets everywhere and 7-Eleven runs for midnight brain fuel.', NOW() - INTERVAL '2 days');
  `;

  // Fukuoka reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[8].id}, 'HakataDev', 5, 'Tenjin has the best startup ecosystem in Japan outside Tokyo, and rent is 40% cheaper. Incredible tonkotsu ramen everywhere.', NOW() - INTERVAL '6 days');
  `;

  // Barcelona reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[9].id}, 'Mateo_UX', 5, 'Poblenou is the gold standard of nomad neighborhoods. 5 minutes from the beach, converted industrial warehouses with fiber, and endless sunny days.', NOW() - INTERVAL '6 days'),
      (${cityMap[9].id}, 'Sophie_Remote', 5, 'High quality of life. The nomad meetups every Thursday bring together 100+ international remote workers.', NOW() - INTERVAL '2 days');
  `;

  // Valencia reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[10].id}, 'CoastBuilder', 5, 'Valencia is half the price of Barcelona with equally good weather, fantastic Turia park bike rides, and high-speed internet.', NOW() - INTERVAL '5 days');
  `;

  // Goa reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[12].id}, 'GoaHacker', 5, 'Work all morning with ocean views in Arambol, swim at sunset, and attend crypto/AI meetups at night. Optical fiber made Goa a real nomad paradise.', NOW() - INTERVAL '7 days'),
      (${cityMap[12].id}, 'Nomad_Priya', 5, 'Unmatched community spirit. You make friends for life within 48 hours of arriving.', NOW() - INTERVAL '1 day');
  `;

  // Dharamsala reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[13].id}, 'HimalayaScout', 5, 'Crisp mountain air, quiet rooftop balconies overlooking pine forests, and $15/night private rooms. The ultimate deep work reset.', NOW() - INTERVAL '6 days');
  `;

  // Bangalore reviews
  await sql`
    INSERT INTO reviews (city_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${cityMap[14].id}, 'Founder_Arjun', 5, 'Indiranagar is the tech heart of India. Third Wave Coffee and Blue Tokai are packed with founders writing code until midnight.', NOW() - INTERVAL '4 days');
  `;

  console.log("Database reset complete! Seeded 15 authentic nomad destinations across Thailand, Indonesia, Japan, Spain, and India.");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
