# Integration, Localization & AI

Owner: C

## Scope

- Content routes/controller (`backend/routes/content.js`, `backend/controllers/contentController.js`)
- Translation client wrapping the MyMemory API (`backend/utils/translateClient.js`), with per-content translation caching
- Parent summary generation (`backend/routes/parentSummary.js`, `backend/controllers/parentSummaryController.js`)
- Content screen UI (`frontend/src/pages/ContentScreen.jsx`)
- Parent summary modal (`frontend/src/components/ParentSummaryModal.jsx`)

## Notes

- Translations are cached on the `Content` document (`translations` map) so repeat requests for the same language don't re-hit the API.
- `parentSummaryController.js` currently returns a placeholder summary — swap in the real AI-generated version here.
