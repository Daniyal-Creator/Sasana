# SASANA — About Page Redesign

## 01. Design Direction

### Konsep utama
Gunakan pendekatan **Editorial / Cultural Guide**: halaman About terasa seperti halaman dokumentasi resmi tentang SASANA, bukan dashboard yang dipenuhi card.

Tujuan desain:
- Mengurangi jumlah card secara signifikan.
- Membuat halaman terasa lebih panjang secara visual, tetapi **tidak terlalu panjang secara vertikal di mobile**.
- Menggunakan whitespace, typography, divider, dan numbered sections sebagai elemen utama.
- Mempertahankan identitas SASANA: **sakral, tenang, edukatif, modern, dan terpercaya**.
- Informasi penting tetap mudah dipindai tanpa membuat semua konten berada di dalam kotak.

### Visual language
- Background: warm ivory / off-white.
- Primary text: deep charcoal.
- Accent: muted gold.
- Secondary accent: restrained Balinese blue.
- Border: warm beige, sangat tipis.
- Radius: kecil–sedang, bukan rounded-card berlebihan.
- Shadow: gunakan sangat minimal; idealnya hanya untuk elemen interaktif.
- Typography:
  - Display/heading: serif elegan seperti `DM Serif Display`, `Playfair Display`, atau font serif yang sudah digunakan project.
  - Body/UI: sans-serif seperti `Inter`, `Manrope`, atau `DM Sans`.
- Gunakan motif dekoratif Bali/topographic secara sangat tipis sebagai background, bukan sebagai ornamen utama.

---

# 02. Information Architecture

Urutan halaman:

1. **Hero — Tentang SASANA**
2. **Our Story — Mengapa SASANA dibuat**
3. **What We Stand For — 3 prinsip utama**
4. **Official Foundation — Dasar hukum & sumber resmi**
5. **Privacy Promise — Jaminan privasi foto**
6. **The People Behind SASANA — Tim pengembang**
7. **Closing statement + version**

Struktur ini sengaja dibuat **7 section besar tanpa kumpulan card**.

---

# 03. Hero Section

### Layout desktop

```text
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  TENTANG SASANA                                               │
│                                                               │
│  Memahami Bali dengan                                         │
│  rasa hormat.                                                 │
│                                                               │
│  SASANA hadir sebagai panduan digital yang                     │
│  membantu wisatawan memahami adat, etika,                      │
│  dan ruang sakral Bali sebelum mereka berkunjung.              │
│                                                               │
│  ───────────────────────────────────────────────────────────   │
│  SASANA · CULTURAL GUIDE                         v1.0 MVP     │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Copy

**Eyebrow**
> TENTANG SASANA

**Headline**
> Memahami Bali dengan rasa hormat.

**Description**
> SASANA adalah panduan digital yang membantu wisatawan memahami adat, etika, dan ruang sakral Bali dengan informasi yang jelas, kontekstual, dan mudah dipahami.

**Meta**
> SASANA · Cultural Guide  
> Versi 1.0 MVP

### Visual treatment

Jangan menggunakan hero card.

Gunakan:
- whitespace besar,
- heading serif berukuran besar,
- satu decorative line,
- small gold symbol di tengah atau sisi kanan,
- subtle background pattern.

Desktop dapat menggunakan komposisi **55/45**:

```text
[TEXT 55%]                         [DECORATIVE 45%]

Tentang SASANA                     ◇
Memahami Bali                      ─────
dengan rasa hormat.                │
                                   │ subtle motif
Description...                     │ Bali/topographic
```

Mobile:

```text
TENTANG SASANA

Memahami Bali
dengan rasa hormat.

Description...

SASANA · CULTURAL GUIDE
v1.0 MVP
```

---

# 04. Our Story

## Judul

> Mengapa SASANA hadir

Gunakan layout editorial **2 kolom**, bukan card.

```text
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  01                                                          │
│  MENGAPA SASANA                                               │
│                                                               │
│  Menjembatani wisatawan                                       │
│  dengan budaya Bali.                                          │
│                                                               │
│                         SASANA lahir dari kebutuhan sederhana  │
│                         untuk membuat informasi mengenai adat  │
│                         Bali lebih mudah dipahami wisatawan.   │
│                                                               │
│                         Alih-alih hanya memberikan larangan,   │
│                         SASANA memberikan konteks sebelum      │
│                         seseorang memasuki ruang atau situasi  │
│                         yang memiliki nilai sakral.            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Isi

