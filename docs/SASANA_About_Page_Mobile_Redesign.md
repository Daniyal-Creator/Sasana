# SASANA About Page — Mobile-Only Redesign

> **Scope:** redesign ini hanya diterapkan pada mobile viewport (`max-width: 767px`). Desktop dan tablet tetap menggunakan layout sebelumnya.

## 1. Konsep Baru

Gunakan konsep **Pocket Cultural Guide**.

Tujuannya bukan membuat versi desktop yang diperkecil, tetapi membuat mobile terasa seperti **digital guidebook yang editorial, hidup, dan ringan**.

### Karakter visual

- Editorial
- Cultural
- Warm
- Premium
- Minimal tetapi tidak kosong
- Lebih banyak whitespace, typography, divider, dan decorative numbers
- Card hanya digunakan ketika memiliki fungsi interaktif

### Hindari

```text
Card
Card
Card
Card
Card
```

Gunakan:

```text
Hero
↓
Story
↓
Horizontal Principles
↓
Official Source
↓
Privacy Strip
↓
Team List
↓
Closing
```

---

# 2. Mobile Navigation

Tambahkan section navigation yang sticky di bawah navbar utama.

```text
┌────────────────────────────────────────────┐
│ Tentang   Prinsip   Sumber   Tim       →  │
└────────────────────────────────────────────┘
```

### Behavior

- `position: sticky`
- `top: navbar-height`
- horizontal scroll
- active item memakai underline gold
- background ivory semi-opaque
- border-bottom tipis

Jangan gunakan pill besar untuk setiap menu.

---

# 3. Hero — Dramatic Editorial Opening

Jadikan hero mobile sebagai visual anchor utama.

```text
                ✦

           TENTANG SASANA

           Memahami Bali
           dengan rasa
           hormat.

     SASANA adalah panduan digital
     untuk memahami adat, etika,
     dan ruang sakral Bali.

           ─────────────
           SASANA / 01
```

### Layout

Heading besar, description pendek, kemudian metadata kecil.

Gunakan dekorasi line-art sangat tipis di belakang heading:
- topographic lines,
- bentuk bunga kamboja,
- simbol matahari,
- atau outline arsitektur Bali.

Opacity sekitar `4–8%`.

### CSS

```css
@media (max-width: 767px) {
  .about-hero {
    padding: 54px 20px 42px;
    min-height: auto;
    position: relative;
    overflow: hidden;
  }

  .about-hero h1 {
    font-size: clamp(44px, 13vw, 58px);
    line-height: .95;
    letter-spacing: -.045em;
    max-width: 330px;
  }
}
```

Accent gold hanya pada kata:

> **hormat.**

Jangan menggunakan foto hero besar karena akan membuat halaman terlalu tinggi.

---

# 4. Story — Editorial, Bukan Card

Section cerita menggunakan composition seperti majalah.

```text
01
MENGAPA SASANA

Menjembatani wisatawan
dengan budaya Bali.

SASANA hadir untuk membantu wisatawan
memahami tata krama dan nilai budaya
sebelum berinteraksi dengan ruang
dan masyarakat setempat.

        ┌────────────────┐
        │ CULTURAL GUIDE │
        └────────────────┘

“Edukasi sebelum pelanggaran.”
```

### Layout

- nomor `01` besar tetapi tipis
- heading serif
- body maksimal 4–5 baris per blok
- badge kecil sedikit overlap
- quote besar sebagai closing element

Badge:

```css
.story-badge {
  display: inline-flex;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 999px;
  transform: rotate(-2deg);
  margin-left: 18px;
}
```

Tidak perlu container card.

---

# 5. Principles — Horizontal Snap Slider

Ini perubahan utama untuk mengatasi page yang terlalu panjang.

Jangan menampilkan 3 prinsip secara vertikal.

Gunakan horizontal snap slider:

```text
PRINSIP SASANA

Yang menjadi dasar cara SASANA bekerja.

┌─────────────────────────────────┐
│ 01                              │
│                                 │
│ Penghormatan                    │
│ Ruang Suci                      │
│                                 │
│ Setiap ruang sakral memiliki    │
│ konteks dan aturan yang perlu   │
│ dipahami sebelum berkunjung.    │
│                                 │
└─────────────────────────────────┘

01 ━━━━━━ ○ ○

← geser untuk prinsip berikutnya
```

### CSS

```css
@media (max-width: 767px) {
  .principle-track {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 4px 20px 10px;
    margin-inline: -20px;
    scrollbar-width: none;
  }

  .principle-track::-webkit-scrollbar {
    display: none;
  }

  .principle-item {
    flex: 0 0 calc(100vw - 54px);
    scroll-snap-align: start;
    min-height: 270px;
    padding: 25px 23px;
    border: 1px solid var(--border);
    border-radius: 20px 6px 20px 6px;
    background: var(--surface);
  }
}
```

### Kenapa ini lebih cocok

Satu layar hanya menampilkan satu prinsip. Dua prinsip lainnya tersedia melalui swipe.

