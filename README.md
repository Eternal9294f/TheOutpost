# THE OUTPOST
### *Decentralized Field Intelligence & Travel Review Platform for Digital Nomads*

[![Live Deployment](https://img.shields.io/badge/Live_Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://the-outpost-blush.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-App_Router-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Neon Postgres](https://img.shields.io/badge/Neon-Serverless_PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Warm_Editorial-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

> **Live Production URL:** [https://the-outpost-blush.vercel.app](https://the-outpost-blush.vercel.app)  
> **Author:** Made by AN  
> **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Neon Serverless PostgreSQL (`@neondatabase/serverless`), Raw SQL, Vercel  

---

## 🧭 What is The Outpost?

**The Outpost** is a distraction-free, telemetry-driven travel review network engineered specifically for wandering software developers, founders, and digital nomads.

Unlike generic travel blogs or cluttered tourism apps, The Outpost treats global destinations as field stations. It provides high-signal intelligence on actual remote working conditions:
* **Verified Connectivity:** Real speed test metrics (e.g., 650 Mbps optical fiber in Chiang Mai vs. 920 Mbps fiber in Tokyo).
* **Cost of Existence:** Realistic monthly burn rates for remote builders ($650/mo to $2,200/mo).
* **Field Dispatches:** Unfiltered reviews from fellow nomads evaluating noise floors, focus cafes, community density, and safety.
* **Dynamic Intelligence:** Station ratings and metrics computed dynamically on the fly using raw SQL queries directly against our PostgreSQL database.

---

## 🎯 For Whom and Why I Made It?

### Who It's For:
* **Remote Software Engineers & Tech Founders:** Nomads who need reliable gigabit wifi, acoustic quiet for marathon focus sessions, and dependable sockets.
* **Global Nomads & Creators:** Builders moving between global nomad hubs across Southeast Asia, East Asia, and Southern Europe.
* **Aesthetic Minimalists:** Travelers who appreciate calm, low-strain, warm editorial design with zero visual noise.

### Why I Made It? (The Buildhour Origin & Personalization):
This project originated from a hands-on software architecture challenge in the **Buildhour** cohort. The original exercise was centered around building a small consumer food prototype called **"Zomato Lite"** (a two-screen app with a restaurant menu and a star review form) designed to teach how software fits together across 5 architectural layers.

While the original exercise was educational, building another generic restaurant clone with food menus did not resonate with my real-world passions or career goals. As a digital nomad inspired by exploration, focus culture, and the gritty scout ethos, I decided to completely personalize and elevate the project:

1. **From Burritos to Global Nomad Hubs:** Transformed food items into global cities and tech stations across Thailand (Chiang Mai, Bangkok, Koh Phangan), Indonesia (Bali Canggu, Ubud, Lombok), Japan (Tokyo, Kyoto, Fukuoka), Spain (Barcelona, Valencia, Madrid), and India (Goa, Dharamsala, Bangalore).
2. **From Generic Red App to Soothing Warm Editorial Design:** Discarded cheap red gradients and harsh dark modes in favor of an eye-pleasing, low-strain linen/cream aesthetic (`#F6F5F0`) paired with deep obsidian charcoal typography (`#0F1012`) and subtle warm borders (`#DDD9CE`).
3. **From a Prototype to a Portfolio System:** Retained 100% of the foundational full-stack software principles taught in the buildathon, but packaged it into an authentic, production-grade product that stands out in any engineering portfolio.

---

## 🏛️ The Three Architectural Tenets

Under the hood, **The Outpost** strictly enforces three foundational engineering rules:

### 1. Store Facts, Compute Answers
* In the database, there is **zero `average_rating` column** and **zero `latest_review` column**.
* Ratings and timestamps are historical facts. An average is merely an answer computed at the moment someone requests it.
* Averages are calculated dynamically in raw SQL:
  ```sql
  SELECT 
    AVG(rating)::numeric AS avg_rating,
    COUNT(*)::int AS total_reviews
  FROM reviews
  WHERE city_id = 1;
  ```
  If 100 reviews are submitted simultaneously, the average updates immediately without risking stale or out-of-sync database columns.

### 2. The Kitchen Cooks, the Dining Room Serves
* **The Backend is the Kitchen:** All aggregation, sorting, rounding, and validation happens on the server in raw SQL.
* **The Frontend is the Dining Room:** The React components perform **zero math**. The frontend receives `4.7` from the API and prints `4.7`. No summing, no array reduction, and no client-side sorting.

### 3. Frontend Validation is Kindness; Backend Validation is Security
* **Frontend:** The 1-to-5 star selector and comment field prevent honest users from making honest mistakes (the submit button stays disabled until both inputs are valid).
* **Backend:** If a malicious actor sends a raw HTTP payload via `curl` with `{"rating": 500, "comment": ""}`, the serverless API immediately validates the boundaries and rejects the request with HTTP 400 Bad Request:
  ```json
  { "error": "Rating must be an integer between 1 and 5." }
  ```

---

## 🗺️ Territory & Station Network (15 Hubs)

The Outpost currently tracks verified field telemetry across 5 global territories with at least 3 nomad-friendly hubs each:

| Region | Station Hub | Nomad District | Verified Wifi | Living Est. | Key Specialty |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🇹🇭 **Thailand** | **Chiang Mai** | Nimman & Santitham | 650 Mbps | $850/mo | Global nomad epicenter, artisan cafes, mountain air |
| 🇹🇭 **Thailand** | **Bangkok** | Thong Lo & Ekkamai | 800 Mbps | $1,450/mo | Skyscraper coworking lounges, 24/7 transit |
| 🇹🇭 **Thailand** | **Koh Phangan** | Sri Thanu & Hin Kong | 300 Mbps | $1,150/mo | Beachside wooden shacks, wellness, crypto retreats |
| 🇮🇩 **Indonesia** | **Bali (Canggu)** | Batu Bolong & Pererenan | 250 Mbps | $1,350/mo | Bamboo coworking campuses, surf breaks, nomad meetups |
| 🇮🇩 **Indonesia** | **Bali (Ubud)** | Penestanan & Campuhan | 200 Mbps | $1,100/mo | Jungle river valleys, quiet deep-work sanctuaries |
| 🇮🇩 **Indonesia** | **Lombok** | Kuta Lombok | 180 Mbps | $950/mo | Uncrowded reef bays, pristine nature, frontier builders |
| 🇯🇵 **Japan** | **Tokyo** | Shibuya & Daikanyama | 920 Mbps | $2,200/mo | Gigabit fiber, acoustic focus pods, pristine safety |
| 🇯🇵 **Japan** | **Kyoto** | Gion & Kamogawa | 500 Mbps | $1,650/mo | Historic machiya workhouses, zen temple gardens |
| 🇯🇵 **Japan** | **Fukuoka** | Tenjin & Daimyo | 750 Mbps | $1,400/mo | National startup visa hub, compact ocean living |
| 🇪🇸 **Spain** | **Barcelona** | El Poblenou & Gràcia | 600 Mbps | $1,850/mo | 300 days of sun, 22@ innovation district, beach cycling |
| 🇪🇸 **Spain** | **Valencia** | Ruzafa & El Carmen | 500 Mbps | $1,350/mo | Turia green corridor, sunny plazas, low burn rate |
| 🇪🇸 **Spain** | **Madrid** | Malasaña & La Latina | 550 Mbps | $1,650/mo | Historic libraries, endless tapas plazas, cultural pulse |
| 🇮🇳 **India** | **Goa** | Arambol & Anjuna | 250 Mbps | $850/mo | Coastal sunsets, beach co-working, vibrant builder mesh |
| 🇮🇳 **India** | **Dharamsala** | Dharamkot & McLeod Ganj | 220 Mbps | $650/mo | Himalayan pine air, monastery bells, mountain work decks |
| 🇮🇳 **India** | **Bangalore** | Indiranagar & Koramangala | 500 Mbps | $950/mo | India's Silicon Valley, 24/7 coffee shops, founder density |

---

## 🗄️ Database Architecture

The application runs on Neon Serverless PostgreSQL with normalized tables:

```sql
-- Global Nomad Stations
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  wifi_speed TEXT NOT NULL,
  monthly_cost TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Field Dispatches & Intel
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  nomad_callsign TEXT NOT NULL DEFAULT 'Anonymous Nomad',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🎨 Visual Design Philosophy

* **Warm Editorial Canvas (`#F6F5F0`):** Soft linen tone designed to reduce retinal strain during extended screen sessions.
* **Zero Pitch Black / Zero Harsh Dark Mode:** Replaced aggressive `#000000` with deep obsidian charcoal (`#0F1012`) and slate gray accents (`#454950`).
* **Subtle Sand Borders (`#DDD9CE`):** Soft, understated framing with gentle paper shadows.
* **Warm Amber Stars (`#B46200`):** Warm honey gold ratings for field dispatches.
* **Typography:** Clean, technical monospaced styling (`font-mono`) evoking field radios, radar equipment, and tactical dispatches.

---

## 🚀 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/Eternal9294f/TheOutpost.git
cd TheOutpost
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
DATABASE_URL="postgresql://user:password@ep-host.region.aws.neon.tech/neondb?sslmode=require"
```

### 3. Initialize & Seed Database
```bash
npm run db:setup
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

* `GET /api/cities` — Returns all destinations with dynamic raw SQL `AVG(rating)` and `COUNT(*)`.
* `GET /api/cities/:id` — Returns station telemetry, latest dispatch, and complete dispatch history.
* `POST /api/reviews` — Validates rating (1–5) and comment, inserts review row into Neon Postgres.
* `GET /api/restaurants/:id` — Compatibility endpoint aliased to destination data.

---

## 📜 License & Credits

Built with pride by **AN** for digital nomads and wanderers worldwide.  
Inspired by the **Buildhour** software architecture challenge.