**Lead**
> Menjembatani wisatawan dengan budaya Bali.

**Body**
> SASANA hadir untuk membantu wisatawan memahami tata krama dan nilai budaya Bali sebelum berinteraksi dengan ruang dan masyarakat setempat.

> Pendekatannya bukan sekadar memberi tahu apa yang boleh dan tidak boleh dilakukan, tetapi menjelaskan konteks di baliknya agar setiap kunjungan dapat dilakukan dengan lebih sadar dan penuh penghormatan.

### Highlight quote

Di bawah body, gunakan satu statement besar:

> “Edukasi sebelum pelanggaran.”

Tidak perlu border card. Cukup gunakan typography besar + gold vertical line.

---

# 05. What We Stand For

## Judul

> Tiga prinsip yang menjadi dasar SASANA

Alih-alih tiga card seperti desain lama, gunakan **numbered editorial list**.

```text
01 ────────────────────────────────────────────────────────────

PENGHORMATAN RUANG SUCI

Setiap ruang sakral memiliki aturan dan konteksnya sendiri.
SASANA membantu wisatawan mengetahuinya sebelum berkunjung.


02 ────────────────────────────────────────────────────────────

EDUKASI SEBELUM PELANGGARAN

Informasi diberikan sebagai panduan preventif,
bukan sebagai teguran setelah pelanggaran terjadi.


03 ────────────────────────────────────────────────────────────

SUMBER YANG DAPAT DIPERCAYA

Panduan mengutamakan regulasi resmi dan sumber
terverifikasi agar informasi tidak sekadar berdasarkan asumsi.
```

### Interaction

Desktop:
- setiap item memiliki hover subtle,
- nomor berubah/beraksen gold,
- divider memanjang penuh.

Mobile:
- tetap satu kolom,
- padding vertical sekitar `28–36px`,
- jangan membuat setiap item menjadi card.

Hasilnya jauh lebih pendek daripada tiga card yang memiliki padding besar.

---

# 06. Official Foundation

Section ini menjadi **single feature block**, bukan card biasa.

```text
───────────────────────────────────────────────────────────────

SUMBER RESMI

Dasar hukum & aturan resmi

Surat Edaran Gubernur Bali
No. 7 Tahun 2025

Tata krama dan pedoman perilaku bagi wisatawan asing
di Bali.

[Baca sumber resmi ↗]

───────────────────────────────────────────────────────────────
```

### Visual

Gunakan background sedikit berbeda dari body:

`#F3EEE4`

Tetapi jangan gunakan shadow.

Tambahkan icon shield kecil di kiri atas.

### CTA

Button:

> Baca sumber resmi ↗

Style:
- transparent / ivory,
- border 1px,
- rounded `8px`,
- hover dengan accent gold.

---

# 07. Privacy Promise

Jangan gunakan card besar seperti desain lama.

Gunakan **horizontal trust strip**.

```text
┌───────────────────────────────────────────────────────────────┐
│  ◉  PRIVASI FOTO                                              │
│                                                               │
│     Foto yang Anda unggah dianalisis secara instan untuk       │
│     memberikan hasil. Foto tidak disimpan untuk penggunaan    │
│     di luar proses tersebut.                                  │
└───────────────────────────────────────────────────────────────┘
```

### Copy

**Title**
> Privasi foto

**Description**
> Foto yang Anda unggah diproses untuk memberikan hasil analisis. Foto tidak digunakan untuk tujuan di luar proses tersebut.

> Catatan: gunakan wording yang sesuai dengan implementasi backend sebenarnya. Jangan menyatakan “langsung dihapus” atau “tidak pernah disimpan” jika sistem belum benar-benar menjaminnya.

### Mobile

Susun:

