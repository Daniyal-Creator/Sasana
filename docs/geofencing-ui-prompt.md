# Task brief — Explore (geofencing) UI, frontend only

> **How to use this file.** Paste the whole thing into your coding agent as the task. It is self-contained: every token value, component API, and file path you need is written out below, so you do not need to open any other document in this repo. Work through the seven steps in order and commit after each one.

---

## 1. What you are building

SASANA is a bilingual (Indonesian / English) web app that helps visitors to Bali understand local custom at sacred places before they act. It already has three working pages: a landing page, a photo checker (`/check`), and a chat assistant (`/assistant`).

You are adding the fourth feature: **Explore**. It answers one question for the visitor — *"what is expected of me at the sacred place I am standing near, or the one I am planning to visit?"*

Two routes, no backend, no API calls. Everything runs in the browser against data bundled into the app.

| Route | What it is |
|---|---|
| `/explore` | One page holding four states: asking for location permission, no site nearby, browsing sites on a map, and approaching a site. |
| `/explore/[siteId]` | The full customs list for one site. |

Reference screenshots sit in `docs/geofencing-referensi/`. **They are a rough sketch, not a pixel target.** Use them for layout and information order. Ignore their colors, their map tiles, their fonts, and the account avatar in the header — those contradict the design system in §5 and the design system wins every time. You do not need to match them closely.

---

## 2. Hard boundaries

**Create only these files:**

```
frontend/src/app/explore/page.tsx
frontend/src/app/explore/[siteId]/page.tsx
frontend/src/components/explore/*.tsx
frontend/src/data/sites.ts
frontend/src/lib/geo.ts
frontend/src/lib/i18n.explore.ts
```

**Do not modify any existing file.** Not `lib/i18n.ts`, not `app/page.tsx`, not `check/page.tsx`, not `assistant/page.tsx`, not `tailwind.config.ts`, not `globals.css`, not any component under `components/ui/` or `components/layout/`. The repo owner is working in those files in parallel and your changes there would collide with his. If you believe you need to touch one, stop and write the reason in the PR description instead.

**Do not install any dependency.** No Leaflet, no Mapbox, no framer-motion, no date library, no geolocation wrapper. The map is hand-written SVG (§8). `lucide-react`, `next`, `react`, and `tailwindcss` are already installed and are all you get.

**Reaching Explore.** There is no link to `/explore` from the landing page yet — the repo owner is adding that button himself. Navigate to `http://localhost:3000/explore` directly while you work.

---

## 3. Vocabulary

Use these exact words in code, in variable names, and in UI copy. The words on the right are the ones people reach for by reflex, and they are wrong here.

| Use | Meaning | Never use |
|---|---|---|
| **Site** | A sacred place a visitor can approach: a temple, a spring, a sacred coastal area. | Temple, location, spot, POI, destination |
| **Zone** | The circular area around a Site inside which its customs apply. Has a centre and a radius. | Geofence, sacred area, boundary, perimeter |
| **Custom** | One piece of expected behaviour shown to a visitor, phrased as what to do. | Guideline, etiquette, tip, do's and don'ts, rule |
| **Odalan** | A Site's own anniversary ceremony, when it is busier and more restricted. | Festival, event, holiday |
| **Live Mode** | Finding the Site the visitor is near from the device's own position. | GPS mode, auto mode |
| **Explore Mode** | Choosing a Site by hand, whether or not the visitor is near it. | Demo mode, manual mode, preview mode |

So: `sites.ts`, `SiteCard`, `isInsideZone`, `customs[]`. Not `temples.json`, not `GeofenceCard`, not `rules[]`.

---

## 4. Design tokens

These are already configured in `tailwind.config.ts`. Use the Tailwind class names in the right column. **Never write a raw hex value, an `rgb()`, or an arbitrary pixel value in your code.** If you find yourself typing `#`, you are doing something wrong.

### Color

