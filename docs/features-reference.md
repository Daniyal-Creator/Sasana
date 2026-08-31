# Redesign Section "What SASANA does" — Interactive Artistic Feature Section

## 1. Tujuan Redesign

Section **"What SASANA does"** pada desain saat ini menggunakan tiga card besar yang tersusun vertikal.

Masalah utama:

- Landing page sudah memiliki terlalu banyak card.
- Struktur section menjadi monoton karena mengulang pola card.
- Area kanan terlalu penuh secara visual.
- Fitur terlihat seperti daftar informasi, bukan pengalaman interaktif.
- Pengguna langsung melihat semua detail sehingga hierarchy visual kurang kuat.

### Arah redesign

Section ini sebaiknya **tidak lagi menggunakan tiga card yang selalu terlihat**.

Sebagai gantinya, gunakan:

> **Elemen artistik/interaktif sebagai representasi setiap fitur.**

Detail fitur baru muncul **setelah elemen tersebut diklik**.

Dengan demikian, section terasa seperti sebuah **interactive feature showcase**, bukan kumpulan card.

---

# 2. Konsep Utama: Interactive Feature Constellation

Konsep yang paling direkomendasikan adalah **"Interactive Feature Constellation"**.

Tiga fitur SASANA direpresentasikan sebagai tiga elemen artistik yang mengelilingi satu visual utama.

```text
                 ✦ SITUATION CHECK
                    [ Camera ]
                                                                              ●
                          /
                         /
        [ SASANA ]  ──── ●
          CENTER                                                               ●
                    [ Map / Zone ]
```

Alternatif visual yang lebih organik:

```text
                    ◌ Situation Check
                       📷

                 ┌─────────────┐
                 │   SASANA    │
                 │   FEATURES  │
                 └─────────────┘

        💬 Assistant                 📍 Zones
```

Elemen tidak harus terlihat seperti lingkaran UI biasa. Gunakan bentuk yang lebih artistik seperti:

- line-art illustration
- abstract blob
- ornament Bali yang sangat subtle
- sketsa kompas
- floral/lotus outline
- sacred geometric pattern
- organic circle
- hand-drawn marker
- thin decorative line

Tujuannya agar section terasa lebih **editorial, artistic, dan tourism-oriented**.

---

# 3. Layout Baru

## Desktop

Gunakan layout **2-column**, tetapi jangan membagi area menjadi kumpulan card.

### Kolom kiri

Berisi:

```text
CAPABILITIES & PURPOSE

What SASANA does

Three tools to help you visit
Bali’s sacred sites with confidence.

[Official Circular Information]

Read full philosophy and mission →
```

Kolom kiri tetap relatif sederhana karena berfungsi sebagai **context / introduction**.

### Kolom kanan

Ganti tiga card menjadi satu area interaktif.

```text
┌────────────────────────────────────────────────┐
│                                                │
│             ✦ Situation Check                  │
│                  ◯                             │
│                  │                             │
│     ◯ Assistant ── ◎ SASANA ── ◯ Zones        │
│                                                │
│           Select a feature to explore          │
│                                                │
└────────────────────────────────────────────────┘
```

Area kanan menjadi **visual centerpiece** dari section.

---

# 4. Tiga Elemen Artistik

Setiap fitur memiliki visual identity sendiri.

## A. Situation Check

### Representasi visual

Gunakan:

- camera outline
- eye symbol
- small sparkle
- framing brackets
- circular scan effect

Contoh:

```text
          ✦
       ╭─────╮
       │  ◉  │
       │ 📷  │
       ╰─────╯
     SITUATION
       CHECK
```

Tema visual:

> **Vision / Recognition / Awareness**

Warna accent dapat menggunakan blue yang sudah ada pada UI.

---

## B. Assistant

### Representasi visual

Gunakan:

- speech bubble
- sound wave
- subtle conversational lines
- small orbiting dots

Contoh:

```text
       ·  ·  ·
     ╭────────╮
     │   ~    │
     │  ASK   │
     ╰────────╯
       ASSISTANT
```

Tema visual:

> **Conversation / Guidance / Knowledge**

Elemen ini dapat menggunakan bentuk bubble yang sedikit organik agar tidak terasa seperti icon button biasa.

---

