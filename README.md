# NexTrack - VIT Shuttle Live Map

NexTrack is a real-time shuttle tracking web app for VIT Vellore. It provides a student-facing live map and an admin-facing fleet dashboard with online/offline status, ETA insights, and occupancy indicators.

## What It Does

- Shows live shuttle positions on a campus map.
- Hides offline buses from the map entirely (no last known location shown).
- Displays bus connection state (online or offline) in student and admin views.
- Enriches ETA using a prediction API when buses are online.
- Uses a fast-first loading strategy: renders GPS data first, then fills ETA in the background.
- Includes lightweight skeleton loaders while initial data is fetched.

## Dashboards

### Student Dashboard

- Route: `/`
- Live bus map (React Leaflet)
- Bus info panel (ETA, driver, speed, occupancy)
- Time-to-nearest-stop estimate using browser geolocation

### Admin Dashboard

- Login route: `/admin-login`
- Dashboard route: `/admin`
- Fleet table with filters: all, online, offline
- Quick stats: total, online, offline, average occupancy

## Demo Admin Credentials

Current credentials are hardcoded for local/demo use:

- Email: `admin@nextrack.com`
- Password: `admin123`

Do not use this approach in production.

## Live Data Sources

The frontend currently consumes live APIs directly:

- GPS feed: `https://embedded-vit-gps-tracking.onrender.com/buses`
- ETA prediction: `https://13.206.65.251.nip.io/predict`

Expected GPS shape:

```json
{
	"buses": [
		{
			"bus_id": "BUS_01",
			"lat": 12.97,
			"lon": 79.16,
			"speed": 14,
			"status": "online"
		}
	]
}
```

Expected ETA shape:

```json
{
	"eta_minutes": 5,
	"next_stop": "SJT",
	"current_stop": "PRP",
	"is_peak_hour": false
}
```

## Status Behavior

- `status` is normalized to `online` or `offline`.
- `offline`, `no_data`, and `no data` are treated as offline.
- Offline buses:
	- Are not shown on the map.
	- Show offline badges in list/panels/tables.
	- Use speed `0` and ETA `0` in UI.

## Performance and Loading

NexTrack reduces perceived latency by:

- Applying request timeouts for bus and ETA API calls.
- Rendering bus cards and map quickly from GPS data first.
- Enriching ETA asynchronously in a second pass.
- Showing minimal skeleton placeholders during initial load.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui components
- React Router
- React Leaflet + Leaflet
- Vitest + Testing Library
- Playwright (configured)
- Optional Express backend scaffold in `backend/`

## Project Structure

```text
.
|- src/
|  |- pages/
|  |  |- Index.tsx            # student dashboard
|  |  |- AdminLogin.tsx
|  |  |- AdminDashboard.tsx
|  |- hooks/
|  |  |- use-live-buses.ts    # polling + status normalization + ETA enrichment
|  |- components/
|  |  |- ShuttleMap.tsx
|  |  |- BusInfoPanel.tsx
|  |  |- ActiveBusList.tsx
|  |  |- DashboardHeader.tsx
|- backend/
|  |- src/server.js           # optional express service scaffold
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

### 1) Install Frontend Dependencies

```bash
npm install
```

### 2) Start Frontend (Vite)

```bash
npm run dev
```

Open the app at the URL printed by Vite (usually `http://localhost:5173`).

### 3) Optional: Run Backend Scaffold

This backend is currently a basic health/api scaffold and is not required for live GPS map usage.

```bash
cd backend
npm install
npm run dev
```

Backend default URL: `http://localhost:5000`

## Available Scripts (Frontend)

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run build:dev` - development-mode build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode

## Backend Scripts

Inside `backend/`:

- `npm run dev` - start backend with file watch
- `npm run start` - start backend once

## Notes and Limitations

- Laptop geolocation can be inaccurate indoors; mobile GPS is generally better.
- Admin auth is localStorage + hardcoded credentials (demo only).
- API endpoints are hardcoded in `src/hooks/use-live-buses.ts`.

## Suggested Next Improvements

- Move API URLs and admin credentials to environment variables.
- Replace demo auth with secure server-side auth.
- Cache last-known bus snapshot for near-instant reload experience.
- Add integration tests for offline-to-online transitions.

## License

No license file is currently provided in this repository.