| Class | Value | Use for |
|---|---|---|
| `bg-bg` | `#F6F1E9` | Page canvas. Warm sandstone, never white. |
| `bg-surface` | `#FFFDF9` | Cards, bars, sheets. |
| `bg-surface-sunken` | `#EFE8DC` | Inset areas, the map background. |
| `border-border` | `#E4DACB` | Hairline dividers, card borders. |
| `border-border-strong` | `#CBBFA8` | Emphasized borders. |
| `text-text` | `#2A2520` | Primary text. Warm ink, never black. |
| `text-text-secondary` | `#5C544A` | Secondary text, captions. |
| `text-text-muted` | `#8A8073` | Placeholder, disabled, helper. |
| `bg-primary` / `text-primary` | `#1D4E89` | The one interactive color. Buttons, links, active states, zone circles. |
| `bg-primary-hover` | `#163C6B` | Primary hover. |
| `bg-primary-tint` | `#E7EEF6` | Tinted informational bands, selected states. |
| `text-primary-fg` | `#FBFCFE` | Text on primary. |
| `text-accent` / `bg-accent` | `#B8862B` | Gold. Small highlights only, at most 10% of a screen. Never as body text. |
| `text-accent-strong` | `#8A6416` | Gold when it must be readable text. |
| `bg-status-warn-bg` `text-status-warn-fg` `border-status-warn-border` | `#FBF1DE` `#8A5A00` `#EEDBA8` | The Odalan notice, and only that. |

Status colors (`status-ok-*`, `status-bad-*`, `status-unknown-*`) belong to the photo checker. Do not use them in Explore.

### Type

Two families, both already loaded. `font-display` is Fraunces, a serif, for headings only. `font-sans` is Plus Jakarta Sans, for everything else, and is the default.

Sizes: `text-xs` `text-sm` `text-base` `text-lg` `text-h3` `text-h2` `text-h1` `text-display`. Nothing else. No `text-[17px]`.

### Shape and depth

Radius: `rounded-sm` (8px) `rounded-md` (12px) `rounded-lg` (16px) `rounded-xl` (24px) `rounded-full`.
Shadow: `shadow-sm` (cards at rest) `shadow-md` (sticky bars) `shadow-lg` (the bottom sheet) `shadow-focus` (focus ring).
Width caps: `max-w-tool` (600px) for the whole Explore column on tablet and up.

### Icons

`lucide-react` only, always `strokeWidth={1.75}`, sizes 16, 20, or 24. Import by name: `import { MapPin, Bell, ShieldCheck } from "lucide-react"`. Decorative icons get `aria-hidden`.

Icons you will need: `MapPin`, `MapPinOff`, `Navigation`, `Bell`, `ScrollText`, `ShieldCheck`, `ChevronRight`, `ChevronDown`, `Camera`, `MessageCircle`, `Shirt`, `Music`, `Plane`, `VolumeX`, `Compass`.

---

## 5. Design laws

These are hard rules from `docs/design-guardrails.md`. Breaking one means the work gets sent back.

1. **No gradients.** None. Not on buttons, not on text, not as a background, not "just for depth". If an area feels flat, change the surface token (`bg-bg` → `bg-surface` → `bg-surface-sunken`), add a `border-border` hairline, or raise the shadow.
2. **Tokens only.** No raw hex, no `rgb()`, no arbitrary pixel values, no new colors, no new fonts.
3. **No glow, no glassmorphism, no `backdrop-blur`, no neumorphism, no 3D tilt, no parallax.**
4. **Never nest a card inside a card.** Inside the bottom sheet and inside cards, use rows separated by `border-border` hairlines, not more cards.
5. **No `border-left` accent stripe** to convey meaning.
6. **Motion is transform and opacity only**, nothing above 400ms, no bounce, no elastic, no spring. Respect `prefers-reduced-motion`.
7. **No emoji anywhere in the UI.** Not in buttons, not in headings, not in empty states.
8. **No stock photos, no illustrations of Balinese people, ceremonies, or temples, and nothing AI-generated.** The map is abstract geometry; that is the only picture on these screens.
9. **Color is never the only signal.** Every state carries an icon and a text label too.
10. **Copy rules:** no em dashes, no marketing filler ("seamless", "unlock", "powered by AI", "in seconds"), no exclamation marks, no ALL CAPS warnings. Lead with what to do, never with what the visitor did wrong. Never invent a rule or a capability.