## C. Zones & Notices

### Representasi visual

Gunakan:

- map pin
- compass
- concentric location rings
- simplified map path
- geographic contour line

Contoh:

```text
          ◎
        ╱   ╲
      ╱  📍   ╲
        ────
        ZONES
```

Tema visual:

> **Location / Movement / Awareness**

Bentuk concentric rings dapat dibuat seperti radar atau peta topografi.

---

# 5. Jangan Menampilkan Card Sebelum User Memilih

Ini adalah perubahan paling penting.

Keadaan awal:

```text
                  ✦
             Situation Check

         💬                 📍

                 SASANA

       Select a feature to explore
```

Tidak ada tiga card besar.

Begitu user memilih salah satu:

```text
                  ✦
             Situation Check

         💬                 📍

                 SASANA

        ┌───────────────────────┐
        │ AI VISION             │
        │ Situation Check       │
        │                       │
        │ Photograph your outfit│
        │ or surroundings and   │
        │ check the customs...  │
        │                       │
        │ Explore →             │
        └───────────────────────┘
```

Detail dapat muncul sebagai **satu shared detail panel**, bukan tiga card sekaligus.

---

# 6. Detail Panel yang Dipakai Bersama

Daripada membuat tiga card berbeda, gunakan **satu component detail** yang kontennya berubah berdasarkan elemen yang dipilih.

State:

```text
selectedFeature = "situation-check"
```

Kemudian isi panel berubah.

Contoh:

```text
                    FEATURE

              ┌─────────────────┐
              │ AI VISION       │
              │                 │
              │ Situation Check │
              │                 │
              │ Photograph your │
              │ outfit or your  │
              │ surroundings... │
              │                 │
              │ Explore →       │
              └─────────────────┘
```

Saat user memilih Assistant:

```text
              ┌─────────────────┐
              │ OFFICIAL        │
              │ CIRCULAR        │
              │                 │
              │ Assistant       │
              │                 │
              │ Ask questions   │
              │ about Balinese  │
              │ customs...      │
              │                 │
              │ Explore →       │
              └─────────────────┘
```

Dengan cara ini hanya ada **satu detail container**.

---

# 7. Interaction Flow

Flow interaksinya:

```text
LANDING PAGE
     ↓
What SASANA does
     ↓
Visual feature elements
     ↓
User memilih salah satu
     ↓
Selected element mendapat highlight
     ↓
Detail panel muncul
     ↓
User membaca penjelasan
     ↓
User memilih "Explore"
     ↓
Masuk ke halaman/tool fitur
```

### State visual

#### Default

```text
○ Situation Check
○ Assistant
○ Zones
```

#### Hover

```text
◉ Situation Check
```

Tambahkan:

- slight scale
- glow/shadow sangat halus
- decorative line muncul
- label menjadi lebih jelas

#### Selected

```text
◉ Situation Check
      ↓
[ Detail Panel ]
```

Gunakan perubahan yang halus agar terasa polished.

---

# 8. Animasi

Gunakan animasi yang subtle.

Jangan menggunakan animasi yang terlalu banyak karena website membawa tema budaya, wisata, dan informasi.

### Hover

```css
.feature-item {
    transition:
        transform 0.3s ease,
        opacity 0.3s ease;
}

.feature-item:hover {
    transform: translateY(-5px) scale(1.02);
}
```

### Selected

Detail panel dapat muncul menggunakan:

```text
opacity
transform
scale
```

Contoh konsep:

```text
opacity: 0 → 1
translateY: 12px → 0
```

Durasi sekitar:

```text
300–450ms
```

Gunakan easing yang lembut.

---

# 9. Artistic Direction

Elemen artistik jangan dibuat seperti tiga tombol icon biasa.

Hindari:

```text
[ 📷 ]
[ 💬 ]
[ 📍 ]
```

Karena akan tetap terasa seperti dashboard.

Lebih baik:

```text
        ✦
      ╭───╮
      │ ◉ │
      ╰───╯
        │
  Situation Check
```

atau:

```text
        ╭────────╮
     ╱  │  📷    │  ╲
   ╱    ╰────────╯    ╲
        Situation
           Check
```

Gunakan **ornamental geometry** dan **organic composition** untuk membedakan section ini dari card section lainnya.

