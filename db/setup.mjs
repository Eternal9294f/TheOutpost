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
  
  await sql.transaction([
    sql`DROP TABLE IF EXISTS reviews CASCADE`,
    sql`DROP TABLE IF EXISTS menu_items CASCADE`,
    sql`DROP TABLE IF EXISTS restaurants CASCADE`,
    sql`CREATE TABLE restaurants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      area TEXT NOT NULL,
      region TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL
    )`,
    sql`CREATE TABLE menu_items (
      id SERIAL PRIMARY KEY,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      is_signature BOOLEAN DEFAULT false
    )`,
    sql`CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
      nomad_callsign TEXT NOT NULL DEFAULT 'Anonymous Wanderer',
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  ]);

  console.log("Seeding global outposts...");

  // 1. Tokyo
  const [tokyo] = await sql`
    INSERT INTO restaurants (name, cuisine, area, region, tagline, description)
    VALUES (
      'The Falcon''s Rest',
      'Hearth & Nomad Roasts',
      'Shibuya · District 4',
      'East Asia',
      'High-focus acoustic pods, charcoal hearth roasts, and 1Gbps mesh wifi.',
      'A covert sanctuary for remote engineers and scouts. Quiet tatami working desks by day, roaring hearth by night.'
    ) RETURNING id;
  `;

  // 2. Bali
  const [bali] = await sql`
    INSERT INTO restaurants (name, cuisine, area, region, tagline, description)
    VALUES (
      'The Wall Oasis',
      'Tropical Fuel & Brews',
      'Echo Beach · Canggu',
      'Southeast Asia',
      'Open-air bamboo cowork haven, cold water plunge, and high-protein fuel bowls.',
      'Designed for digital nomads who balance sunrise surf sessions with intense deep-work sprints.'
    ) RETURNING id;
  `;

  // 3. Lisbon
  const [lisbon] = await sql`
    INSERT INTO restaurants (name, cuisine, area, region, tagline, description)
    VALUES (
      'Midland Hearth',
      'Stone Oven & Micro-Roastery',
      'Alfama · Old Quarter',
      'Southern Europe',
      'Sunlit stone vaults, specialty espresso lab, and Atlantic sea breeze.',
      'A medieval stone tavern repurposed into a collaborative fortress for founders, designers, and wandering mercenaries.'
    ) RETURNING id;
  `;

  // 4. Medellín
  const [medellin] = await sql`
    INSERT INTO restaurants (name, cuisine, area, region, tagline, description)
    VALUES (
      'The Roaming Falcon',
      'Andean Roast & Craft Bar',
      'El Poblado · Sector 10',
      'Latin America',
      'Lush canopy terraces, single-origin geisha coffee, and ergonomic standing stations.',
      'Perched amidst the mountain jungle of Medellín, providing unmatched mountain views and hyper-reliable gigabit connections.'
    ) RETURNING id;
  `;

  // 5. Goa
  const [goa] = await sql`
    INSERT INTO restaurants (name, cuisine, area, region, tagline, description)
    VALUES (
      'Arambol Commons',
      'Coastal Fire & Catch',
      'Cliffside · North Goa',
      'South Asia',
      'Cliffside sunset work decks, woodfire seafood grills, and nomadic hackathons.',
      'A bohemian coastal work sanctuary where wanderers, remote builders, and free thinkers gather around open flames.'
    ) RETURNING id;
  `;

  console.log("Seeding provisions (menu items)...");

  // Provisions for Tokyo
  const tokyoItems = await sql`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_signature)
    VALUES 
      (${tokyo.id}, 'Smoked Boar Roast', 'Slow-cooked woodfire boar with sticky highland rice, pickled daikon, and charred scallion oil.', 16, 'Bowls & Roasts', true),
      (${tokyo.id}, 'Cold Drip Nitro Extraction', 'Single-origin Ethiopian bean steeped for 18 hours, served over carved clear ice.', 6, 'Craft Brews', false),
      (${tokyo.id}, 'Survey Corps Protein Bento', 'Charred wagyu strips, soft-boiled tamago, edamame, and black sesame rice.', 18, 'Bowls & Roasts', false),
      (${tokyo.id}, 'Smoked Salt Matcha Tonic', 'Ceremonial Uji matcha whisked over chilled sparkling tonic and yuzu zest.', 7, 'Craft Brews', false),
      (${tokyo.id}, 'Iron Rations Energy Flapjacks', 'Dense oats, crushed pecans, black honey, and whey protein.', 8, 'Field Rations', false)
    RETURNING id, name;
  `;

  // Provisions for Bali
  const baliItems = await sql`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_signature)
    VALUES 
      (${bali.id}, 'Dragonfruit Acai Fuel Bowl', 'Organic acai blended with banana, topped with raw cacao nibs, chia seeds, and local mango.', 11, 'Bowls & Roasts', true),
      (${bali.id}, 'Coconut Cold Brew Elixir', 'Fresh crushed coconut water infused with slow-dripped Kintamani dark roast.', 5, 'Craft Brews', false),
      (${bali.id}, 'Balinese Spiced Pork Ribs', 'Glazed in ginger kecap manis, lemongrass, and served with coconut lime rice.', 15, 'Bowls & Roasts', false),
      (${bali.id}, 'Sea Salt Plantain Crisps', 'Crispy plantains seasoned with sea salt and served with crushed chili sambal.', 6, 'Field Rations', false)
    RETURNING id, name;
  `;

  // Provisions for Lisbon
  const lisbonItems = await sql`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_signature)
    VALUES 
      (${lisbon.id}, 'Slow-Roasted Iberian Pork', 'Wood-fired tender pork loin with roasted baby potatoes and garlic chimichurri.', 17, 'Bowls & Roasts', true),
      (${lisbon.id}, 'Guts'' Dark Tavern Ale', 'Bold, malty artisan dark ale brewed in small batches in Sintra.', 6, 'Craft Brews', false),
      (${lisbon.id}, 'Crispy Bifana Sourdough', 'Thinly sliced marinated pork cutlet inside stone-baked crusty sourdough with spicy mustard.', 9, 'Field Rations', false),
      (${lisbon.id}, 'Cinnamon Pastel & Double Shot', 'Fresh warm pastel de nata paired with an intense Portuguese bica espresso.', 5, 'Craft Brews', false)
    RETURNING id, name;
  `;

  // Provisions for Medellín
  const medellinItems = await sql`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_signature)
    VALUES 
      (${medellin.id}, 'Paisa Nomad Protein Skillet', 'Carne en polvo, red beans, sweet plantains, avocado, and fried organic egg.', 14, 'Bowls & Roasts', true),
      (${medellin.id}, 'Geisha Micro-Lot Pour Over', 'Floral notes of bergamot and jasmine from the high peaks of Antioquia.', 6, 'Craft Brews', false),
      (${medellin.id}, 'Choclo Arepa & Braised Beef', 'Sweet sweetcorn cake grilled with melted campesino cheese and shredded brisket.', 8, 'Field Rations', false)
    RETURNING id, name;
  `;

  // Provisions for Goa
  const goaItems = await sql`
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_signature)
    VALUES 
      (${goa.id}, 'Tandoori Spiced Kingfish Bowl', 'Fresh catch from Morjim grilled over charcoal with red rice and coconut kokum curry.', 13, 'Bowls & Roasts', true),
      (${goa.id}, 'Cardamom Masala Cold Brew', 'Arabica cold brew spiced with crushed green cardamom and cinnamon quill.', 4, 'Craft Brews', false),
      (${goa.id}, 'Goan Chorizo Sourdough Roll', 'Spicy Goan pork sausage tossed with caramelized onions inside toasted poi bread.', 8, 'Field Rations', false)
    RETURNING id, name;
  `;

  console.log("Seeding field reports...");

  // Seed reviews for Tokyo
  await sql`
    INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${tokyo.id}, ${tokyoItems[0].id}, 'Scout_Levi', 5, 'The Smoked Boar Roast is elite fuel. Sprinted through 6 hours of Rust architecture without hitting a slump.', NOW() - INTERVAL '8 days'),
      (${tokyo.id}, ${tokyoItems[1].id}, 'Falcon_Guts', 4, 'Cold Drip is jet fuel. Only complaint was the standing desks were packed by 2 PM.', NOW() - INTERVAL '6 days'),
      (${tokyo.id}, ${tokyoItems[2].id}, 'Nomad_Kaelen', 5, 'Best workstation in Tokyo. 800Mbps symmetrical fiber, noise-floor is dead quiet.', NOW() - INTERVAL '3 days'),
      (${tokyo.id}, ${tokyoItems[0].id}, 'Wanderer_Shin', 4, 'Solid table, great hearth heat. Reliable spot to hunker down.', NOW() - INTERVAL '1 day');
  `;

  // Seed reviews for Bali
  await sql`
    INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${bali.id}, ${baliItems[0].id}, 'BeachNomad', 5, 'The dragonfruit fuel bowl is unbelievable. Best morning pre-work ritual in Canggu.', NOW() - INTERVAL '5 days'),
      (${bali.id}, ${baliItems[1].id}, 'DevSurfer', 4, 'Solid coconut brew. Wifi was rock solid during monsoon rain.', NOW() - INTERVAL '2 days');
  `;

  // Seed reviews for Lisbon
  await sql`
    INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${lisbon.id}, ${lisbonItems[0].id}, 'Vanguard_Elena', 5, 'Iberian pork melts in your mouth. Stone vaults keep it cool in summer.', NOW() - INTERVAL '7 days'),
      (${lisbon.id}, ${lisbonItems[2].id}, 'CodeRanger', 5, 'Crispy bifana sandwich is the best quick desk lunch in Alfama.', NOW() - INTERVAL '4 days');
  `;

  // Seed reviews for Medellín
  await sql`
    INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${medellin.id}, ${medellinItems[0].id}, 'AndeanNomad', 5, 'The skillet has enough protein to fuel two gym sessions. Incredible view.', NOW() - INTERVAL '6 days');
  `;

  // Seed reviews for Goa
  await sql`
    INSERT INTO reviews (restaurant_id, menu_item_id, nomad_callsign, rating, comment, created_at)
    VALUES 
      (${goa.id}, ${goaItems[0].id}, 'GoaScout', 5, 'Catch of the day grilled right in front of you. Working by the sea is unmatched.', NOW() - INTERVAL '4 days');
  `;

  console.log("Database upgrade complete! Seeded 5 outposts with full provisions and field dispatches.");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