---

## 6. What already exists and how to use it

### `Button` — `@/components/ui/Button`

```tsx
import { Button } from "@/components/ui/Button";
import { Camera } from "lucide-react";

<Button variant="primary" size="lg" icon={Camera} href="/check">Check my photo</Button>
<Button variant="secondary" onClick={handleClick}>Not now</Button>
```

Props: `variant` (`"primary" | "secondary" | "ghost" | "danger"`), `size` (`"sm" | "md" | "lg"`), `icon` (a Lucide component), `iconPosition`, `loading`, `disabled`, `href` (renders a `next/link`), `type`, `onClick`, `aria-label`, `className`, `children`. Use it for every button. Do not hand-roll one.

### `Card` — `@/components/ui/Card`

Props: `as`, `padding` (`"sm" | "md" | "lg"`), `interactive`, `className`, `children`.

### `EmptyState` — `@/components/ui/EmptyState`

Props: `icon` (Lucide component), `title`, `description`, `children`. Use it for the "no site nearby" state.

### Language — `@/lib/language`

```tsx
"use client";
import { useLang } from "@/lib/language";

const { lang } = useLang(); // "id" | "en"
```

The `Header` (with the language switcher) and `Footer` are already rendered by the root layout on every route. **Do not add your own header, your own back button, or your own language toggle.** The reference screenshots show a header with an account avatar; ignore it, this app has no accounts.

### Your own copy — `@/lib/i18n.explore` (you create this)

Do not touch the existing `lib/i18n.ts`. Create a parallel file with the same shape:

```ts
import type { Lang } from "@/lib/i18n";

type Entry = { en: string; id: string };

const dict = {
  "explore.permission.title": {
    en: "Know the rules before you arrive.",
    id: "Ketahui aturannya sebelum Anda tiba.",
  },
  // ...
} satisfies Record<string, Entry>;

export type ExploreKey = keyof typeof dict;

export function tExplore(lang: Lang, key: ExploreKey): string {
  return dict[key][lang];
}
```

**Every single string a user can see must go through `tExplore`, in both languages.** No hardcoded English in JSX. Indonesian copy should sound like a calm, well-informed local, not like machine translation: "Aktifkan lokasi" not "Nyalakan lokasi", "Situs suci terdekat" not "Situs sakral terdekat".

---

## 7. Data — `frontend/src/data/sites.ts`

A typed TypeScript module, not a JSON file in `public/`. That way the compiler checks it, it ships inside the bundle, and there is no fetch that can fail.

```ts
export type Localized = { en: string; id: string };

export type CustomIcon = "dress" | "photography" | "offerings" | "drones" | "quiet";

export interface Custom {
  id: string;
  icon: CustomIcon;
  title: Localized;    // one or two words: "Dress"
  summary: Localized;  // one line, shown in lists
  detail: Localized;   // two or three sentences, shown when expanded
}

export interface Site {
  id: string;          // "pura-tanah-lot"
  name: string;        // a proper noun, never translated
  region: string;      // "Tabanan, Bali"
  areaLabel: Localized;// "Sacred coastal temple area"
  lat: number;
  lng: number;
  radiusM: number;     // the Zone radius in metres
  customs: Custom[];
  source: string;      // "Bali Governor Circular No. 7/2025"
  odalanDates: string[]; // ISO dates, e.g. ["2026-10-14"]. May be empty.
}

export const SITES: Site[] = [ /* six entries */ ];
```

### The six sites

