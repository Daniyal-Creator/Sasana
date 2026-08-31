# Redesign Chatbot Sasana — UI/UX Proposal

## 1. Tujuan Redesign

Tampilan chatbot saat ini sudah memiliki dasar visual yang baik: minimal, bersih, dan konsisten dengan identitas Sasana. Masalah utamanya adalah **ruang kosong terlalu dominan**, sehingga halaman terasa seperti layar kosong dengan form chatbot di tengah.

Redesign ini mempertahankan kesan elegan dan tenang, tetapi menambahkan:
- struktur visual yang lebih jelas;
- elemen dekoratif yang terinspirasi budaya Bali;
- preview konteks sebelum pengguna mulai bertanya;
- area percakapan yang terasa seperti produk utama, bukan sekadar form input;
- hierarchy yang lebih kuat antara chatbot, sumber informasi, dan fitur pendukung.

---

# 2. Konsep Visual Baru

## Konsep: **Sacred Digital Guide**

Sasana diposisikan sebagai **pemandu digital untuk memahami adat, etika, dan situs sakral Bali**.

Visual tidak dibuat seperti chatbot AI generik. Hindari:
- gradient neon;
- glassmorphism berlebihan;
- background hitam/ungu ala AI;
- terlalu banyak ikon robot;
- ilustrasi AI yang tidak berhubungan dengan Bali.

Gunakan pendekatan:

> **Modern editorial + Balinese heritage + subtle technology**

Kesan yang ingin dicapai:

`Calm → Cultural → Premium → Trustworthy → Modern`

---

# 3. Color System

Gunakan palet yang tetap dekat dengan desain saat ini.

```css
:root {
  --ivory: #F7F2E9;
  --paper: #FCFAF5;
  --sand: #E9DDC8;
  --gold: #B88A3B;
  --gold-soft: #D7B979;
  --navy: #164B82;
  --navy-dark: #17334E;
  --ink: #292724;
  --muted: #746D63;
  --line: #DED3C2;
  --white: #FFFFFF;
}
```

### Penggunaan

| Warna | Penggunaan |
|---|---|
| `#F7F2E9` | Background utama |
| `#FCFAF5` | Card / chat panel |
| `#B88A3B` | Ornamen, accent, active state |
| `#164B82` | CTA, bot avatar, active navigation |
| `#17334E` | Heading utama |
| `#746D63` | Secondary text |
| `#DED3C2` | Border dan divider |

**Catatan:** jangan memakai gold sebagai warna utama seluruh UI. Gold lebih efektif sebagai aksen heritage.

---

# 4. Layout Baru

## Struktur Desktop

Alih-alih meletakkan chatbot langsung di tengah halaman kosong, ubah menjadi layout **3 area**:

```text
┌──────────────────────────────────────────────────────────────────┐
│  ←  SASANA                         Home Features Sites ...  ID EN │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────────────────────┐   │
│  │                  │     │                                  │   │
│  │  SASANA GUIDE    │     │      HI, I'M SASANA             │   │
│  │                  │     │                                  │   │
│  │  Ask about       │     │  Your digital guide to Bali      │   │
│  │  Balinese        │     │  customs and sacred places.      │   │
│  │  traditions      │     │                                  │   │
│  │                  │     │  ┌────────┐ ┌────────┐           │   │
│  │  Topics          │     │  │ Temple │ │Customs │           │   │
│  │  ─────────       │     │  └────────┘ └────────┘           │   │
│  │  Temple Etiquette│     │                                  │   │
│  │  Offerings       │     │  Suggested Questions              │   │
│  │  Sacred Sites    │     │                                  │   │
│  │  Photography     │     │  ○ Can I wear shorts at a temple?│   │
│  │                  │     │  ○ Can I fly a drone at Tanah Lot?│  │
│  │  [About Sources] │     │                                  │   │
│  └──────────────────┘     │                                  │   │
│                           │  ┌────────────────────────────┐  │   │
│                           │  │ Ask about a custom...       │  │   │
│                           │  │                            ➤ │  │   │
│                           │  └────────────────────────────┘  │   │
│                           └──────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Pada desktop, gunakan **sidebar kecil + main chatbot panel**.

Pada mobile, sidebar berubah menjadi horizontal topic chips dan main chatbot mengambil hampir seluruh viewport.

---

# 5. Background

Background jangan dibiarkan polos.

Gunakan kombinasi:

### Base

```css
background: #F7F2E9;
```

### Ornamen 1 — Balinese Line Pattern

Tambahkan pattern line-art dengan opacity rendah:

```css
background-image:
  url("/assets/balinese-pattern.svg");
