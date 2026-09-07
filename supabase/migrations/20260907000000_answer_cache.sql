-- The answer cache (ADR-0018). The same two tables the SQLite store has kept
-- since ADR-0016, in the engine production runs on.
--
-- WHY NOT public. A table in Supabase's `public` schema is served by PostgREST
-- to anyone holding the anon key, and the anon key ships inside the browser
-- bundle - it is designed to be public. In `public` with no row-level security
-- this table would therefore be readable AND writable by any visitor who opened
-- the network tab, which for a cache means somebody could write an answer of
-- their own choosing and have SASANA serve it as a Custom. That is precisely
-- the "confident wrong Custom" failure the whole product exists to prevent.
--
-- A schema other than `public` is not exposed by PostgREST at all, so the table
-- is reachable only over a direct Postgres connection holding the database
-- password - which lives in the backend's environment and never reaches a
-- browser. The revokes below are the second lock on the same door.

CREATE SCHEMA IF NOT EXISTS cache;

-- Neither of Supabase's browser-facing roles has any business here.
REVOKE ALL ON SCHEMA cache FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS cache.answers (
  key         text PRIMARY KEY,
  -- The invalidation that matches the data: an answer derived from rules.json
  -- is stale when the rules change, not when an hour has passed (ADR-0016).
  kb_hash     text        NOT NULL,
  response    jsonb       NOT NULL,
  -- What the first call actually cost. Every later hit adds this again, which
  -- is what makes /api/stats a measurement rather than an estimate.
  tokens      integer     NOT NULL,
  hits        integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_hit_at timestamptz
);

-- Eviction orders by exactly this, and it runs on every write once the table is
-- full. Without the index that is a sort over the whole table each time.
CREATE INDEX IF NOT EXISTS answers_eviction_order
  ON cache.answers (hits ASC, COALESCE(last_hit_at, created_at) ASC);

-- Hits and misses. Separate from the rows because a miss has no row to count
-- itself on, and a hit rate needs its denominator.
CREATE TABLE IF NOT EXISTS cache.counters (
  name  text PRIMARY KEY,
  value bigint NOT NULL
);

REVOKE ALL ON ALL TABLES IN SCHEMA cache FROM anon, authenticated;