Jadi:

```text
Desktop:
[01] [02] [03]

Mobile:
[01] → swipe → [02] → swipe → [03]
```

Card di sini tetap diperbolehkan karena memiliki fungsi **interaction**, bukan sekadar dekorasi.

Progress indicator:

```text
01 ━━━━━━ ○ ○
```

---

# 6. Official Source — Editorial Block

Jangan membuat source seperti card dashboard.

Gunakan layout:

```text
SUMBER RESMI

07

DASAR HUKUM &
ATURAN RESMI

Surat Edaran Gubernur Bali
No. 7 Tahun 2025

Tata krama dan pedoman perilaku
bagi wisatawan asing di Bali.

[Baca sumber resmi ↗]
```

Angka `07` menjadi decorative anchor.

```css
.source-number {
  position: absolute;
  top: 4px;
  right: 10px;
  font: 120px/1 serif;
  opacity: .05;
}
```

Gunakan background sedikit berbeda, tetapi tanpa shadow berat.

---

# 7. Privacy — Trust Strip

Privacy dibuat pendek dan horizontal.

```text
◉  PRIVASI FOTO

Diproses untuk analisis sesuai kebutuhan sistem.
Lihat kebijakan privasi →
```

Gunakan SVG lock/icon, bukan emoji.

```css
.privacy-strip {
  min-height: 104px;
  padding: 18px 20px;
  border-block: 1px solid var(--border);
  background: var(--surface-muted);
}
```

Privacy harus terasa seperti **trust signal**, bukan content card.

> Wording harus sesuai dengan implementasi backend yang sebenarnya. Hindari klaim seperti “langsung dihapus” bila sistem belum menjaminnya.

---

# 8. Team — Identity List

Hapus tiga profile card.

Gunakan list yang compact:

```text
TIM PENGEMBANG

Dibangun oleh orang-orang
di balik SASANA.

DH   Daniyal Hafidz Prasetyo
     Lead & AI Integration
     Gemini Vision · Architecture

────────────────────────────

MC   Manu Caimpiyana
     Frontend & UI/UX
     Design System · Interface

────────────────────────────

RH   Rafli Halomoan
     Knowledge Base & QA
     Customs KB · Verification
```

Initial circle:

```text
(DH)
```

Background muted blue dan text blue.

Optional micro-marquee:

```text
AI INTEGRATION · UI/UX · KNOWLEDGE BASE · VERIFICATION ·
```

Gunakan animasi sangat lambat (`18–24s`) dan hanya sebagai detail visual.

---

# 9. Closing — Poster-like Ending

Closing jangan hanya berupa text center biasa.

Gunakan:

```text
SASANA

Datang dengan rasa
ingin tahu.

Pulang dengan
rasa hormat.

                 ✦

SMK Wikrama Bogor
SASANA Group

v1.0 MVP
```

Gunakan background deep charcoal:

```css
.closing-section {
  background: var(--text);
  color: var(--bg);
  padding: 72px 20px;
}
```

Kalimat pertama memakai serif besar.

Kalimat kedua memakai sans-serif medium atau italic serif agar terjadi contrast.

---

# 10. Background Rhythm

Berikan perubahan tone antar-section agar halaman tidak terasa flat.

```css
:root {
  --mobile-bg: #F7F3EB;
  --mobile-soft: #F0EADF;
  --mobile-strip: #ECE5D9;
  --mobile-dark: #29251F;
}
```

Urutan:

```text
Hero       #F7F3EB
Story      #F7F3EB
Principles #F0EADF
Source     #F7F3EB
Privacy    #ECE5D9
Team       #F7F3EB
Closing    #29251F
```

Tidak perlu menggunakan pattern di semua section. Cukup hero dan source.

---

# 11. Decorative System

Batasi dekorasi pada 3 elemen:

### Gold Star

```text
✦
```

Gunakan SVG.

### Editorial Number

```text
01
02
03
07
```

Ukuran besar dan opacity rendah.

### Fine Divider

```text
────────────────────
```

Dengan tiga elemen ini, halaman terasa lebih designed tanpa menjadi ramai.

---

# 12. Motion

Animasi harus halus.

### Section reveal