background-size: 420px;
background-position: left bottom;
background-repeat: no-repeat;
```

Pattern sebaiknya mengambil inspirasi dari:
- ukiran daun;
- bunga kamboja;
- motif geometris Bali;
- bentuk gapura secara abstrak.

**Opacity:** sekitar `0.04 – 0.08`.

Pattern tidak boleh menjadi fokus utama.

---

# 6. Decorative Floating Elements

Tambahkan dua elemen dekoratif ringan:

### Top-right

Motif lingkaran/mandala tipis.

```text
                    ╭────────────╮
                  ╱   mandala     ╲
                 │     pattern     │
                  ╲              ╱
                    ╰────────────╯
```

Opacity rendah, sekitar 5–8%.

### Bottom-left

Gunakan ilustrasi garis pura atau silhouette arsitektur Bali.

```text
           /\        /\
          /  \  /\  /  \
         /____\/__\/____\
            ||      ||
```

Jangan menggunakan gambar realistis besar. Gunakan line-art agar tetap ringan.

---

# 7. Hero Chatbot

## Bagian atas main panel

Ubah area hero saat belum ada percakapan menjadi lebih kaya secara visual.

### Bot Avatar

Jangan hanya menggunakan lingkaran biru dengan huruf `S`.

Gunakan emblem Sasana:

```text
        ╭─────────╮
        │   S     │
        │  ✦ ✦    │
        ╰─────────╯
```

Atau gunakan logo/icon Sasana dalam lingkaran.

Style:

```css
width: 64px;
height: 64px;
border-radius: 20px;
background: var(--navy);
border: 1px solid var(--gold);
box-shadow: 0 8px 25px rgba(22, 75, 130, 0.12);
```

### Heading

```text
Hi, I'm Sasana
```

### Supporting text

```text
Your digital guide to Balinese customs,
etiquette, and sacred places.
```

Tambahkan trust indicator:

```text
✓ Answers grounded in official rules
```

Jangan menggunakan label "AI-powered" sebagai elemen utama. Posisi Sasana sebagai **guide** lebih sesuai dengan brand.

---

# 8. Topic Explorer

Tambahkan section kecil tepat di bawah hero.

### Heading

```text
What would you like to explore?
```

### Topic Cards

Gunakan 4 topic card:

```text
┌─────────────────────┐
│  ◈ Temple Etiquette │
│  Dress, behavior    │
│  and temple rules   │
└─────────────────────┘

┌─────────────────────┐
│  ❁ Balinese Customs │
│  Traditions &       │
│  daily practices    │
└─────────────────────┘

┌─────────────────────┐
│  ⌂ Sacred Sites     │
│  Places, access &   │
│  local information  │
└─────────────────────┘

┌─────────────────────┐
│  ◎ Photography      │
│  What visitors      │
│  should know        │
└─────────────────────┘
```

### Interaction

Saat hover:

```css
transform: translateY(-3px);
border-color: var(--gold);
box-shadow: 0 10px 25px rgba(30, 25, 18, 0.07);
```

Saat diklik, card langsung memasukkan prompt ke chatbot.

Contoh:

```text
[Temple Etiquette]

→ "What should I wear when visiting a temple?"
```

---

# 9. Suggested Questions Baru

Tampilan sekarang berupa 4 pill yang cukup datar.

Ubah menjadi **question cards** dengan icon kecil.

```text
Suggested questions

┌─────────────────────────────────────────────┐
│ ◈  Can I wear shorts at a temple?      →   │
├─────────────────────────────────────────────┤
│ ◎  Can I fly a drone at Tanah Lot?      →  │
├─────────────────────────────────────────────┤
│ ❁  What is a canang offering?           →  │
└─────────────────────────────────────────────┘
```

Satu pertanyaan per baris membuat area lebih editorial dan premium.

---

# 10. Chat Area Setelah User Bertanya

Begitu conversation dimulai, hero berubah menjadi conversation layout.

```text
┌────────────────────────────────────────────────┐
│ Sasana Guide                                   │
│ Official-rules based assistant                │
├────────────────────────────────────────────────┤
│                                                │
│             USER                               │
│ Can I wear shorts at a temple?                │
│                                      ┌──────┐  │
│                                      │  You │  │
│                                      └──────┘  │
│                                                │
│  SASANA                                         │
│  Temple visits generally require respectful    │
│  clothing. Specific requirements may vary...    │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ Source                                   │  │
│  │ Official temple / local regulation       │  │
│  │ View source →                             │  │
│  └──────────────────────────────────────────┘  │
│                                                │
├────────────────────────────────────────────────┤
│  Ask about a custom...                       ➤ │
└────────────────────────────────────────────────┘
```

---

# 11. Chat Bubble Style

## User

Gunakan bubble yang sedikit lebih gelap:

```css
.user-message {
  background: var(--navy);
  color: white;
  border-radius: 18px 18px 4px 18px;
}
```

## Sasana

Jangan gunakan bubble berwarna biru.

Gunakan paper/card:

```css
.bot-message {
  background: var(--paper);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 18px 18px 18px 4px;
}
```

Ini membuat jawaban Sasana terlihat seperti informasi editorial, bukan chat biasa.

---

# 12. Source / Trust Card

Ini penting karena chatbot Sasana memberikan jawaban berdasarkan aturan resmi.

Setiap jawaban dapat memiliki source mini-card:

```text
┌──────────────────────────────────────────────┐
│ SOURCE                                       │
│ ──────────────────────────────────────────── │
│ Official Balinese regulation                 │
│ Local temple guideline                       │
│                                              │
│ View source →                                │
└──────────────────────────────────────────────┘
```

Gunakan gold sebagai accent line.

Tujuan desain:

**meningkatkan trust**, bukan hanya mempercantik UI.

---

# 13. Input Area

Input sekarang terlalu kecil dan terlihat seperti form biasa.

Buat menjadi floating composer.

```text
        ┌───────────────────────────────────────────────┐
        │ Ask Sasana about Balinese customs...      ➤ │
        └───────────────────────────────────────────────┘
            Official sources • No personal opinions
