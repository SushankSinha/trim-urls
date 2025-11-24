
Notes:
- `DATABASE_URL` must be a valid Postgres connection string.
- `VITE_BASE_URL` is used by the frontend redirect / API URL build. Adjust if your server runs on a different host/port.

---

## Folder structure (important files)

root
- server/
  - index.js                      # Express server entry
  - routes/link.routes.js         # API + redirect routes
  - controller/links.controller.js# Route handlers (create, list, stats, delete, redirect)
  - db/pool.js                    # Postgres Pool + table creation
  - middlewares/rate-limiter.js   # Rate limiter config
  - service/url-validator.js      # URL validation (HEAD/GET checks)
  - utils/generateCode.js         # secure random code generator
- client/
  - src/
    - App.jsx
    - index.css                    # Vanilla CSS
    - apiInstance.js               # axios instance (used by components)
    - components/
      - LinkForm.jsx
      - LinksTable.jsx
      - CopyButton.jsx
      - Message.js                 # lightweight toast utility
      - SearchBar.jsx
      - Headers.jsx
    - pages/
      - Dashboard.jsx
      - StatsPage.jsx
      - HealthPage.jsx
      - RedirectPage.jsx
  - package.json
- README.md                      # (this file)

---

## API endpoints (server)
- GET /api/healthz
- POST /api/links          -> create short link (body: { url, code? })
- GET  /api/links          -> list all links
- GET  /api/links/:code    -> get single link stats
- DELETE /api/links/:code  -> delete link
- GET  /api/redirect/:code     -> redirect to target URL (tracks clicks)

All API routes return JSON.

---

## Quality & safety notes
- DB table is created automatically on startup (if not present).
- Rate limiter protects endpoints; health checks are skipped by the limiter.
- URL validation attempts HEAD then GET; if Node lacks fetch, it will fall back to syntax-only validation.
- Custom codes are validated to be exactly between 6-8 alphanumeric characters.

---

## Deployment
- Build client with `npm run build` (client folder) and serve static build from any static server or integrate with server.
- Ensure `DATABASE_URL` and `PORT` set in production environment.