Coordinates are approximate and that is fine.

| id | name | region | lat | lng | radiusM | customs |
|---|---|---|---|---|---|---|
| `pura-tanah-lot` | Pura Tanah Lot | Tabanan, Bali | -8.6212 | 115.0868 | 400 | dress, photography, offerings, drones, quiet |
| `pura-luhur-uluwatu` | Pura Luhur Uluwatu | Badung, Bali | -8.8291 | 115.0849 | 400 | dress, photography, offerings, quiet |
| `pura-besakih` | Pura Besakih | Karangasem, Bali | -8.3739 | 115.4515 | 500 | dress, photography, offerings, drones, quiet |
| `pura-batu-bolong` | Pura Batu Bolong | Badung, Bali | -8.6547 | 115.1225 | 250 | dress, offerings, quiet |
| `pura-tirta-empul` | Pura Tirta Empul | Gianyar, Bali | -8.4156 | 115.3153 | 300 | dress, photography, offerings, quiet |
| `pura-ulun-danu-beratan` | Pura Ulun Danu Beratan | Tabanan, Bali | -8.2750 | 115.1668 | 350 | dress, photography, drones, quiet |

Give `pura-besakih` and `pura-tanah-lot` one `odalanDates` entry each in the next twelve months so the Odalan notice is visible while testing. Leave the rest empty.

### The five customs, written out

Here is `pura-tanah-lot` in full. Write the other five sites the same way, adapting the wording to each place. Keep the voice: it says what to do, it never scolds.

```ts
{
  id: "pura-tanah-lot",
  name: "Pura Tanah Lot",
  region: "Tabanan, Bali",
  areaLabel: { en: "Sacred coastal temple area", id: "Kawasan pura tepi laut" },
  lat: -8.6212, lng: 115.0868, radiusM: 400,
  source: "Bali Governor Circular No. 7/2025",
  odalanDates: ["2026-10-14"],
  customs: [
    {
      id: "dress",
      icon: "dress",
      title: { en: "Dress", id: "Pakaian" },
      summary: {
        en: "A kamen and sash are required to enter the grounds.",
        id: "Kamen dan selendang wajib dipakai untuk masuk ke area pura.",
      },
      detail: {
        en: "Wear a kamen, a length of cloth wrapped at the waist, with a sash tied over it. Both are lent or rented at the entrance. Shoulders and knees stay covered inside the grounds.",
        id: "Kenakan kamen, kain yang dililitkan di pinggang, dengan selendang diikat di atasnya. Keduanya dipinjamkan atau disewakan di pintu masuk. Bahu dan lutut tetap tertutup selama di dalam area pura.",
      },
    },
    // photography, offerings, drones, quiet follow the same shape
  ],
}
```

The remaining four, in short, for you to expand:

- **photography** — Photos are fine outside the inner courtyard. Ask before photographing someone who is praying, and never stand higher than a priest to get a shot.
- **offerings** — Canang, small woven trays of flowers, are placed on the ground. Walk around them, never over them or on them.
- **drones** — Flying over the temple area is not permitted. This is enforced, and it interrupts ceremonies.
- **quiet** — Keep your voice low near people who are praying, and let a ceremony pass rather than crossing through it.

---

## 8. Geometry — `frontend/src/lib/geo.ts`

Pure functions, no React, no side effects.

```ts
export interface LatLng { lat: number; lng: number }

/** Great-circle distance in metres. Earth radius 6_371_000 m. */
export function haversineMeters(a: LatLng, b: LatLng): number;

/** The closest Site to a position, with its distance. */
export function nearestSite(pos: LatLng, sites: Site[]): { site: Site; distanceM: number };

/** Inside the Zone: distance <= radiusM. */
export function isInsideZone(pos: LatLng, site: Site): boolean;

/**
 * Outside the Zone with hysteresis: distance > radiusM + EXIT_BUFFER_M.
 * A GPS reading that jitters across the boundary must not re-fire the notice,
 * so entering and leaving use different thresholds.
 */
export const EXIT_BUFFER_M = 100;
export function hasExitedZone(pos: LatLng, site: Site): boolean;

/**
 * Under 1 km: rounded to 50 m, "650 m".
 * Under 10 km: one decimal, "4.1 km" (EN) / "4,1 km" (ID).
 * Above that: whole numbers, "18 km".
 * Kilometres only, never miles.
 */
export function formatDistance(meters: number, lang: Lang): string;
```

