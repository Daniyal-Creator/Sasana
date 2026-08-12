// Base URL of the SASANA backend, which now runs as its own service.
//
// The browser calls it directly, so this has to be a NEXT_PUBLIC_ variable. That
// is safe: the endpoint is public by design and holds no secret. The Gemini key
// stays in the backend and is never sent to the browser.
//
// The default points at the local backend container so a fresh checkout works
// after `docker compose up backend` with no env file at all. A deploy must set
// NEXT_PUBLIC_API_URL explicitly.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function apiUrl(path: string): string {
  return `${BASE.replace(/\/$/, "")}${path}`;
}
