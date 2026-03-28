

## Plan: Admin View, Login Page, and UI Tweaks

### Overview
Create an admin dashboard page (matching the uploaded reference), a simple admin login page, and apply several UI modifications. Students access the current student view without login; admins log in to see a fleet management view with stats cards and a bus table.

### Changes

#### 1. New file: `src/pages/AdminLogin.tsx`
- Simple login form (email + password) with hardcoded admin check (no backend)
- Store auth state in localStorage (`isAdmin = true`)
- On success, redirect to `/admin`
- Minimal black/white themed form centered on page

#### 2. New file: `src/pages/AdminDashboard.tsx`
- **Stats row**: 4 cards — Total Buses, On Route, At Stop, Avg Occupancy (as in reference image)
- **Fleet Overview table**: Bus #, Route, Driver, Status, Occupancy bar, ETA, "View" action
- Filter tabs: All, Active, At Stop, Maintenance
- **Right panel**: Selected bus detail (reuses bus data) with:
  - Bus name, route, status badge
  - Driver info (name, badge ID)
  - Passengers occupancy bar
  - "ETA Next Stop" display
  - "Time to Reach Bus" display (new)
  - Driver Information section
  - NO "Send Message to Driver", "Schedule Maintenance", "Book This Bus", or "View Full Details" buttons

#### 3. Update `src/components/DashboardHeader.tsx`
- Remove the notification bell button
- Accept optional `isAdmin` prop to show "Admin Dashboard" or "Student Dashboard" subtitle
- Add "Admin Login" link (when student) or "Student View" link (when admin)

#### 4. Update `src/components/BusInfoPanel.tsx` (student view)
- Remove "Book This Bus" and "View Full Details" buttons
- Change "Estimated Arrival" label to "Time to Reach Next Stop"
- Add a second time display: "Time to Reach Bus" (mock value, e.g., `bus.eta + 2` min)
- Remove "GPS Accuracy" from Quick Stats

#### 5. Update `src/components/ActiveBusList.tsx`
- Remove occupancy percentage from each bus card (keep ETA only)

#### 6. Update `src/App.tsx`
- Add routes: `/admin-login` -> `AdminLogin`, `/admin` -> `AdminDashboard`

### Files to create/edit
| File | Action |
|------|--------|
| `src/pages/AdminLogin.tsx` | Create |
| `src/pages/AdminDashboard.tsx` | Create |
| `src/components/DashboardHeader.tsx` | Edit — remove bell, add admin/student nav |
| `src/components/BusInfoPanel.tsx` | Edit — remove buttons, rename ETA, add second time, remove GPS stat |
| `src/components/ActiveBusList.tsx` | Edit — remove occupancy % |
| `src/App.tsx` | Edit — add routes |