### The stylized map — `components/explore/ZoneMap.tsx`

There are no map tiles and no map library. You are drawing an inline `<svg>`.

- **Projection.** Fixed bounding box over Bali: longitude `114.40` to `115.75`, latitude `-8.90` to `-8.05`. Then `x = (lng - minLng) / (maxLng - minLng) * width` and `y = (maxLat - lat) / (maxLat - minLat) * height`. That is good enough at this scale; do not reach for a projection library.
- **Background.** A `rect` filled with the sunken surface token. You may add one or two large soft shapes in the primary tint to suggest water, as in the fifth reference screenshot. You may not add coastlines, roads, labels of towns, or anything that pretends to be a real map.
- **Zones.** One `circle` per Site: stroke in primary at 2px, fill in primary at `fillOpacity={0.12}`. A flat fill with an alpha value is fine; a gradient is not.
- **Scale.** A 400 m radius on a 95 km-wide box is under a pixel, so the circles must be drawn larger than true scale to be visible. Clamp the drawn radius to a minimum of 14px. Because of this, **print a line under the map reading "Schematic map, not to scale"** (through `tExplore`, in both languages). Do not let the UI imply the drawing is survey-accurate.
- **User position.** In Live Mode, a filled primary `circle` of radius 6 at the projected position, with a second primary circle at `fillOpacity={0.18}` and radius 16 behind it. No pulsing animation.
- **Labels.** Site names as `<text>` in `text-xs`, `fill` from the text token via a Tailwind class on the element.
- **Accessibility.** The `<svg>` gets `role="img"` and an `aria-label` naming what it shows, for example "Schematic map of six sacred sites in Bali". Every fact on the map must also exist as text in the list below it, because a screen reader user gets nothing from the drawing.

---

## 9. The screens

Reference screenshots, in the order they appear below: `izin lokasi.png`, `tidak ada situs di dekat sini.png`, `beberapa zona di map.png`, `Mendekati situs suci(layar utama).png`, `Detail situs, aturan lengkap.png`.

### 9.1 `/explore` — the state machine

```
                  ┌─────────────┐
   first visit →  │   asking    │  screen A
                  └──────┬──────┘
             "Turn on location"  │  "Not now" / permission denied
                  ┌──────┴──────┐ └──────────────┐
                  ▼             ▼                ▼
            ┌──────────┐  ┌──────────┐    ┌──────────┐
            │  inside  │  │ outside  │    │ explore  │  screen C
            │ screen D │  │ screen B │    │  (map)   │
            └──────────┘  └──────────┘    └──────────┘
```

Hold this in one `useState<"asking" | "outside" | "inside" | "explore">`. The whole page is a Client Component (`"use client"` at the top) because it reads geolocation.

Geolocation: call `navigator.geolocation.watchPosition` after the user presses "Turn on location", never on mount — a permission prompt that appears before the visitor has been told why is exactly what screen A exists to prevent. Handle the error callback by falling to `explore`. Clear the watch on unmount.

**The notice fires once.** When the visitor enters a Zone, the sheet opens. It does not re-open for that Site until `hasExitedZone` returns true for it. Keep that "already announced" set in a plain `useRef<Set<string>>` **in memory only**. Do not write it to `localStorage` or `sessionStorage`: screen A promises the app does not store where the visitor has been, and a list of visited Site ids in device storage would make that promise false. Losing the state on reload is the correct trade.