```text
[icon]

PRIVASI FOTO

Foto yang Anda unggah diproses
untuk memberikan hasil analisis...
```

Tetap satu section pendek.

---

# 08. The People Behind SASANA

## Judul

> Dibangun oleh manusia di balik SASANA.

Subheading:

> Sebuah project yang dikembangkan dengan fokus pada AI, interface, dan pengetahuan budaya Bali.

Jangan gunakan tiga profile card.

Gunakan **compact team list**:

```text
───────────────────────────────────────────────────────────────

DH   Daniyal Hafidz Prasetyo
     Lead & AI Integration
     Gemini Vision · System Architecture

───────────────────────────────────────────────────────────────

MC   Manu Caimpiyana Bhimasena
     Frontend & UI/UX
     Design System · Interface Craft

───────────────────────────────────────────────────────────────

RH   Rafli Halomoan
     Knowledge Base & QA
     Balinese Customs KB · Verification

───────────────────────────────────────────────────────────────
```

### Desktop

Gunakan 3 kolom sederhana:

```text
DH                    MC                    RH
Daniyal...            Manu...               Rafli...
Lead & AI...          Frontend...            Knowledge...
```

Tetapi tanpa card background.

### Mobile

Gunakan list:

```text
DH
Daniyal Hafidz Prasetyo
Lead & AI Integration
Gemini Vision · System Architecture

────────────

MC
Manu Caimpiyana
Frontend & UI/UX
Design System · Interface Craft

────────────

RH
Rafli Halomoan
Knowledge Base & QA
Balinese Customs KB · Verification
```

Dengan demikian 3 anggota tetap mudah dipindai dan tidak menghasilkan tiga blok card tinggi.

---

# 09. Closing Section

Gunakan penutup yang lebih editorial.

```text
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    Datang dengan rasa ingin tahu.              │
│                    Tinggalkan tempat dengan rasa hormat.      │
│                                                               │
│                    — SASANA                                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Di bawahnya:

```text
SMK Wikrama Bogor · SASANA Group                    SASANA v1.0
```

Background bisa menggunakan warna warm ivory yang sedikit lebih gelap.

---

# 10. Recommended Page Flow

```text
┌─────────────────────────────────────────┐
│ HERO                                    │
│ Tentang SASANA                          │
│                                         │
│ Memahami Bali dengan rasa hormat.       │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ 01 · MENGAPA SASANA                     │
│                                         │
│ Editorial text + quote                  │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ 02 · PRINSIP                            │
│                                         │
│ 01 Penghormatan Ruang Suci              │
│ ─────────────────────────               │
│ 02 Edukasi Sebelum Pelanggaran          │
│ ─────────────────────────               │
│ 03 Sumber yang Dapat Dipercaya          │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ SUMBER RESMI                            │
│                                         │
│ Dasar Hukum & Aturan Resmi              │
│ SE Gubernur Bali No. 7 Tahun 2025       │
│ [Baca sumber resmi ↗]                   │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ PRIVASI FOTO                            │
│ Compact trust strip                     │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ 03 · TIM PENGEMBANG                     │
│                                         │
│ DH  Daniyal...                          │
│ MC  Manu...                              │
│ RH  Rafli...                             │
└─────────────────────────────────────────┘

                ↓