---

# 10. Integrasi dengan Tema Bali

Karena project berhubungan dengan Bali dan sacred sites, desain dapat mengambil inspirasi visual dari budaya Bali secara sangat halus.

Gunakan elemen seperti:

- pola geometris sederhana
- circular ornament
- lotus-inspired line art
- contour map
- decorative dots
- thin golden lines
- subtle sacred geometry

### Penting

Jangan memenuhi section dengan motif tradisional.

Gunakan sebagai:

> **micro-decoration**

bukan sebagai background utama.

Tujuannya adalah memberikan identitas Bali tanpa membuat UI terlihat terlalu dekoratif atau ramai.

---

# 11. Color Direction

Pertahankan visual identity dari section dan landing page yang sudah ada.

Recommended palette:

| Elemen | Warna |
|---|---|
| Background | `#F5F0E7` |
| Main Card/Panel | `#FFFCF8` |
| Heading | `#14283B` |
| Gold Accent | `#B78A32` |
| Blue Accent | `#15579A` |
| Soft Badge | `#E8F0F8` |
| Border | `#E4DACB` |

Gold dapat digunakan untuk decorative elements.

Blue digunakan untuk:

- active state
- CTA
- selected element
- link

Dengan demikian warna tetap konsisten dengan section lain.

---

# 12. Struktur Content

Gunakan content yang sama, tetapi ubah cara penyajiannya.

## Intro

**CAPABILITIES & PURPOSE**

**What SASANA does**

> Three tools to help you visit Bali’s sacred sites with confidence.

## Official Information

Pertahankan informasi:

**BALI GOVERNOR CIRCULAR NO. 7/2025**

> All guidance is grounded in official provincial rules to protect sacred temple grounds.

Kemudian:

**Read full philosophy and mission →**

Tetapi informasi ini tidak perlu menjadi card besar.

Bisa dibuat sebagai **official notice strip** atau **text block dengan ornament shield**.

Contoh:

```text
╭────────────────────────────────────╮
│  ◇  BALI GOVERNOR CIRCULAR NO. 7/2025
│                                     │
│  All guidance is grounded in        │
│  official provincial rules...       │
╰────────────────────────────────────╯
```

---

# 13. Rancangan Final Desktop

Rekomendasi final:

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  CAPABILITIES & PURPOSE                                            │
│                                                                    │
│  What SASANA does                         ✦ Situation Check         │
│                                           │                         │
│  Three tools to help you visit            │      ◌                 │
│  Bali’s sacred sites with confidence.     │                         │
│                                                                    │
│  ◇ BALI GOVERNOR CIRCULAR NO. 7/2025        ◎ SASANA               │
│  Official provincial guidance                /       \              │
│                                      ◌ Assistant   ◌ Zones          │
│                                                                    │
│  Read full philosophy and mission →        Select a feature        │
│                                           to explore               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Setelah user memilih:

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  What SASANA does                         ✦ Situation Check         │
│                                                                    │
│                                           ◎ Selected                │
│                                      ┌─────────────────────────┐   │
│                                      │ AI VISION               │   │
│                                      │                         │   │
│                                      │ Situation Check         │   │
│                                      │                         │   │
│                                      │ Photograph your outfit  │   │
│                                      │ or surroundings and     │   │
│                                      │ learn whether they      │   │
│                                      │ match the customs...    │   │
│                                      │                         │   │
│                                      │ Explore →               │   │
│                                      └─────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

# 14. Mobile Layout

Desktop menggunakan constellation, tetapi mobile harus dibuat lebih sederhana.

```text
CAPABILITIES & PURPOSE

What SASANA does

Three tools to help you visit
Bali’s sacred sites with confidence.


          ✦
      Situation
        Check


      💬 Assistant


       📍 Zones


    ┌─────────────────────┐
    │ Selected Feature    │
    │                     │
    │ Situation Check     │
    │ Description...      │
    │                     │
    │ Explore →           │
    └─────────────────────┘
```

Alternatif yang lebih optimal untuk mobile adalah horizontal selector:

```text
←   ✦   💬   📍   →
   Active
```

Kemudian detail feature tampil di bawahnya.

Ini menghemat vertical space.

---

# 15. Accessibility & UX