### 9.2 Screen A — asking for permission

Centred column, `max-w-tool`, generous vertical rhythm.

```
        ( MapPin in a primary-tint circle, 64px )

        Know the rules before you arrive.        ← font-display, text-h1, centred

        Turn on location and SASANA will show
        the customs that apply at a sacred site
        while you are still outside it.          ← text-base, text-secondary, centred

  Bell        A quiet heads-up
              One notice as you approach a site. Never repeated while you stay.

  ScrollText  Only the customs that apply here
              Attire, photography, and behaviour for that specific place.

  Compass     No map to download
              Site boundaries travel inside the app.

  ┌──────────────────────────────────────────┐
  │ ShieldCheck  Your location is checked on  │  ← Card, padding md
  │ your device only. SASANA never stores or  │
  │ shares where you have been.               │
  └──────────────────────────────────────────┘

  <<  MapPin  Turn on location  >>              ← Button primary, size lg, full width
              Not now                            ← Button ghost, full width → "explore"
```

The three rows are `flex` with a 24px icon in `text-primary` on the left, title in `font-medium`, body in `text-sm text-text-secondary`. They are rows, not cards.

Note the third row's copy. The sketch said "Works without a signal", which is not true — without a service worker the page itself will not load offline. Say what is actually true instead: there is no map data to download, and the Site list ships inside the app.

### 9.3 Screen B — no Site nearby

```
  Nearby                                  ← font-display, text-h2
  Customs for the sacred sites around you.← text-sm text-secondary

  ┌────────── ZoneMap, h-48, rounded-lg ─────────┐
  └───────────────────────────────────────────────┘
  Schematic map, not to scale                    ← text-xs text-muted

        ( MapPinOff, muted )                     ← EmptyState
        No sacred site nearby
        The closest one is about 4.1 km away.
        We will let you know before you arrive.

  CLOSEST SITES                                  ← text-xs font-medium text-muted, tracking-wide

  MapPin  Pura Tanah Lot            4.1 km  ›    ← rows, border-border divider between
          Sacred coastal temple area
  MapPin  Pura Luhur Uluwatu         18 km  ›
          Clifftop sacred area
  MapPin  Pura Besakih               52 km  ›
          Mother temple complex

  ShieldCheck  Checked on your device. Nothing is stored.   ← text-xs text-muted, centred
```

Each row is a `next/link` to `/explore/[siteId]`, at least 44px tall, with a `ChevronRight` at the end. Sort by distance, show the three closest.

The heading "CLOSEST SITES" is uppercase, which is allowed only because it is `text-xs`. Do not uppercase anything larger.

### 9.4 Screen C — browsing the map

Reached by "Not now", by a denied permission, or by a "Browse all sites" affordance on screen B. This is Explore Mode, and it is what a visitor outside Bali sees.

The `ZoneMap` grows to fill most of the viewport, with all six Zones drawn and labelled. Below it, a `Card` for the selected Site (default: the first, or the nearest if a position is known) showing name, distance when known, its one-line `areaLabel`, the `summary` of its first Custom, and a `Button variant="secondary"` reading "See all customs here" that links to the detail route.

Tapping a Zone circle selects that Site and updates the card. Zone circles are interactive, so give each a `<title>` child for the accessible name and make it keyboard-reachable, or provide the same selection through a plain list of buttons underneath. A screen reader user must be able to select a Site without the SVG.

### 9.5 Screen D — approaching a Site

A bottom sheet over the map. This is the payoff screen of the whole feature.