┌─────────────────────────────────────────┐
│ CLOSING                                 │
│                                         │
│ Datang dengan rasa ingin tahu.          │
│ Tinggalkan tempat dengan rasa hormat.  │
└─────────────────────────────────────────┘
```

---

# 11. Responsive Rules

## Desktop ≥ 1024px

- Max width: `1180–1240px`.
- Hero: `55/45`.
- Story: `40/60`.
- Principles: vertical editorial list.
- Team: 3-column inline layout.
- Section spacing: `96–140px`.
- Heading hero: `72–88px`.
- Body max-width: `620–700px`.

## Tablet 768–1023px

- Max width: `90%`.
- Hero tetap 2-column jika ruang mencukupi.
- Story menjadi 1 column.
- Team tetap 3 column tetapi lebih compact.
- Section spacing: `72–96px`.

## Mobile < 768px

Prioritas utama: **vertical efficiency**.

- Semua section menjadi 1 column.
- Hero heading: `44–52px`.
- Section heading: `34–40px`.
- Section spacing: `56–72px`.
- Hindari card stacking.
- Jangan membuat setiap informasi menjadi bordered container.
- Team menjadi compact list.
- Principles menjadi numbered list.
- Source section tetap satu block.
- Privacy menjadi horizontal/vertical trust strip pendek.
- Decorative elements diperkecil atau disembunyikan.

---

# 12. Spacing System

Gunakan spacing yang konsisten:

```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 40px;
--space-xl: 64px;
--space-2xl: 96px;
--space-3xl: 128px;
```

Mobile:

```css
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
```

---

# 13. Color System

```css
:root {
  --bg: #F7F3EB;
  --surface: #FCFAF6;
  --surface-muted: #F0EADF;

  --text: #29251F;
  --text-secondary: #665F55;
  --text-muted: #8A8175;

  --gold: #A87316;
  --gold-soft: #D8BD87;

  --blue: #1457A6;
  --border: #DED5C7;
}
```

### Usage

- `--bg` → overall page.
- `--surface` → source block / interactive surface.
- `--surface-muted` → privacy strip / subtle section background.
- `--text` → heading.
- `--text-secondary` → paragraph.
- `--gold` → eyebrow, numbers, small accents.
- `--blue` → links / informational accents.
- `--border` → dividers.

---

# 14. Typography Hierarchy

```text
Eyebrow
12–13px
uppercase
letter-spacing: 0.12em

Hero
72–88px desktop
44–52px mobile
serif

Section heading
42–52px desktop
34–40px mobile
serif

Body
17–18px desktop
16px mobile
line-height: 1.7

Small metadata
13–14px
```

Jangan terlalu banyak menggunakan bold. Biarkan **ukuran, whitespace, dan serif typography** menciptakan hierarchy.

---

# 15. Interaction Guidelines

Gunakan interaction yang subtle.

### Link

Default:
```text
Baca sumber resmi ↗
```

Hover:
- underline muncul,
- icon bergeser `2–3px`,
- warna berubah ke gold.

### Principle item

Hover:
- nomor menjadi accent,
- divider sedikit lebih gelap,
- title bergerak `2px` secara horizontal.

### Team

Hover:
- initials circle berubah dari muted blue menjadi gold/ivory,
- tidak perlu card lift atau shadow.

### Avoid

Jangan gunakan:
- excessive glassmorphism,
- gradient besar,
- floating card,
- excessive rounded corners,
- animated blobs,
- terlalu banyak icon,
- shadow tebal,
- setiap section dibungkus card.

---

# 16. Important Content Correction

Pada screenshot saat ini terdapat beberapa klaim yang sangat absolut, misalnya:

> “Foto tidak pernah disimpan, dicatat, atau digunakan untuk pelatihan model.”

dan:

> “Setiap panduan bersumber langsung dari Surat Edaran Gubernur No. 7/2025...”

Pastikan wording tersebut benar-benar sesuai dengan implementasi sistem dan sumber yang digunakan.

Untuk halaman About yang terlihat profesional, **credibility lebih penting daripada wording yang terdengar meyakinkan**.

Jika sistem memang menjamin penghapusan langsung, barulah gunakan klaim tersebut.

---

# 17. Final Design Principle

**Jangan mendesain About Page sebagai kumpulan informasi.**

Desain sebagai **cerita pendek tentang SASANA**:

```text
WHO WE ARE
     ↓
WHY WE EXIST
     ↓
WHAT WE BELIEVE
     ↓
WHAT WE USE AS FOUNDATION
     ↓
HOW WE PROTECT USERS
     ↓
WHO BUILT IT
     ↓
WHAT SASANA STANDS FOR
```

Hasil akhirnya harus terasa seperti:

> **“digital cultural guide yang serius dan terpercaya”**

bukan:

> **“landing page yang berisi banyak card.”**

Target visualnya adalah **editorial, calm, premium, cultural, dan informative**, dengan card hanya digunakan ketika benar-benar memiliki fungsi.