```css
.section {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity .5s ease,
    transform .5s ease;
}

.section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Principles

Gunakan native horizontal scroll + `scroll-snap`.

### Team

Initial circle dapat memakai:

```text
scale(.96) → scale(1)
```

Hindari parallax dan animation besar.

---

# 13. Mobile Spacing

Jangan membawa spacing desktop ke mobile secara mentah.

Gunakan rhythm:

```text
Hero        48px
↓
Story       52px
↓
Principles  48px
↓
Source      42px
↓
Privacy     36px
↓
Team        52px
↓
Closing     64px
```

Target tinggi:

```text
Hero         400–460px
Story        340–400px
Principles   380–450px
Source       270–320px
Privacy      100–110px
Team         320–380px
Closing      280–330px
```

---

# 14. Final Mobile CSS Override

```css
@media (max-width: 767px) {

  body {
    overflow-x: hidden;
  }

  .about-page {
    width: 100%;
  }

  .section-inner {
    padding-inline: 20px;
  }

  /* HERO */
  .about-hero {
    padding: 54px 20px 42px;
    min-height: auto;
  }

  .about-hero h1 {
    font-size: clamp(44px, 13vw, 58px);
    line-height: .95;
    letter-spacing: -.045em;
  }

  /* STORY */
  .story-section {
    padding: 48px 20px 52px;
  }

  /* PRINCIPLES */
  .principle-track {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding: 4px 20px 10px;
    margin-inline: -20px;
    scrollbar-width: none;
  }

  .principle-item {
    flex: 0 0 calc(100vw - 54px);
    scroll-snap-align: start;
    min-height: 270px;
    padding: 25px 23px;
    border-radius: 20px 6px 20px 6px;
  }

  /* SOURCE */
  .source-section {
    margin-inline: 20px;
    padding: 28px 22px;
    position: relative;
    overflow: hidden;
  }

  /* PRIVACY */
  .privacy-strip {
    margin-inline: 20px;
    min-height: 104px;
    padding: 18px 20px;
  }

  /* TEAM */
  .team-list {
    display: flex;
    flex-direction: column;
  }

  .team-member {
    padding: 18px 0;
    border-bottom: 1px solid var(--border);
  }

  /* CLOSING */
  .closing-section {
    padding: 72px 20px;
  }
}
```

---

# 15. Final Mobile Wireframe

```text
┌───────────────────────────────────┐
│ SASANA                       ☰    │
├───────────────────────────────────┤
│ Tentang  Prinsip  Sumber  Tim →  │
├───────────────────────────────────┤
│                                   │
│              ✦                    │
│                                   │
│        TENTANG SASANA             │
│                                   │
│        Memahami Bali              │
│        dengan rasa                │
│        hormat.                    │
│                                   │
│        Panduan digital untuk      │
│        memahami adat, etika,      │
│        dan ruang sakral Bali.     │
│                                   │
│        ───────── SASANA / 01      │
│                                   │
├───────────────────────────────────┤
│                                   │
│ 01 · MENGAPA SASANA              │
│                                   │
│ Menjembatani wisatawan             │
│ dengan budaya Bali.               │
│                                   │
│ Text pendek...                    │
│                                   │
│        [ CULTURAL GUIDE ]          │
│                                   │
│ “Edukasi sebelum pelanggaran.”    │
│                                   │
├───────────────────────────────────┤
│                                   │
│ 02 · PRINSIP                      │
│ Yang menjadi dasar SASANA.        │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ 01                            │ │
│ │ Penghormatan                  │ │
│ │ Ruang Suci                    │ │
│ │                               │ │
│ │ Deskripsi singkat...          │ │
│ └───────────────────────────────┘ │
│                                   │
│ 01 ━━━━━━ ○ ○                     │
│ ← geser                           │
│                                   │
├───────────────────────────────────┤
│                                   │
│ SUMBER RESMI                  07 │
│                                   │
│ DASAR HUKUM &                    │
│ ATURAN RESMI                     │
│                                   │
│ SE Gubernur Bali No. 7/2025      │
│                                   │
│ [ Baca sumber ↗ ]                 │
│                                   │
├───────────────────────────────────┤
│                                   │
│ ◉ PRIVASI FOTO                    │
│ Diproses untuk analisis. →        │
│                                   │
├───────────────────────────────────┤
│                                   │
│ TIM PENGEMBANG                    │
│ Dibangun oleh orang-orang         │
│ di balik SASANA.                  │
│                                   │
│ DH  Daniyal Hafidz Prasetyo       │
│     Lead & AI Integration         │
│ ─────────────────────────────     │
│ MC  Manu Caimpiyana               │
│     Frontend & UI/UX              │
│ ─────────────────────────────     │
│ RH  Rafli Halomoan                │
│     Knowledge Base & QA            │
│                                   │
├───────────────────────────────────┤
│                                   │
│             SASANA                │
│                                   │
│     Datang dengan rasa            │
│     ingin tahu.                   │
│                                   │
│     Pulang dengan                 │
│     rasa hormat.                 │
│                                   │
│     SMK Wikrama Bogor             │
│     SASANA Group · v1.0 MVP       │
│                                   │
└───────────────────────────────────┘
```

---

# 16. Target Akhir

Mobile About Page harus terasa:

**Editorial × Cultural × Premium × Alive**

bukan:

**Desktop versi kecil × Card stacking × Long scroll**

Perubahan yang paling penting adalah:

1. **Hero typography lebih besar**
2. **Story menggunakan editorial composition**
3. **Principles menjadi horizontal swipe**
4. **Source menjadi editorial feature**
5. **Privacy menjadi trust strip**
6. **Team menjadi list**
7. **Closing menjadi poster-like ending**
8. **Background berganti tone antar-section**

Hasilnya lebih dinamis secara visual, tetapi tetap menjaga halaman agar tidak menjadi terlalu panjang.