```
  ┌──────── ZoneMap, filling the area above the sheet ────────┐
  └───────────────────────────────────────────────────────────┘
  ┌───────────────────────────────────────────────────────────┐
  │                        ────                                │ ← grab handle
  │ ┌───────────────────────────────────────────────────────┐ │
  │ │ MapPin  YOU ARE APPROACHING                            │ │ ← bg-primary-tint band
  │ │         Pura Tanah Lot                                 │ │   label text-xs, name text-h3
  │ └───────────────────────────────────────────────────────┘ │
  │                                                            │
  │ This is a sacred area. Three customs apply here.           │
  │ ───────────────────────────────────────────────────────── │
  │ Shirt   Wear a kamen and sash to enter the grounds.        │
  │ ───────────────────────────────────────────────────────── │
  │ Camera  Photos are fine outside the inner courtyard.       │
  │ ───────────────────────────────────────────────────────── │
  │ Music   Walk around offerings placed on the ground.        │
  │ ───────────────────────────────────────────────────────── │
  │ ShieldCheck  Bali Governor Circular No. 7/2025             │ ← text-sm text-muted
  │                                                            │
  │ [ Camera  Check my photo ]  [ MessageCircle  Ask ]         │
  └───────────────────────────────────────────────────────────┘
```

- **Two snap points.** Peek at about 45% of the viewport height (the band plus the first Custom visible) and full at about 85%. Draggable between the two, or switchable by tapping the handle if dragging is fiddly. It never closes completely — the sheet is the content of this screen.
- **Rows, not cards.** The sheet is already a raised surface. Putting cards inside it nests cards, which is banned. Separate the Customs with `border-border` hairlines.
- **The count in the sentence is real.** "Three customs apply here" comes from `site.customs.length`, spelled out through `tExplore`. Show at most the first three in the sheet; the detail page has the rest.
- **Buttons.** "Check my photo" is `variant="primary"` with `href="/check"`. "Ask" is `variant="secondary"` with `href="/assistant"`. Plain navigation, no query parameters — the repo owner will wire the context through later.
- **Motion.** The sheet rises with `transform: translateY`, 300ms, `ease-out-quart` (`ease-[cubic-bezier(0.25,1,0.5,1)]`). Never animate `height`. Under `prefers-reduced-motion`, it appears without the slide.

### 9.6 Screen E — `/explore/[siteId]`

A Client Component. Read `params.siteId`, find it in `SITES`, and call `notFound()` from `next/navigation` if there is no match.

```
  Pura Tanah Lot                                 ← font-display, text-h2
  MapPin  Tabanan, Bali · 4.1 km away            ← text-sm text-secondary (distance only if known)

  ┌───────────────────────────────────────────┐
  │ MapPin  Sacred area. Customs apply inside │  ← bg-primary-tint band, rounded-lg
  │ the marked zone.                          │
  └───────────────────────────────────────────┘

  ┌───────────────────────────────────────────┐
  │ Bell  Odalan on 14 October                │  ← only when a date is within 7 days
  │ The temple holds its anniversary ceremony │     status-warn tokens
  │ then. Expect crowds and tighter access.   │
  └───────────────────────────────────────────┘

  Customs here                                   ← font-display, text-h3

  Shirt   Dress                              ⌄   ← accordion row, ChevronDown
          A kamen and sash are required…         summary, truncated
  ───────────────────────────────────────────
  Camera  Photography                        ⌄
  ───────────────────────────────────────────
  Music   Offerings                          ⌄
  ───────────────────────────────────────────
  Plane   Drones                             ⌄
  ───────────────────────────────────────────
  VolumeX Quiet                              ⌄

  ShieldCheck  Source: Bali Governor Circular No. 7/2025

  <<  Camera  Check my photo here  >>            ← primary, sticky bottom on mobile
       Compass  View as if I am here             ← secondary
```

