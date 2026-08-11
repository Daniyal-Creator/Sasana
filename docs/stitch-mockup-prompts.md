# Stitch Mockup Prompt Pack — SASANA

**Paket prompt siap-tempel untuk membuat mockup UI di Google Stitch**

| | |
|---|---|
| **Dokumen** | Prompt pack untuk generate mockup referensi UI |
| **Turunan dari** | [PRD](./prd.md) · [UI/UX Spec](./ui-spec.md) · [Design Guardrails](./design-guardrails.md) · [ADR-0001](./adr/0001-landing-hero-image.md) |
| **Versi** | 1.0 |
| **Tujuan** | Mockup ini adalah **referensi visual**, bukan sumber kebenaran. Kalau hasil Stitch bentrok dengan `ui-spec.md` / `design-guardrails.md`, yang menang adalah spec. |

> **Cara baca.** Bagian 1–3 menjelaskan *apa* yang perlu dibuat (peta layar + flow). Bagian 4 adalah blok design-system yang ditempel sekali di awal. Bagian 5 berisi prompt per layar, siap copy-paste. Bagian 6–7 untuk revisi dan pengecekan anti-slop.
>
> Narasi dokumen ini bahasa Indonesia; **semua prompt ditulis bahasa Inggris** karena Stitch jauh lebih akurat dengan istilah UI berbahasa Inggris, dan copy produk kita memang punya versi EN resmi di ui-spec §10.

---

## Daftar isi

