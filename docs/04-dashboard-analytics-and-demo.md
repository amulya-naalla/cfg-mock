# Dashboard, Analytics & Demo

Owner: D

## Scope

- Dashboard aggregation logic (`backend/controllers/dashboardController.js`, may be shared with B)
- Dashboard route (`backend/routes/dashboard.js`)
- Dashboard UI page and chart (`frontend/src/pages/Dashboard.jsx`, `frontend/src/components/ClusterBarChart.jsx`)
- Demo script/flow for presenting the app end-to-end

## Notes

- `GET /api/dashboard/summary` currently returns total assessments, flagged count, and a per-cluster breakdown (count + avg score).
- Coordinate with B on any changes to the aggregation shape since the chart depends on it.
- **Educator scope update:** the Dashboard (`Dashboard.jsx`) and Content (`ContentScreen.jsx`) pages were rebuilt around an offline-first mock store (`frontend/src/data/mockData.js` + `LocalStore`) with adaptive matching logic in `frontend/src/utils/adaptive.js` (age/grade + learning level + learning gap + language). Main nav is now Dashboard | Content; student/assessment routes still exist but are unlinked. The real backend should mirror the LocalStore shapes (students with `age`, `primary_gap`, `learning_level`; content with `skill`, `difficulty`, `grades[]`, `age_min/max`) and replace the mock store behind the same API surface.