```

CSS:

```css
.chat-input {
  min-height: 58px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--white);
  box-shadow: 0 10px 35px rgba(40, 30, 20, 0.08);
}
```

Send button:

```css
.send-button {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: var(--navy);
  color: white;
}
```

---

# 14. Sidebar Design

Sidebar harus terasa seperti **guide menu**, bukan dashboard admin.

```text
SASANA GUIDE

Explore
──────────────

◈ Temple etiquette

❁ Balinese customs

⌂ Sacred sites

◎ Photography


POPULAR QUESTIONS
──────────────

Temple dress
Offerings
Ceremonies
Visitor rules


ABOUT SASANA
──────────────

Information is based on
official regulations and
local guidance.
```

Lebar:

```css
width: 230px;
```

Gunakan border kanan yang sangat halus.

---

# 15. Mini Cultural Detail

Tambahkan label kecil sebelum topic section:

```text
BALI • CULTURE • RESPECT
```

Typography:

```css
font-size: 11px;
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(--gold);
```

Ini memberikan kesan editorial dan premium.

---

# 16. Typography

Gunakan kombinasi serif + sans-serif.

### Heading

Gunakan font serif:

```css
font-family: "Cormorant Garamond", serif;
```

atau font serif lokal yang sudah digunakan brand.

### Body

```css
font-family: "Inter", sans-serif;
```

### Hierarchy

```text
Hero heading       42–48px
Section heading    18–22px
Body               14–16px
Navigation         13–14px
Caption            11–12px
```

Heading jangan terlalu bold.

---

# 17. Animation

Animation harus subtle.

## Page entrance

Hero:

```css
animation: fadeUp 600ms ease;
```

## Topic cards

Stagger animation:

```text
Card 1 → 0ms
Card 2 → 80ms
Card 3 → 160ms
Card 4 → 240ms
```

## Message

Saat bot menjawab:

```text
Avatar → subtle pulse
Message → fade + translateY(6px)
```

Hindari efek typing yang terlalu lama.

---

# 18. Responsive Design

## Desktop ≥ 1024px

Gunakan:

```text
Sidebar 230px
Main 700–820px
Large breathing space
```

## Tablet 768–1023px

Sidebar diperkecil:

```text
Sidebar 180px
Main flexible
```

## Mobile ≤ 767px

Sidebar diubah menjadi:

```text
[Temple] [Customs] [Sites] [Photo]
```

dalam horizontal scroll.

Hero:

```text
[Avatar]

Hi, I'm Sasana