Walaupun elemen dibuat artistik, jangan mengorbankan usability.

Setiap feature element harus tetap memiliki:

- text label
- accessible button semantics
- clear hover state
- clear selected state
- keyboard focus state
- sufficient contrast

Jangan membuat user harus menebak fungsi icon.

Contoh:

```text
[Visual]
Situation Check
```

lebih baik daripada:

```text
[📷]
```

tanpa label.

---

# 16. Komponen yang Dibutuhkan

Struktur komponen yang disarankan:

```text
FeaturesSection
│
├── FeaturesIntro
│   ├── Eyebrow
│   ├── Heading
│   ├── Description
│   ├── OfficialNotice
│   └── MissionLink
│
└── InteractiveFeatures
    ├── FeatureCanvas
    │   ├── FeatureItem
    │   ├── FeatureItem
    │   └── FeatureItem
    │
    └── FeatureDetailPanel
```

Data fitur dapat dibuat seperti:

```js
const features = [
    {
        id: "situation-check",
        label: "Situation Check",
        category: "AI Vision",
        icon: "camera",
        description: "...",
        action: "Check Outfit & Surroundings"
    },
    {
        id: "assistant",
        label: "Assistant",
        category: "Official Circular",
        icon: "message",
        description: "...",
        action: "Ask Custom Assistant"
    },
    {
        id: "zones",
        label: "Zones and Notices",
        category: "Live Geofencing",
        icon: "location",
        description: "...",
        action: "Explore Sacred Sites"
    }
];
```

Kemudian gunakan satu state:

```js
const [activeFeature, setActiveFeature] = useState(null);
```

Dengan `activeFeature === null`, hanya elemen artistik yang terlihat.

Dengan `activeFeature !== null`, detail panel ditampilkan.

---

# 17. Keuntungan Dibanding Desain Lama

| Desain Lama | Desain Baru |
|---|---|
| 3 card besar | 3 visual feature elements |
| Semua informasi langsung terlihat | Informasi muncul sesuai interaksi |
| Banyak card di landing page | Mengurangi penggunaan card |
| Terlihat seperti dashboard | Terasa seperti interactive showcase |
| Visual repetitif | Lebih artistik |
| Informasi terlalu padat | Hierarchy lebih jelas |
| Kurang memorable | Lebih memorable |
| Banyak ruang dipakai oleh card | Ruang digunakan sebagai visual composition |

---

# 18. Prinsip Utama Implementasi

Redesign ini harus mengikuti prinsip:

> **"Show the experience first, reveal the information second."**

Jangan langsung menampilkan penjelasan panjang.

Awalnya user melihat:

```text
Visual
↓
Feature name
↓
Curiosity
↓
Click
↓
Information
```

Bukan:

```text
Card
↓
Card
↓
Card
```

---

# 19. Hasil Akhir yang Ditargetkan

Section ini harus terasa seperti **interactive editorial section** yang menjadi salah satu visual highlight landing page.

Karakter yang ingin dicapai:

- Clean
- Premium
- Artistic
- Interactive
- Modern
- Tourism-oriented
- Subtle Bali identity
- Tidak terlalu banyak card
- Tidak terasa seperti dashboard AI
- Tetap mudah digunakan

### Konsep final

```text
                  ARTISTIC FEATURE
                         ↓
              ┌───────────────────┐
              │                   │
       ✦      │      SASANA       │      📍
   Situation  │                   │     Zones
    Check     │     FEATURES      │
              │                   │
              └───────────────────┘
                         ↑
                      💬
                   Assistant

                         ↓
                  User clicks one
                         ↓
                Shared detail panel
                         ↓
                    Explore →
```

## Kesimpulan

Daripada menambahkan lebih banyak card ke landing page, section **"What SASANA does"** sebaiknya menjadi **interactive feature showcase**.

Tiga fitur utama diwakili oleh elemen artistik yang berbeda. Elemen tersebut menjadi visual focal point dan dapat dipilih oleh user. Setelah dipilih, hanya **satu shared detail panel** yang muncul untuk menjelaskan fitur.

Pendekatan ini mempertahankan informasi yang dibutuhkan, mengurangi repetisi card, menghemat ruang visual, serta membuat landing page SASANA terasa lebih unik dan memiliki identitas yang lebih kuat.
