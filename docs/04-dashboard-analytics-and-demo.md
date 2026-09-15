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