Your guide to Balinese
customs and sacred places.
```

Topic cards menjadi 2-column.

Chat input menggunakan fixed bottom composer.

---

# 19. Recommended Desktop Composition

Implementasi final yang paling saya rekomendasikan:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ←  [SASANA]                       Home Features Sites Benefits ... │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐      ┌──────────────────────────────────────────┐ │
│  │ SASANA       │      │                                          │ │
│  │ GUIDE        │      │              [ SASANA EMBLEM ]           │ │
│  │              │      │                                          │ │
│  │ Explore      │      │              BALI • CULTURE              │ │
│  │              │      │                                          │ │
│  │ ◈ Etiquette  │      │              Hi, I'm Sasana              │ │
│  │ ❁ Customs    │      │                                          │ │
│  │ ⌂ Sites      │      │     Your digital guide to Balinese       │ │
│  │ ◎ Photo      │      │     customs and sacred places.           │ │
│  │              │      │                                          │ │
│  │              │      │   ┌─────────┐ ┌─────────┐                │ │
│  │ About source │      │   │Etiquette│ │ Customs │                │ │
│  └──────────────┘      │   └─────────┘ └─────────┘                │ │
│                        │                                          │ │
│                        │   Suggested questions                    │ │
│                        │                                          │ │
│                        │   ┌──────────────────────────────────┐   │ │
│                        │   │ ◈ Can I wear shorts...?        → │   │ │
│                        │   ├──────────────────────────────────┤   │ │
│                        │   │ ◎ Can I fly a drone...?        → │   │ │
│                        │   ├──────────────────────────────────┤   │ │
│                        │   │ ❁ What is a canang...?         → │   │ │
│                        │   └──────────────────────────────────┘   │ │
│                        │                                          │ │
│                        │   ┌──────────────────────────────────┐   │ │
│                        │   │ Ask Sasana about a custom...  ➤ │   │ │
│                        │   └──────────────────────────────────┘   │ │
│                        │   Official sources • Not opinions        │ │
│                        └──────────────────────────────────────────┘ │
│                                                                      │
│  ◇ subtle Balinese line-art                         mandala ◌      │
└──────────────────────────────────────────────────────────────────────┘
```

---

# 20. Component Structure

Untuk memudahkan implementasi, pecah UI menjadi komponen:

```text
ChatbotPage
│
├── Navbar
│
├── ChatLayout
│   │
│   ├── GuideSidebar
│   │   ├── TopicList
│   │   ├── PopularQuestions
│   │   └── SourceInfo
│   │
│   └── ChatPanel
│       ├── ChatHeader
│       ├── WelcomeHero
│       ├── TopicExplorer
│       ├── SuggestedQuestions
│       ├── MessageList
│       ├── SourceCard
│       └── ChatComposer
│
└── DecorativeBackground
    ├── BalinesePattern
    └── MandalaDecoration
```

---

# 21. Interaction Flow

## Kondisi 1 — First Visit

```text
Navbar
↓
Welcome Hero
↓
Topic Explorer
↓
Suggested Questions
↓
Chat Composer
```

User langsung memahami fungsi chatbot tanpa melihat layar kosong.

## Kondisi 2 — User memilih topic

```text
Click Topic Card
↓
Prompt otomatis masuk ke composer
↓
User mengirim
↓
Chat mode aktif
```

## Kondisi 3 — Percakapan aktif

```text
Hero mengecil
↓
Message list menjadi fokus utama
↓
Source card muncul pada jawaban
↓
Composer tetap berada di bawah
```

---

# 22. Detail yang Membuat Desain Tidak Terlihat "AI Generated"

Ini bagian yang paling penting.

### Jangan:

```text
❌ Gradient biru-ungu
❌ Robot illustration
❌ "Powered by AI"
❌ Glassmorphism berat
❌ Neon glow
❌ Banyak floating blobs
❌ 3D AI icons
```

### Gunakan:

```text
✓ Editorial spacing
✓ Paper-like cards
✓ Serif typography
✓ Fine borders
✓ Gold accent
✓ Balinese line-art
✓ Cultural vocabulary
✓ Subtle shadows
✓ Source references
✓ Asymmetric composition
```

Dengan begitu chatbot terasa seperti **produk digital budaya**, bukan template chatbot AI.

---

# 23. Design Tokens

Gunakan token berikut sebagai starting point:

```css
/* Layout */
--sidebar-width: 230px;
--content-width: 780px;
--radius-sm: 10px;
--radius-md: 16px;
--radius-lg: 22px;

/* Spacing */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;

/* Motion */
--transition-fast: 180ms ease;
--transition-normal: 280ms ease;
```

---

# 24. Final Design Direction

**Prioritas redesign:**

1. Kurangi kesan layar kosong.
2. Jadikan chatbot sebagai centerpiece.
3. Tambahkan sidebar sebagai guide/context navigation.
4. Masukkan elemen visual Bali secara halus.
5. Buat suggested question lebih informatif dan interaktif.
6. Tambahkan source card untuk memperkuat kredibilitas.
7. Gunakan typography editorial agar desain terasa premium.
8. Pertahankan warna ivory + navy + gold sebagai identitas utama.
9. Pastikan seluruh dekorasi tetap subtle sehingga usability tidak terganggu.

## Hasil yang dituju

> **Bukan sekadar chatbot yang memiliki ornamen Bali, tetapi sebuah digital cultural guide yang kebetulan menggunakan bentuk chatbot sebagai interface utamanya.**

Desain ini dapat diimplementasikan tanpa mengubah logic chatbot yang sudah ada. Fokus perubahan berada pada **layout, component hierarchy, styling, interaction state, dan visual identity**.