1. [Alur kerja di Stitch](#1-alur-kerja-di-stitch)
2. [Peta layar (screen inventory)](#2-peta-layar-screen-inventory)
3. [Flow antar layar](#3-flow-antar-layar)
4. [Blok A — Design system (tempel sekali)](#4-blok-a--design-system-tempel-sekali)
5. [Blok B — Prompt per layar](#5-blok-b--prompt-per-layar)
6. [Blok C — Prompt revisi & varian](#6-blok-c--prompt-revisi--varian)
7. [Anti-slop: kesalahan yang pasti dilakukan Stitch](#7-anti-slop-kesalahan-yang-pasti-dilakukan-stitch)

---

## 1. Alur kerja di Stitch

Urutan ini penting. Jangan langsung tembak prompt layar tanpa design system dulu, hasilnya akan jadi UI startup AI generik dan melanggar guardrails.

| Langkah | Yang dilakukan | Blok yang dipakai |
|---|---|---|
| 1 | Buat project baru, nama **`SASANA`** | — |
| 2 | Set device type ke **Mobile** (375px adalah layout sumber, ui-spec §3 / L5) | — |
| 3 | Generate layar pertama pakai **Blok A + prompt L1** digabung jadi satu prompt | Blok A + B-L1 |
| 4 | Setelah layar pertama jadi dan tone-nya benar, layar berikutnya cukup pakai prompt-nya saja + kalimat *"Match the exact design system, colors, fonts, and header of the previous screen."* | Blok B |
| 5 | Layar desktop dibuat terpisah dengan device type **Desktop** | Blok B-L2, B-L11 |
| 6 | Revisi pakai prompt pendek dan spesifik, satu perubahan per prompt | Blok C |
| 7 | Cek hasil pakai checklist bagian 7 sebelum dipakai sebagai referensi | — |

**Catatan praktis:**

- Stitch punya kuota generate per bulan yang terbatas. Prioritaskan tier **P0** di tabel bagian 2 dulu (6 layar). Sisanya kalau kuota masih ada.
- Kalau tersedia mode dengan model lebih kuat (Gemini 3 Pro / 3.1 Pro di API, atau mode eksperimental di web), pakai itu untuk **L1 (landing)** dan **L6 (result card)** — dua layar itu yang paling menentukan kesan pertama juri.
- Fitur **variants** Stitch (`creativeRange: REFINE`) berguna untuk eksplorasi layout hero. Jangan pakai `REIMAGINE` — itu akan membuang design system kita.
- Export HTML dari Stitch **jangan** dipakai langsung sebagai kode produksi. Kode Stitch tidak memakai token kita (`bg-surface`, `text-secondary`, dst.) dan akan langsung gagal audit `rg` di guardrails §10.2. Ambil idenya, bukan file-nya.

---

## 2. Peta layar (screen inventory)

Aplikasi ini hanya punya **4 route** (PRD §10), tapi menjadi **14 layar mockup** karena tiap route punya beberapa state. State inilah yang biasanya lupa dibuat, padahal justru itu yang dinilai juri di kriteria UI/UX (20%).

| # | Layar | Route | State | Device | Prioritas |
|---|---|---|---|---|---|
| L1 | Landing | `/` | statis | Mobile | **P0** |
| L2 | Landing | `/` | statis | Desktop | **P0** |
| L3 | Situation Check — kosong | `/check` | idle / empty | Mobile | **P0** |
| L4 | Situation Check — foto terpilih | `/check` | selected, tombol aktif | Mobile | P1 |
| L5 | Situation Check — loading | `/check` | loading + skeleton | Mobile | P1 |
| L6 | Situation Check — hasil `not_compliant` | `/check` | success (merah) | Mobile | **P0** |
| L7 | Situation Check — hasil `compliant` | `/check` | success (hijau) | Mobile | P1 |
| L8 | Situation Check — hasil `unclear` | `/check` | success (batu) | Mobile | P2 |
| L9 | Situation Check — error | `/check` | error | Mobile | P2 |
| L10 | Custom Assistant — sambutan | `/assistant` | empty | Mobile | P1 |
| L11 | Custom Assistant — percakapan | `/assistant` | conversation | Mobile | **P0** |
| L12 | Custom Assistant — jawaban tak ter-grounding | `/assistant` | ungrounded | Mobile | P2 |
| L13 | About | `/about` | statis | Mobile | **P0** |
| L14 | Component sheet | — | semua komponen | Desktop | P2 |

> `needs_attention` (kuning) sengaja tidak dibuat sebagai layar terpisah — layout-nya identik dengan L6/L7, hanya token warnanya yang bertukar (ui-spec §5.3). Cukup jelaskan lewat anotasi.

**Yang TIDAK ada di aplikasi ini** — jangan sampai Stitch menambahkannya sendiri:

- Tidak ada halaman login / signup / onboarding (tidak ada akun sama sekali)
- Tidak ada bottom tab bar (navigasi hanya lewat 2 CTA di landing + tombol Back)
- Tidak ada dashboard, profil, riwayat, notifikasi, atau setting
- Tidak ada peta, GPS, badge, atau kalender — semua itu roadmap pasca-MVP (PRD §18)
- Tidak ada dark mode (post-MVP, ui-spec header)

---

## 3. Flow antar layar

```
                        ┌─────────────────────────┐
                        │   L1/L2  Landing  /     │
                        │  hero + 2 pintu besar   │
                        └───┬─────────────────┬───┘
              "Situation    │                 │   "Ask the
               Check"       │                 │    Assistant"
                            ▼                 ▼
        ┌───────────────────────────┐   ┌──────────────────────────┐
        │  L3  /check  idle         │   │  L10  /assistant empty   │
        │  pilih konteks + upload   │   │  sambutan + QuickChips   │
        └───────────┬───────────────┘   └───────────┬──────────────┘
                    │ foto dipilih                  │ ketik / tap chip
                    ▼                               ▼
        ┌───────────────────────────┐   ┌──────────────────────────┐
        │  L4  foto terpilih        │   │  typing indicator        │
        │  tombol Analyze aktif     │   │  POST /api/chat          │
        └───────────┬───────────────┘   └───────────┬──────────────┘
                    │ tap Analyze                   │
                    ▼                               ├─ grounded ─► L11 bubble + Source
        ┌───────────────────────────┐               ├─ ungrounded ► L12 "no official info"
        │  L5  loading + skeleton   │               └─ error ────► bubble Try again
        │  POST /api/vision         │                             │
        └───────────┬───────────────┘                             ▼
                    │                                      riwayat tersimpan
     ┌──────────────┼──────────────┬─────────────┐         dalam satu sesi
     ▼              ▼              ▼             ▼
   L7 hijau     kuning         L6 merah      L8 batu        L9 error
   "You're      "A small       "Please       "I can't       "Something
    good to      thing to       adjust"       tell"          went wrong"
    go"          check"            │             │               │
     │              │              │             │               │
     └──────────────┴──────────────┴─────────────┘               │
                    │ "Check another"        │ "Retake photo"    │ "Try again"
                    └────────────────────────┴───────────────────┘
                                     │
                                     ▼
                              kembali ke L3

  Global (ada di semua layar): header wordmark + tombol [ ID | EN ]
  Footer landing & about → link ke  L13  /about
```

Detail flow resminya ada di ui-spec §6.1–6.3. Diagram di atas adalah versi yang sudah dipetakan ke nomor layar mockup.

---

## 4. Blok A — Design system (tempel sekali)

Ini yang membuat mockup terlihat seperti SASANA, bukan seperti template AI. **Tempel blok ini di depan prompt layar pertama.** Untuk layar berikutnya cukup rujuk balik ke layar pertama.

### 4.1 Versi teks (untuk Stitch web / prompt biasa)

```text
DESIGN SYSTEM — apply to every screen in this project.

Product: SASANA, a mobile-first web app that helps foreign tourists in Bali
understand and respect local custom before entering sacred sites. Tone:
a calm, warm, knowledgeable local friend. Civic and credible, never a
tourist brochure and never a startup landing page.

Theme: LIGHT ONLY. High contrast, designed to be readable in bright
outdoor tropical sunlight. Do not produce a dark variant.

Colors (use these exact hex values, nothing else):
- Page background: #F6F1E9 (warm volcanic sandstone)
- Raised surface / cards / bars: #FFFDF9
- Sunken surface / input wells: #EFE8DC
- Hairline border: #E4DACB   Strong border: #CBBFA8
- Primary text: #2A2520   Secondary text: #5C544A   Muted text: #8A8073
- Primary action (deep sea indigo): #1D4E89, hover #163C6B,
  tint #E7EEF6, text on primary #FBFCFE
- Accent (temple gilding gold): #B8862B, used on at most 10% of the screen,
  only as the logo mark and 1px decorative rules. Gold is never body text.
- Status green: text #2E7D46 on #E8F3EB, border #BEDDC6
- Status amber: text #8A5A00 on #FBF1DE, border #EEDBA8
- Status red:   text #B23A2E on #FBEAE7, border #EEC4BD
- Status stone: text #6B6459 on #F0ECE4, border #D9D1C4
Never use pure black #000 or pure white #FFF anywhere, including shadows.

Typography (only these two families):
- Display, headings, and the wordmark: Fraunces, weight 600, serif
- All UI, body, buttons, labels, chat: Plus Jakarta Sans, weights 400/500/600
Scale: display 47.8px / h1 39.8px / h2 31.2px / h3 25px / lead 20px /
body 16px / small 14px / label 12px. Body line-height 1.55.
Do not use Inter, Roboto, Arial, Helvetica, Poppins, Montserrat, or
Space Grotesk anywhere.

Shape and depth:
- Corner radius: 8px badges, 12px buttons and inputs, 16px cards,
  24px hero media, fully rounded pills for chips.
- Shadows are warm-tinted rgba(42,37,32,...), low and soft:
  cards 0 1px 2px .05, hover 0 4px 12px .08, sheets 0 12px 32px .14.
- Depth comes only from surface steps, 1px hairlines, and these shadows.

Icons: Lucide outline icons only, stroke width 1.75, sizes 16 / 20 / 24.
No filled icons, no other icon set, no emoji anywhere in the interface.

Spacing: 4px base unit. Vary the rhythm deliberately: hero sections use
48-64px vertical padding, cards 20-24px, dense controls 12-16px.
Do not apply one uniform padding to everything.

HARD BANS. Breaking any of these makes the output unusable:
- NO gradients of any kind on buttons, text, cards, borders, status
  surfaces, backgrounds, or the logo. Every fill is one flat solid color.
  The only permitted gradient is a single-hue warm-ink scrim
  rgba(42,37,32,0.55) to rgba(42,37,32,0) over a photograph.
- NO purple, pink, violet, teal, lime, or neon colors. NO tropical
  turquoise-and-sunset-orange tourist palette.
- NO glassmorphism, frosted glass, backdrop blur, neumorphism, glow,
  neon shadow, 3D tilt, or parallax.
- NO emoji, NO 3D illustrations, NO isometric blobs, NO generic vector
  people, NO undraw-style artwork.
- NO photographs or illustrations of Balinese people, ceremonies,
  temples, offerings, or religious practice.
- NO three identical feature cards in a row.
- NO cards nested inside other cards.
- NO left-border accent stripe to indicate status.
- NO carousel, no hero slider, no marquee, no modal on load, no cookie
  banner, no newsletter capture.
- NO bottom tab bar and NO hamburger menu. This app has four pages and
  navigates only through two large buttons on the landing page.
- Copy contains no em dashes and no marketing filler words such as
  seamless, unlock, elevate, revolutionary, powered by AI, or in seconds.

Accessibility: every interactive target is at least 44x44px. Status is
always communicated by icon plus text label plus color, never by color
alone. Text contrast is at least 4.5:1.
```

### 4.2 Versi YAML (untuk Stitch SDK / MCP, format `DESIGN.md`)

Kalau nanti pakai Stitch lewat SDK atau MCP server, token yang sama bisa dikirim dalam format front matter yang Stitch pahami:

```yaml
---
version: alpha
name: SASANA
description: Warm paras-stone light theme, segara indigo primary, prada gold accent. Light only, flat fills, no gradients.
colors:
  bg: "#F6F1E9"
  surface: "#FFFDF9"
  surface-sunken: "#EFE8DC"
  border: "#E4DACB"
  border-strong: "#CBBFA8"
  text: "#2A2520"
  text-secondary: "#5C544A"
  text-muted: "#8A8073"
  primary: "#1D4E89"
  primary-hover: "#163C6B"
  primary-tint: "#E7EEF6"
  primary-fg: "#FBFCFE"
  accent: "#B8862B"
  accent-strong: "#8A6416"
  focus: "#3B6FB0"
  status-ok-fg: "#2E7D46"
  status-ok-bg: "#E8F3EB"
  status-ok-border: "#BEDDC6"
  status-warn-fg: "#8A5A00"
  status-warn-bg: "#FBF1DE"
  status-warn-border: "#EEDBA8"
  status-bad-fg: "#B23A2E"
  status-bad-bg: "#FBEAE7"
  status-bad-border: "#EEC4BD"
  status-unknown-fg: "#6B6459"
  status-unknown-bg: "#F0ECE4"
  status-unknown-border: "#D9D1C4"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 47.8px
    fontWeight: 600
    lineHeight: 1.05
  h1:
    fontFamily: Fraunces
    fontSize: 39.8px
    fontWeight: 600
    lineHeight: 1.1
  h2:
    fontFamily: Fraunces
    fontSize: 31.2px
    fontWeight: 600
    lineHeight: 1.15
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 25px
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
spacing:
  sm: 8
  md: 16
  lg: 24
  xl: 48
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.md}"
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.md}"
    padding: 16px
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: 20px
---
```

---

## 5. Blok B — Prompt per layar

Tiap layar punya dua bagian: **rincian isi section** (untuk kamu pahami dan cek hasilnya), lalu **prompt siap-tempel** di dalam blok kode.

---

### L1 — Landing page, mobile (P0)

**Isi section dari atas ke bawah:**

| Section | Isi |
|---|---|
| **Header** | Wordmark `SASANA` (Fraunces 600) dengan mark emas kecil di kirinya, dan pill toggle `[ ID \| EN ]` di kanan. Tidak ada menu lain. |
| **Hero** | Satu foto lanskap Bali (sawah subak berundak, laut/gunung di kejauhan, cahaya lembut) dengan scrim tinta hangat alpha-only di atasnya. Di atas scrim: H1 Fraunces 3 baris + lead paragraph. Ini satu-satunya gambar dekoratif di seluruh aplikasi (ADR-0001). |
| **Dua pintu (CTA)** | Dua kartu tombol full-width bertumpuk. Kartu 1 = primary indigo solid, ikon `Camera`, judul + deskripsi satu baris. Kartu 2 = secondary (surface + border), ikon `MessageCircle`. Tinggi minimum 56px. Ini section terpenting: PRD §6 menyebutnya "dua pintu besar". |
| **How it works** | Tiga langkah bernomor ①②③ tersusun vertikal, dihubungkan garis rambut 1px emas. **Bukan** tiga kartu identik (guardrail L1). |
| **Footer** | Disclaimer kredibilitas + janji privasi + link About. |

**Prompt:**

```text
Design a mobile landing page, 375px wide, for SASANA, an app that helps
tourists respect Balinese custom at sacred sites.

Structure, top to bottom:

1. HEADER, 56px tall, background #FFFDF9, 1px bottom border #E4DACB.
   On the left, a small gold #B8862B geometric mark followed by the
   wordmark "SASANA" in Fraunces 600, 20px, color #2A2520, letter-spaced
   slightly. On the right, a two-segment pill toggle reading "ID | EN"
   where EN is the active segment filled #1D4E89 with #FBFCFE text and ID
   is #5C544A on #FFFDF9. No hamburger menu, no other navigation.

2. HERO. A full-width landscape photograph of Balinese subak rice
   terraces with the sea and distant mountains in soft morning light,
   360px tall, 24px rounded bottom corners, with a warm dark scrim over
   it going from rgba(42,37,32,0.55) at the bottom to transparent at the
   top. The photograph must contain no people, no temples, no ceremonies,
   and no religious objects. Over the scrim, bottom-aligned with 24px
   padding: an h1 in Fraunces 600, 39.8px, line-height 1.1, color #FBFCFE,
   reading "Understand and respect Balinese customs, before you enter."
   Below it, 20px Plus Jakarta Sans in a slightly translucent white,
   reading "Your friendly guide to sacred sites in Bali."

3. TWO PRIMARY DOORS, 24px page padding, 12px gap, stacked vertically.
   These are the most prominent elements on the page.
   Card A: solid flat #1D4E89 background, 12px radius, 20px padding,
   minimum 88px tall. A 24px Lucide camera outline icon in #FBFCFE, then
   the title "Situation Check" in Plus Jakarta Sans 600, 20px, #FBFCFE,
   then "Check a photo against local custom." in 14px at 85% opacity.
   Card B: #FFFDF9 background, 1px #CBBFA8 border, 12px radius, same
   padding and height. A 24px Lucide message-circle icon in #1D4E89, the
   title "Ask the Assistant" in 20px #2A2520, and "Questions about the
   rules, answered." in 14px #5C544A.
   Both cards have a flat solid fill. No gradient, no glow, no shine.

4. HOW IT WORKS section, 48px top padding, background #F6F1E9.
   A heading "How it works" in Fraunces 600, 31.2px, #2A2520.
   Below it, three numbered steps stacked vertically, connected by a
   vertical 1px #B8862B hairline rule running through the numbers.
   Each step is a 32px circle outlined 1px #B8862B containing the numeral
   1, 2, or 3 in #8A6416, with the step text to its right in 16px #2A2520:
   step 1 "Snap or upload a photo", step 2 "Get friendly feedback",
   step 3 "Enter with confidence".
   These are NOT three cards. They are numbered list items on the plain
   page background, joined by one thin gold line.

5. FOOTER, background #EFE8DC, 32px vertical padding, 12px text #5C544A,
   left aligned: "Not affiliated with the Bali government. Reference:
   Governor Circular No. 7/2025." on one line, "Photos are never stored."
   on the next, and a text link "About" in #1D4E89.

Flat solid fills everywhere except the single hero scrim. No emoji.
No third-party logos. No testimonials, no statistics row, no pricing,
no feature grid, no sign-up form.
```

---

### L2 — Landing page, desktop (P0)

**Perubahan dari mobile:** hero jadi dua kolom (teks kiri max 520px, dua kartu CTA di kanan), how-it-works jadi tiga kolom horizontal dengan garis emas penghubung mendatar, container dibatasi 1120px.

**Prompt:**

```text
Design the desktop version, 1280px wide, of the SASANA landing page.
Same design system, same colors, same fonts, same copy as the mobile
landing screen. Content is centered in a container capped at 1120px with
32px side gutters.

1. HEADER, 72px tall, #FFFDF9 with a 1px #E4DACB bottom border. Gold mark
   plus "SASANA" wordmark on the left. On the right, a text link "About"
   in #5C544A followed by the "ID | EN" pill toggle.

2. HERO, two columns, 64px vertical padding, 48px column gap.
   Left column, maximum 520px wide: the h1 in Fraunces 600 at 47.8px,
   color #2A2520 on the plain #F6F1E9 background, reading "Understand and
   respect Balinese customs, before you enter." Below it a 20px #5C544A
   lead line "Your friendly guide to sacred sites in Bali." Below that,
   the two door cards stacked with a 12px gap, styled exactly as on
   mobile, each 88px tall.
   Right column: the landscape photograph of subak rice terraces with sea
   and mountains in soft light, 24px radius, filling the column height,
   no scrim needed because no text sits on it here. No people, no temples,
   no ceremonies in the image.

3. HOW IT WORKS, 64px vertical padding. Heading "How it works" in
   Fraunces 600, 31.2px, left aligned. Below it, the three numbered steps
   laid out horizontally in three equal columns, connected by a single
   horizontal 1px #B8862B hairline rule that passes behind the three
   numbered circles. Same numerals and same three labels as mobile.
   Not three cards, not three boxes, just numbers on a gold rule.

4. FOOTER, #EFE8DC, 40px padding, one row: disclaimer text on the left,
   "Photos are never stored." and an "About" link on the right.

Flat fills, no gradients, no emoji, no logo wall, no stats, no pricing.
```

---

### L3 — Situation Check, kosong (P0)

**Isi section:**

| Section | Isi |
|---|---|
| **Header** | Tombol Back + wordmark + language pill |
| **Judul halaman** | H1 "Situation Check" + subtitle |
| **ContextSelector** | Segmented control 2 pilihan: `At a temple` / `General` |
| **CameraUploader** | Well dashed 2px, background sunken, ikon `ImageUp`, dua tombol di dalamnya (Take photo / Upload), tinggi minimum 200px |
| **Privacy notice** | Ikon `ShieldCheck` + teks kecil, **permanen terlihat**, persis di atas tombol utama |
| **Aksi utama** | Tombol `Analyze photo` full-width sticky di bawah, **kondisi disabled** |

**Prompt:**

```text
Design a mobile screen, 375px wide, for the SASANA Situation Check page
in its empty state, before the user has chosen a photo. Same design
system as the landing page.

1. HEADER, 56px, #FFFDF9, 1px #E4DACB bottom border. A Lucide arrow-left
   icon plus the word "Back" in 16px #1D4E89 on the left, the "SASANA"
   wordmark centered, and the "ID | EN" pill on the right.

2. PAGE TITLE block, 24px side padding, 24px top padding.
   "Situation Check" in Fraunces 600, 39.8px, #2A2520.
   Below it, 14px #5C544A: "Check your photo against Balinese custom."

3. CONTEXT SELECTOR, 24px top margin. A 12px label "Where are you?" in
   #5C544A, then a full-width segmented control 44px tall on a #EFE8DC
   track with 4px inner padding and a 12px radius. Two equal segments:
   "At a temple" is active, rendered as a solid #1D4E89 pill with #FBFCFE
   text; "General" is inactive, #5C544A text on the track.

4. UPLOAD WELL, 24px top margin, full width, 220px tall, 16px radius,
   #EFE8DC background, 2px DASHED #CBBFA8 border. Centered inside:
   a 32px Lucide image-up outline icon in #8A8073, then "Take or upload a
   photo" in 16px 500 weight #2A2520, then "JPG or PNG, up to 5 MB" in
   12px #8A8073, then a row of two buttons with a 12px gap:
   "Take photo" as a solid #1D4E89 button with a Lucide camera icon and
   #FBFCFE text, 44px tall, 12px radius; and "Upload" as a #FFFDF9 button
   with a 1px #CBBFA8 border, a Lucide image icon, and #2A2520 text.

5. PRIVACY NOTICE, 20px top margin, a single row with no card around it:
   a 16px Lucide shield-check icon in #5C544A followed by 12px #5C544A
   text reading "Your photo is analyzed once and never stored." This is
   always visible and never hidden behind a tap.

6. BOTTOM ACTION BAR pinned to the bottom of the screen, #FFFDF9 with a
   1px #E4DACB top border and 16px padding. A full-width 56px button with
   a 12px radius in its DISABLED state: #EFE8DC background, #8A8073 text
   reading "Analyze photo", no shadow.

No bottom tab bar. No card wrapping the whole page. No emoji.
Flat fills only.
```

---

### L4 — Situation Check, foto terpilih (P1)

**Prompt:**

```text
Design the same SASANA Situation Check mobile screen, but in the state
where a photo has been selected and is ready to analyze. Identical
header, title, context selector, privacy notice, and layout.

Replace the dashed upload well with a PHOTO PREVIEW block: the user's
photograph filling a 220px tall area, 16px radius, object-fit cover.
In its top-right corner, a 32px circular button with a #FFFDF9 background
at 90% opacity containing a 16px Lucide x icon in #2A2520, used to remove
the photo. Directly under the preview, a 12px #8A8073 caption reading
"IMG_2043.jpg  ·  1.8 MB".

The photograph shown in the preview is an ordinary casual snapshot of a
visitor standing outdoors in front of a plain stone wall in daylight.
No temple, no ceremony, no offerings, no religious objects.

The bottom action bar now shows the button in its ENABLED state: solid
flat #1D4E89 background, #FBFCFE text reading "Analyze photo", 56px tall,
12px radius, soft warm shadow 0 4px 12px rgba(42,37,32,0.08).
```

---

### L5 — Situation Check, loading (P1)

**Prompt:**

```text
Design the same SASANA Situation Check mobile screen in its LOADING
state, while the photo is being analyzed. Identical header and title.

The photo preview stays at the top but is dimmed to about 60% brightness.
Centered over it, a 24px circular loading spinner drawn as a 2px #E4DACB
ring with a #1D4E89 arc, and below the spinner the text "Analyzing your
photo…" in 14px 500 weight #FBFCFE.

Below the photo, in the space where the result will appear, a SKELETON
placeholder shaped exactly like the future result card: a #FFFDF9 card
with a 1px #E4DACB border and 16px radius, containing a full-width 48px
tall #EFE8DC bar at the top standing in for the status header band, then
three #EFE8DC text bars at 100%, 90%, and 60% width, then a 44px #EFE8DC
bar standing in for a button. Every skeleton bar has an 8px radius and a
flat #EFE8DC fill with no animation shown.

The bottom action bar shows the primary button disabled, containing a
small spinner and the label "Analyze photo".

No progress percentage, no progress bar, no shifting gradient bar.
```

---

### L6 — Hasil `not_compliant` (P0)

Ini layar yang paling menentukan. Aturan mutlak dari ui-spec §5.3: **status dibawa oleh header band lebar penuh + ikon + label teks**, bukan garis aksen di kiri, dan kartu ini tidak boleh berisi kartu lain.

**Isi kartu, dari atas:**

1. Status header band (lebar penuh, tint merah)
2. `reason` — apa yang terlihat
3. Sub-bagian `Suggestion` — apa yang harus dilakukan
4. `SourceReference` — rujukan aturan
5. Tombol `Check another`

**Prompt:**

```text
Design the SASANA Situation Check mobile screen showing a result with the
status "not compliant". Same header and design system.

At the top, the analyzed photo as a 160px tall thumbnail with a 16px
radius, object-fit cover, showing a casual visitor standing outdoors in
daylight. No temple, no ceremony, no offerings in the image.

Below it, 20px gap, the RESULT CARD: a #FFFDF9 card with a 1px #EEC4BD
border, 16px radius, and a soft shadow 0 4px 12px rgba(42,37,32,0.08).
The card is built as follows.

STATUS HEADER BAND: a full-width strip across the entire top of the card,
filled flat #FBEAE7, 56px tall, 20px horizontal padding, with the card's
top corners rounded. It contains a 24px Lucide circle-x outline icon in
#B23A2E followed by the label "Please adjust before entering" in Plus
Jakarta Sans 600, 16px, #B23A2E. This band is the only status indicator.
Do NOT add a colored stripe along the left edge of the card.

BODY, #FFFDF9 background, 20px padding:
- The finding in 16px #2A2520, line-height 1.55: "You appear to be wearing
  shorts and a sleeveless top inside a temple area."
- A 20px gap, then a 12px uppercase-free label "Suggestion" in 600 weight
  #5C544A, then in 16px 500 weight #2A2520: "Wrap a kamen and a sash
  around your waist before entering the inner courtyard. Most temples
  lend them at the entrance."
- A 16px gap, a 1px #E4DACB horizontal hairline, then a row with a 16px
  Lucide shield-check icon in #5C544A and 14px #5C544A text reading
  "Reference: Bali Governor Circular No. 7/2025".

Directly under the card, outside it, a full-width 44px secondary button:
#FFFDF9 background, 1px #CBBFA8 border, 12px radius, a Lucide refresh-cw
icon and the label "Check another" in #2A2520.

The card contains no nested cards. Red appears only inside the status
band and its icon and label, nowhere else on the screen. Flat fills only,
no gradient on the status band.
```

---

### L7 — Hasil `compliant` (P1)

**Prompt:**

```text
Design the same SASANA result screen but with the status "compliant".
Identical layout, identical card structure, only the status tokens and
the text change.

The result card border is #BEDDC6. The status header band is filled flat
#E8F3EB and contains a 24px Lucide circle-check outline icon in #2E7D46
and the label "You're good to go" in 16px 600 weight #2E7D46.

Body text: "You are wearing a kamen and sash, which is what temple
grounds require."
The labelled subsection is called "Tip" instead of "Suggestion", and
reads: "Keep the sash tied at your waist for as long as you are inside
the temple grounds."
The reference line is unchanged: "Reference: Bali Governor Circular
No. 7/2025".

The "Check another" secondary button stays below the card.
No confetti, no celebration animation, no badge, no score, no stars.
```

---

### L8 — Hasil `unclear` (P2)

**Prompt:**

```text
Design the same SASANA result screen with the status "unclear", used when
the photo is too dark or ambiguous to judge.

The result card border is #D9D1C4. The status header band is filled flat
#F0ECE4 with a 24px Lucide circle-help outline icon in #6B6459 and the
label "I can't tell from this photo" in 16px 600 weight #6B6459.

Body text: "The photo is too dark to see what you are wearing clearly."
The labelled subsection is called "Try this" and reads: "A brighter,
full-length photo taken from a few steps back will help me check
properly."

This variant has NO reference line and no hairline above it.
Instead, inside the card at the bottom, a full-width 48px PRIMARY button
with a solid flat #1D4E89 fill, 12px radius, a Lucide camera icon, and
#FBFCFE text reading "Retake photo".
The photo thumbnail at the top of the screen is visibly dark and
underexposed.
```

---

### L9 — Situation Check, error (P2)

**Prompt:**

```text
Design the SASANA Situation Check mobile screen in its ERROR state, after
the analysis request failed. Same header, same photo thumbnail at top.

In place of the result card, an error block: #FBF1DE background, 1px
#EEDBA8 border, 16px radius, 20px padding. Inside, a 24px Lucide
triangle-alert outline icon in #8A5A00, then a message in 16px #2A2520:
"Something went wrong analyzing your photo. Please try again." Then a
44px secondary button with a #FFFDF9 fill, a 1px #CBBFA8 border, 12px
radius, and the label "Try again" in #2A2520.

The message is friendly and blames nothing. No error code, no stack
trace, no "Error 500", no sad face illustration, no emoji.
```

---

### L10 — Custom Assistant, sambutan (P1)

**Isi section:**

| Section | Isi |
|---|---|
| **Header** | Back + wordmark + language pill |
| **Empty state** | Avatar bundar (mark emas di atas indigo), judul sambutan, deskripsi yang menjelaskan bahwa jawaban bersumber dari aturan resmi |
| **QuickChips** | 4 pill pertanyaan contoh, wrap 2 baris |
| **Input bar** | Sticky bawah, text field + tombol kirim bundar, plus helper micro-copy |

**Prompt:**

```text
Design a mobile chat screen, 375px wide, for the SASANA Custom Assistant
in its empty welcome state, before any message has been sent. Same design
system as the other screens.

1. HEADER, 56px, #FFFDF9, 1px #E4DACB bottom border: a Lucide arrow-left
   icon plus "Back" in #1D4E89, the "SASANA" wordmark centered, and the
   "ID | EN" pill on the right.

2. WELCOME BLOCK, vertically centered in the remaining space, centered
   text, 32px side padding.
   A 56px circular avatar filled solid #1D4E89 containing a simple gold
   #B8862B geometric mark. No photograph, no face, no cartoon character.
   Below it, "Hi, I'm Sasana" in Fraunces 600, 25px, #2A2520.
   Below that, in 16px #5C544A with line-height 1.55: "Ask me anything
   about Balinese customs and sacred sites. I answer from the official
   rules."

3. QUICK CHIPS, 32px top margin, left aligned with 24px side padding.
   A 12px #8A8073 label "Try asking:" then four pill-shaped buttons that
   wrap across two rows with an 8px gap. Each pill is 40px tall, fully
   rounded, #FFFDF9 background, 1px #CBBFA8 border, 14px #1D4E89 label:
   "Can I wear shorts at a temple?", "Can I fly a drone at Tanah Lot?",
   "What is a canang offering?", "Is it okay to take photos inside?"

4. INPUT BAR pinned to the bottom, #FFFDF9 with a 1px #E4DACB top border
   and 12px padding. A row containing a 48px tall text field with a
   #EFE8DC fill, a 12px radius, 16px horizontal padding, and the
   placeholder "Ask about a custom…" in #8A8073; then an 8px gap; then a
   48px circular solid #1D4E89 button with a 20px Lucide send icon in
   #FBFCFE. Under the row, 12px #8A8073 text: "Answers come from official
   rules, not opinions."

No bottom tab bar. No sidebar. No conversation list. No attachment
button, no microphone button, no emoji picker.
```

---

### L11 — Custom Assistant, percakapan (P0)

**Aturan bubble** (ui-spec §5.6): user di kanan dengan isi indigo solid dan sudut kanan-bawah disikukan; assistant di kiri dengan surface + border dan sudut kiri-bawah disikukan; `SourceReference` berada **di dalam** bubble assistant, di bawah garis rambut.

**Prompt:**

```text
Design the SASANA Custom Assistant mobile screen with an active
conversation. Same header and input bar as the welcome screen.

The message list fills the space between header and input bar, 16px side
padding, 16px gap between messages, scrolled so the newest message is
near the bottom.

Message 1, USER, right aligned, maximum 85% width: a bubble with a solid
flat #1D4E89 fill, #FBFCFE text at 16px, 12px vertical and 16px
horizontal padding, 16px radius on three corners and a 4px radius on the
bottom-right corner. Text: "Can I wear shorts at a temple?"

Message 2, ASSISTANT, left aligned, maximum 85% width, preceded by a 28px
circular avatar filled #1D4E89 with a small gold mark, sitting at the
bubble's top-left outside it. The bubble has a #FFFDF9 fill, a 1px
#E4DACB border, #2A2520 text at 16px with 1.55 line-height, 16px radius
on three corners and a 4px radius on the bottom-left corner. Text:
"Modest dress is required at temple grounds. Wear a kamen and a sash
around your waist. Many temples lend them for free at the entrance, so
shorts alone are not enough to enter."
Inside the same bubble, below the text: a 1px #E4DACB hairline, then a
row with a 16px Lucide shield-check icon in #5C544A and 14px #5C544A
text reading "Source: Bali Governor Circular No. 7/2025".

Message 3, USER, right aligned, same user styling: "And a drone at Tanah
Lot?"

Message 4, ASSISTANT typing indicator: a small left-aligned bubble in the
assistant style, 48px wide and 36px tall, containing three 6px #8A8073
dots in a row at varying opacity.

Above the input bar, a single row of two quick-reply pills that has
shrunk to fit: "What is a canang offering?" and "Is it okay to take
photos inside?", styled as before.

Bubbles are flat solid fills. No gradient bubbles, no drop shadow on
bubbles, no read receipts, no timestamps, no reaction emoji, no
thumbs-up or thumbs-down rating buttons.
```

---

### L12 — Jawaban tak ter-grounding (P2)

Layar kecil tapi penting: ini bukti visual bahwa asisten **tidak mengarang aturan** (FR2.1, guardrail W6). Juri kriteria "AI implementation" akan melihat ini.

**Prompt:**

```text
Design the SASANA Custom Assistant mobile screen showing an assistant
answer that is NOT backed by any official rule. Same layout as the
conversation screen.

User bubble, right aligned, solid #1D4E89: "What time does Besakih close
on weekends?"

Assistant bubble, left aligned, #FFFDF9 with a 1px #E4DACB border,
#2A2520 text: "I don't have official information on that in the Bali code
of conduct. The temple management or your guide can confirm the opening
hours for the day you plan to visit."

Instead of a source line, this bubble ends with a 14px italic #8A8073
note reading "No official rule found for this." There is no hairline
divider and no shield-check icon above it.

Nothing in the bubble is styled as a warning or an error. It is a calm,
ordinary answer.
```

---

### L13 — About (P0)

**Isi section:** judul → misi (prosa maks 65 karakter per baris) → kartu rujukan Surat Edaran → daftar tim → versi → footer.

**Prompt:**

```text
Design a mobile About page, 375px wide, for SASANA. Same design system,
prose column with 24px side padding and a maximum text measure of about
65 characters.

1. HEADER, 56px: Lucide arrow-left plus "Back" in #1D4E89, the "SASANA"
   wordmark centered, the "ID | EN" pill on the right.

2. "About SASANA" in Fraunces 600, 39.8px, #2A2520, with 24px top margin.

3. Section heading "Our mission" in Fraunces 600, 31.2px, 32px top
   margin. Below it, body text in 16px #2A2520, line-height 1.55: "SASANA
   helps visitors understand and respect Bali's customs, in real time and
   in their own language, so that violations are prevented before they
   happen."

4. Section heading "The rules we reference" in Fraunces 600, 31.2px,
   32px top margin. Below it, one card: #FFFDF9 background, 1px #E4DACB
   border, 16px radius, 20px padding, soft shadow. Inside, a 24px Lucide
   shield-check icon in #8A6416, then "Governor Circular (SE) No. 7 of
   2025" in 20px 600 weight #2A2520, then "Code of conduct for foreign
   tourists in Bali." in 14px #5C544A, then a 44px secondary button with
   a #FFFDF9 fill, a 1px #CBBFA8 border, 12px radius, a Lucide
   external-link icon and the label "Read the official source" in
   #1D4E89.

5. Section heading "The team" in Fraunces 600, 31.2px, 32px top margin.
   Below it, "SMK Wikrama Bogor — SASANA Group" in 16px 500 weight
   #2A2520, then a plain list with a 1px #E4DACB divider between rows,
   each row 48px tall showing a name in 16px #2A2520 and a role in 14px
   #5C544A on the line under it:
   "Daniyal Hafiidz Prasetyo / Lead and AI integration",
   "Manu Caimpiyana Bhimasena / Frontend and UI/UX",
   "Rafli Halomoan / Knowledge base, testing, and demo".
   No avatars, no photographs, no social media icons.

6. "SASANA v1.0 (MVP)" in 14px #8A8073, 32px top margin.

7. FOOTER, #EFE8DC, 32px padding, 12px #5C544A: "Photos are never
   stored." and a "Home" text link in #1D4E89.

No hero image on this page. No statistics, no timeline graphic, no
mission-vision-values triptych.
```

---

### L14 — Component sheet (P2)

Berguna untuk slide presentasi: satu halaman berisi seluruh sistem komponen.

**Prompt:**

```text
Design a desktop design-system reference sheet, 1280px wide, on a #F6F1E9
background, showing the SASANA component library. Title "SASANA design
system" in Fraunces 600, 47.8px. Lay the content out in labelled sections
with 48px vertical spacing, each section titled in Fraunces 600, 25px.

Section "Color": two rows of color swatches, each a 72px square with an
8px radius, labelled underneath with its name and hex in 12px. Row one,
surfaces and text: #F6F1E9, #FFFDF9, #EFE8DC, #E4DACB, #CBBFA8, #2A2520,
#5C544A, #8A8073. Row two, brand and status: #1D4E89, #E7EEF6, #B8862B,
#8A6416, #2E7D46, #8A5A00, #B23A2E, #6B6459.

Section "Typography": six specimen lines showing Fraunces 600 at 47.8px,
39.8px, and 31.2px, then Plus Jakarta Sans at 25px 600, 16px 400, and
14px 400, each labelled with its token name and size.

Section "Buttons": a row showing the primary button in rest and disabled
states, the secondary button, a ghost button, and a pill chip, all 44px
tall except one 56px large primary.

Section "Status cards": four small result cards side by side in one row,
each with its full-width status header band, icon, and label, in green
"You're good to go", amber "A small thing to check", red "Please adjust",
and stone "I can't tell from this photo".

Section "Form controls": the two-segment context selector, the dashed
upload well at reduced height, the chat input field with its send button,
and the "ID | EN" language pill.

Section "Icons": a row of Lucide outline icons at 24px, stroke 1.75, in
#2A2520: camera, image-up, message-circle, send, languages, arrow-left,
refresh-cw, shield-check, circle-check, triangle-alert, circle-x,
circle-help.

Everything flat, no gradients, no shadows beyond the soft warm card
shadow, no emoji.
```

---

## 6. Blok C — Prompt revisi & varian

Stitch bekerja paling baik kalau revisi dilakukan **satu perubahan per prompt**. Prompt-prompt di bawah ini adalah koreksi yang paling sering dibutuhkan.

| Masalah yang muncul | Prompt revisi |
|---|---|
| Ada gradasi warna | `Remove every gradient. Repaint every surface, button, and status band with a single flat solid color from the palette.` |
| Warna melenceng ke ungu/teal | `Replace all purple, violet, teal, and turquoise with the palette: #1D4E89 for interactive elements and #B8862B for accents only. The page background must be #F6F1E9.` |
| Font jadi Inter/Poppins | `Set all headings and the wordmark in Fraunces 600 serif. Set all other text in Plus Jakarta Sans. Do not use Inter, Roboto, Poppins, or Montserrat.` |
| How-it-works jadi 3 kartu | `Replace the three cards with three numbered steps on the plain page background, connected by a single 1px #B8862B hairline rule. Remove the card backgrounds, borders, and shadows.` |
| Status pakai garis kiri | `Remove the colored left border stripe from the result card. The status is carried only by the full-width tinted header band containing the icon and the text label.` |
| Kartu bersarang | `Flatten the nesting. The result card must not contain another card, panel, or bordered box inside it.` |
| Muncul emoji | `Remove every emoji. Replace each one with a Lucide outline icon at stroke width 1.75, or with plain text.` |
| Muncul bottom tab bar | `Remove the bottom navigation bar. This app has no tab navigation. The bottom of the screen holds only the primary action button.` |
| Muncul foto pura/upacara | `Remove all imagery of temples, ceremonies, offerings, and people in traditional dress. The only photograph allowed is the landscape hero on the landing page and the user's own uploaded photo.` |
| Terlalu banyak card | `Reduce the number of cards. Use plain page background with hairline dividers instead, and vary the vertical padding between sections instead of boxing every section.` |
| Terasa datar / kurang hidup | `Do not add gradients or glow. Instead, increase the contrast between surface steps: page #F6F1E9, cards #FFFDF9, wells #EFE8DC, and widen the vertical padding of the hero to 64px while keeping dense controls at 12px.` |
| Terlalu banyak emas | `Reduce the gold #B8862B to at most 10% of the screen. Keep it only on the logo mark and the 1px connecting rule. Everything else interactive uses #1D4E89.` |

**Untuk eksplorasi layout hero** (fitur variants, kalau lewat API/MCP):

```text
prompt: "Explore alternative arrangements of the hero image, headline,
and the two primary action cards. Keep the exact same colors, fonts,
copy, and flat fills. Do not introduce gradients or new colors."
variantOptions: { variantCount: 3, creativeRange: REFINE, aspects: [LAYOUT] }
```

Jangan pernah pakai `aspects: [COLOR_SCHEME]` — palet kita tertutup dan mengubahnya butuh ADR (guardrails §3 C2).

---

## 7. Anti-slop: kesalahan yang pasti dilakukan Stitch

Model generatif punya kecenderungan bawaan yang bertabrakan langsung dengan `design-guardrails.md`. Ini daftar periksa sebelum sebuah mockup dipakai sebagai referensi.

- [ ] **Tidak ada gradasi** kecuali satu scrim tinta hangat di atas foto hero. Cek terutama tombol, header band status, dan background hero. *(Guardrails §2)*
- [ ] **Tidak ada warna di luar palet.** Tidak ada ungu, pink, teal, lime, neon. Tidak ada palet turis teal-oranye. *(§3.2)*
- [ ] **Tidak ada `#000` atau `#FFF` murni**, termasuk pada bayangan. *(C5)*
- [ ] **Font benar:** Fraunces untuk heading, Plus Jakarta Sans untuk sisanya. Kalau muncul Inter, ulangi prompt. *(T1, T2)*
- [ ] **Tidak ada emoji** di mana pun di antarmuka. *(I2)*
- [ ] **Tidak ada glassmorphism / blur / glow / neumorphism / tilt 3D.** *(§5)*
- [ ] **Tidak ada tiga kartu identik berjajar.** *(L1)*
- [ ] **Tidak ada kartu di dalam kartu.** *(D7)*
- [ ] **Tidak ada garis aksen kiri** untuk status. Status = band lebar penuh + ikon + label. *(D8)*
- [ ] **Status selalu ikon + teks + warna**, tidak pernah warna saja. *(C6)*
- [ ] **Tidak ada gambar orang Bali, upacara, pura, atau canang.** Satu-satunya gambar dekoratif adalah lanskap di hero landing. *(I4, L8 + ADR-0001)*
- [ ] **Tidak ada bottom tab bar, hamburger menu, login, atau onboarding.** *(bagian 2)*
- [ ] **Satu aksi utama per layar.** Tidak ada dua tombol primary yang bersaing. *(L2)*
- [ ] **Copy tanpa em dash** dan tanpa kata pemasaran kosong seperti *seamless*, *unlock*, *elevate*, *powered by AI*. *(W1, W2)*
- [ ] **Copy memimpin dengan solusi, bukan kesalahan.** "Please adjust before entering", bukan "You are violating temple rules". *(W4)*
- [ ] **Padding bervariasi**, bukan satu nilai seragam di seluruh halaman. *(L3)*
- [ ] **Target sentuh minimal 44×44px.** *(P5)*
- [ ] **Notifikasi privasi terlihat permanen** di halaman `/check`, tidak disembunyikan. *(L7)*

**Uji akhir** (guardrails §1): kalau screenshot mockup ini ditaruh di antara 100 mockup AI lain, apakah ada yang menandainya sebagai SASANA selain logonya? Kalau tidak, mockup itu belum selesai.

---

*Dokumen ini adalah alat bantu produksi mockup, bukan spesifikasi. Sumber kebenaran tetap [ui-spec.md](./ui-spec.md) dan [design-guardrails.md](./design-guardrails.md).*