- **The rows are accordions, not links.** The sketch drew a right-pointing chevron, which by convention means "this navigates somewhere". It does not. Use `ChevronDown` and rotate it 180° when open, `transition-transform duration-200`. Expanding reveals `custom.detail` below the summary. Use a real `<button>` with `aria-expanded` and `aria-controls`. Several rows may be open at once.
- **The Odalan notice** appears only when one of `site.odalanDates` falls within the next seven days. Compute it with plain `Date` arithmetic; do not install a date library. There is no open/closed status anywhere in this feature — we do not have reliable opening hours, and showing a wrong "Open" in front of a place of worship is worse than showing nothing.
- **"View as if I am here"** is the Explore Mode escape hatch: it navigates back to `/explore` with the approaching sheet open for this Site, using a simulated position at the Site's own coordinates. Label it honestly — it must never look like a real GPS fix. A small line reading "Simulated location" in the sheet while this is active is the right touch. This exists so someone testing the app from outside Bali can still see screen D.

---

## 10. Work order

Seven steps. Commit after each one. Each commit must leave `npm run build` passing, so the history reads as seven working states rather than one dump.

| # | Step | Done when | Commit message |
|---|---|---|---|
| 1 | `lib/geo.ts` | All five functions exist and are typed. Sanity-check `haversineMeters` between Tanah Lot and Uluwatu: roughly 23 km. | `feat(explore): add haversine distance and zone helpers` |
| 2 | `data/sites.ts` | Six Sites, every Custom filled in both languages, `npm run typecheck` clean. | `feat(explore): add sacred site data` |
| 3 | `lib/i18n.explore.ts` | Every string from §9 present in EN and ID. | `feat(explore): add explore copy in id and en` |
| 4 | Screen A at `/explore` | Permission screen renders, "Turn on location" asks for real permission, "Not now" moves to explore state. | `feat(explore): add location permission screen` |
| 5 | `ZoneMap` + screen B | Map draws six Zones, screen B lists the three closest Sites with distances. | `feat(explore): add zone map and nearby sites list` |
| 6 | Screen C + screen D | Zone selection works, the sheet opens on entering a Zone and fires once per entry. | `feat(explore): add site map browsing and approach sheet` |
| 7 | Screen E | Detail route renders, accordions open, Odalan notice appears, simulate button returns to the sheet. | `feat(explore): add site detail page with customs` |

### Testing without being in Bali

Chrome DevTools → three-dot menu → More tools → Sensors → Location → Custom, then enter `-8.6212 / 115.0868` to stand at Pura Tanah Lot. Change it to something far away to watch the sheet close and the notice re-arm.

### Git

```bash
git checkout -b feat/explore
```

Seven commits on that branch, then push and open a pull request against `main`. Do not commit to `main` directly. Do not rebase or force-push. If `npm run build` fails on a step, fix it before committing rather than committing broken and repairing after.

---

## 11. Before you open the pull request

Run these from `frontend/`:

```bash
npm run typecheck
npm run build
```

Both must pass with no errors.

Then run these from the repo root. Each must return nothing from your new files:

```bash
rg -n "gradient|bg-gradient-to|from-\[|via-|to-\[|bg-clip-text" frontend/src
rg -n "#[0-9a-fA-F]{3,8}\b|rgba?\(" frontend/src/app frontend/src/components
rg -n "backdrop-blur|drop-shadow|animate-bounce|blur-\d" frontend/src
rg -n "\[(#|[0-9]+px)" frontend/src/app frontend/src/components
rg -n "—" frontend/src
```

And check by hand:

- [ ] No file outside the list in §2 was modified. `git diff --stat main` proves it.
- [ ] No new dependency in `package.json`.
- [ ] Every visible string comes from `tExplore`, and both languages read naturally.
- [ ] The layout works at 375px wide with no horizontal scroll, and still works at 320px.
- [ ] Every button and row is at least 44px tall.
- [ ] The whole feature is usable with the keyboard alone: Tab reaches every control, Enter and Space activate, focus is always visible.
- [ ] Nothing on screen claims an ability the app does not have.

---

## 12. If something here is wrong

This brief was written before the code existed, so parts of it may not survive contact. If a decision here makes the feature worse, do not silently follow it and do not silently ignore it: build the rest, and write what you hit and what you did instead in the pull request description. A short note about a real problem is worth more than a screen that matches the sketch.
