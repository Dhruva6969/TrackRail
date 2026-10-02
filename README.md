# 🚄 TrackRail — Next-Gen Railway Intelligence

> **Real-time Indian railway journey tracking & travel intelligence platform.**  
> Built with React 19, TypeScript, MapLibre GL, Tailwind CSS, Express, and high-precision railway telemetry.

---

## ✨ Features

- **Live Train Positioning & Telemetry:** Real-time GPS train location, speed (`km/h`), live distance covered, and bearing powered by RailRadar API.
- **Interactive High-Density Vector Map:** Dynamic vector basemap using MapTiler & MapLibre GL with complete track geometry, active train markers, station halts, and follow-camera controls.
- **Full Station Route Timeline:** Complete station route (including intermediate operational halts) with scheduled vs. actual arrival/departure times, platform numbers, and sequence-based journey progress.
- **Smart Delay & ETA Analytics:** Accurate live delay calculations with historical station-by-station delay propagation trends.
- **Terrain Elevation Profiling:** Route topography and elevation profiles along the rail corridor powered by SRTM elevation data.
- **Live Corridor Weather:** Weather intelligence (temperature, condition, humidity, wind) for the current station, upcoming station, and final destination via OpenWeather API.
- **Geographic Landmarks & POIs:** Historical monuments, rivers, bridges, and natural landmarks along the train route via OpenStreetMap (Overpass API).
- **Journey Sharing & Persistence:** One-click shareable journey links and locally persisted recent / favourite train searches.

---

## 🛠️ Architecture & Tech Stack

```
TrackRail/
├── backend/            # Express TypeScript API Gateway & Telemetry Service
│   ├── src/
│   │   ├── providers/  # RailRadar, Weather, Elevation, Places & Share providers
│   │   ├── types/      # Domain models & TypeScript interfaces
│   │   └── index.ts    # REST endpoints & caching layer
├── frontend/           # React 19 + Vite + Tailwind CSS Single-Page Application
│   ├── src/
│   │   ├── components/ # Map, Timeline, Summary cards, Weather, Elevation
│   │   ├── hooks/      # React Query telemetry & search hooks
│   │   ├── pages/      # Home, Journey, and Shared Journey views
│   │   └── services/   # Frontend API client
└── package.json        # Unified monorepo scripts
```

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, MapLibre GL, TanStack React Query, Zustand, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, In-memory TTL caching with stale-while-revalidate protection.
- **External Data Providers:**
  - [RailRadar API](https://railradar.in) (Train schedule, route geometry, live telemetry)
  - [MapTiler](https://www.maptiler.com) (Vector map styles and tiles)
  - [OpenWeather API](https://openweathermap.org) (Station weather intelligence)
  - [OpenTopoData / OpenTopography](https://www.opentopodata.org) (SRTM elevation profiles)
  - [OpenStreetMap / Overpass API](https://overpass-api.de) (Nearby POIs & landmarks)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- API Keys for RailRadar, MapTiler, and OpenWeather

### 1. Clone Repository

```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
cd TrackRail
```

### 2. Configure Environment Variables

Create `.env` in `backend/` and `frontend/` using the provided `.env.example` templates:

**Backend (`backend/.env`):**
```env
PORT=3001
RAILRADAR_API_KEY=your_railradar_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
OPENTOPOGRAPHY_API_KEY=your_opentopography_api_key
MAPTILER_API_KEY=your_maptiler_api_key
```

**Frontend (`frontend/.env`):**
```env
VITE_MAPTILER_API_KEY=your_maptiler_api_key
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
npm install --prefix backend

# Frontend dependencies
npm install --prefix frontend
```

### 4. Run Development Servers

Run both backend (`http://localhost:3001`) and frontend (`http://localhost:5173`) concurrently:

```bash
npm run dev
```

Alternatively, run them separately:
```bash
npm run dev:backend   # Start Express API Gateway
npm run dev:frontend  # Start Vite React App
```

### 5. Build for Production

```bash
npm run build
```

---

## 🔒 Security & Privacy

- All private API keys and sensitive tokens are strictly managed via environment variables (`.env`) and excluded from source control through `.gitignore`.
- `.env.example` files are provided for configuration guidance.

---

## 📄 License

This project is licensed under the MIT License.
