# Redesign Section "How It Works" — Minimal Editorial Step Flow

## 1. Tujuan Redesign

Section **"How it works"** pada desain saat ini menggunakan tiga card besar untuk menjelaskan langkah penggunaan SASANA.

Masalahnya:

- Landing page sudah memiliki banyak card.
- Tiga card tambahan membuat visual website terasa repetitif.
- Informasi yang sebenarnya berbentuk **alur/sequence** lebih cocok ditampilkan sebagai flow daripada kumpulan card.
- Section dapat dibuat lebih ringan, editorial, dan mudah dipindai tanpa kehilangan informasi.

### Arah desain

Untuk section ini, gunakan konsep:

> **Editorial Step Flow / Guided Journey**

Bukan tiga card terpisah.

Informasi ditampilkan sebagai **satu alur horizontal yang terhubung**, dengan nomor besar, icon sederhana, garis penghubung, dan detail teks yang tetap lengkap.

Target visual:

```text
01 ─────────── 02 ─────────── 03

Ask              Get              Understand
your question    reliable         the culture
                 answers

Penjelasan       Penjelasan       Penjelasan
```

Section terasa seperti **proses perjalanan**, bukan kumpulan komponen card.

---

# 2. Struktur Section Baru

Struktur utama:

```text
STEP-BY-STEP

How it works

Three simple steps before stepping into sacred grounds.


01                    02                    03
│                     │                     │
Ask your              Get reliable         Understand
question              answers              the culture
│                     │                     │
Description           Description          Description
```

Tambahkan satu **horizontal progress line** yang melewati ketiga nomor.

Contoh:

```text
        01 ───────────── 02 ───────────── 03
         │                │                │
       ASK              ANSWER          UNDERSTAND
```

Garis tersebut hanya menjadi visual connector, bukan elemen interaktif wajib.

---

# 3. Jangan Gunakan Card untuk Setiap Step

Hindari:

```text
┌──────────┐   ┌──────────┐   ┌──────────┐
│    01    │   │    02    │   │    03    │
│          │   │          │   │          │
│  Title   │   │  Title   │   │  Title   │
│  Text    │   │  Text    │   │  Text    │
└──────────┘   └──────────┘   └──────────┘
```

Sebagai gantinya:

```text
01                     02                     03
●──────────────────────●──────────────────────●

ASK YOUR               GET RELIABLE           UNDERSTAND
QUESTION               ANSWERS                THE CULTURE

Type any queries...    Receive instant...     Learn the deeper...
```

Dengan demikian background section dapat tetap kosong/clean dan hierarchy dibangun menggunakan typography, spacing, garis, serta icon.

---

# 4. Layout yang Direkomendasikan

## Desktop

Gunakan satu container besar dengan tiga kolom.

```text
┌───────────────────────────────────────────────────────────────┐
│ STEP-BY-STEP                                                   │
│                                                               │
│ How it works                                                  │
│ Three simple steps before stepping into sacred grounds.       │
│                                                               │
│   01                         02                         03     │
│   ●─────────────────────────●──────────────────────────●      │
│                                                               │
│   Ask your question          Get reliable answers      Understand the culture
│                                                               │
│   Type any queries...        Receive instant...        Learn the deeper...
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Tidak perlu container/card individual di masing-masing step.

---

# 5. Visual Hierarchy

Setiap step sebaiknya memiliki:

1. **Number**
2. **Icon**
3. **Short title**
4. **Full explanation**
5. **Optional micro-label**

Contoh:

```text
01
[ chat icon ]

ASK YOUR QUESTION

Type any queries you have regarding
local customs, appropriate behavior,
or specific rules at your destination.
```

Namun number harus menjadi elemen visual utama.

Gunakan nomor besar dan ringan:

```text
01
```

bukan badge kecil seperti pada desain lama:

```text
[ 01 ]
```

Tujuannya agar section terasa lebih editorial.

---

# 6. Asisten Adat — RAG Chatbot

Untuk fitur **Asisten Adat**, jangan membuat tiga card lagi.

Gunakan satu blok sequence:

```text
ASISTEN ADAT

Official knowledge, made understandable.


01
ASK YOUR QUESTION

Type any queries you have regarding local customs,
appropriate behavior, or specific rules at your destination.


02
GET RELIABLE ANSWERS

Receive instant, accurate responses drawn directly
from official Balinese regulations and guidelines.


03
UNDERSTAND THE CULTURE

Learn the deeper philosophy behind the rules,
so you can appreciate and honor the culture fully.
```

### Visual treatment

Gunakan icon kecil:

```text
01   💬
```

atau line icon dari icon library.

Tidak perlu background card.

Tambahkan satu garis vertikal tipis yang menghubungkan 01 → 02 → 03 jika ingin menunjukkan sequence secara eksplisit.

Contoh:

```text
01  ── Ask your question
│
02  ── Get reliable answers
│
03  ── Understand the culture
```

---

# 7. Geofencing & Info Pura

Fitur kedua menggunakan struktur sequence yang sama.

```text
GEOFENCING & INFO PURA

Know where you are, what is happening,
and how to enter respectfully.


01
SELECT OR ARRIVE AT A SITE

Choose a destination in Explore Mode, or simply
walk into a recognized sacred area.


02
GET SMART NOTIFICATIONS

Receive automatic alerts about specific dress codes,
opening hours, and ongoing local ceremonies.


03
VISIT RESPECTFULLY

Time your visit perfectly and enter the sacred grounds
fully prepared without disrupting ongoing events.
```

Gunakan icon:

```text
01  location
02  notification
03  shield / temple
```

---

# 8. Cara Menempatkan Dua Fitur dalam Satu Section

Karena ada **dua fitur dengan masing-masing tiga langkah**, jangan menampilkan enam card.

Gunakan **dua horizontal journey rows**.

Contoh final:

```text
STEP-BY-STEP

How it works
Three simple steps before stepping into sacred grounds.


ASISTEN ADAT
Official knowledge, made understandable.

01 ─────────────── 02 ─────────────── 03
│                  │                  │
Ask your           Get reliable       Understand
question           answers            the culture

Type any...        Receive...         Learn...


────────────────────────────────────────────────────────


GEOFENCING & INFO PURA
Know where you are, what is happening,
and how to enter respectfully.

01 ─────────────── 02 ─────────────── 03
│                  │                  │
Select or          Get smart          Visit
arrive at a site   notifications      respectfully

Choose...          Receive...         Time...
```

Ini jauh lebih efisien dibanding enam card.

---

# 9. Alternatif Layout yang Lebih Visual

Untuk hasil yang lebih premium, gunakan dua **journey strips**.

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ ASISTEN ADAT                                                 │
│                                                              │
│ 01                 02                 03                     │
│ ●──────────────────●──────────────────●                     │
│                                                              │
│ Ask your          Get reliable       Understand              │
│ question          answers            the culture             │
│                                                              │
│ Description       Description        Description              │
│                                                              │
│                                                              │
│ GEOFENCING & INFO PURA                                       │
│                                                              │
│ 01                 02                 03                     │
│ ●──────────────────●──────────────────●                     │
│                                                              │
│ Select or          Get smart          Visit                   │
│ arrive at a site   notifications      respectfully            │
│                                                              │
│ Description       Description        Description              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Ini tetap merupakan satu section tanpa card per fitur.

---

# 10. Identitas Visual untuk Membedakan Dua Fitur

Walaupun layout sama, masing-masing fitur dapat memiliki visual identity kecil.

## Asisten Adat

Gunakan:

- speech bubble
- quotation mark
- small knowledge/orbit symbol
- subtle gold line

Tema:

> **Knowledge → Conversation → Understanding**

Sequence:

```text
💬 Ask
   ↓
✦ Answer
   ↓
◇ Understand
```

## Geofencing & Info Pura

Gunakan:

- map pin
- radar/rings
- notification bell
- shield/temple icon
- subtle blue line

Tema:

> **Location → Alert → Respect**

Sequence:

```text
◉ Locate
   ↓
⌁ Alert
   ↓
◇ Respect
```

---

# 11. Header Section

Pertahankan konsep typography dari desain lama.

```text
STEP-BY-STEP

How it works

Three simple steps before stepping into sacred grounds.
```

Namun tambahkan subtitle yang menghubungkan kedua flow:

> From asking questions to receiving location-aware guidance, SASANA helps you prepare before entering sacred spaces.

Subtitle tidak harus ditampilkan bila ingin section lebih minimal.

---

# 12. Official Circular Tidak Perlu Menjadi Card

Pada screenshot lama, informasi resmi juga ditampilkan dalam container.

Karena targetnya mengurangi card, ubah menjadi **inline information row**.

Contoh:

```text
◇ OFFICIAL GUIDANCE
Bali Governor Circular No. 7/2025
All guidance is grounded in official provincial rules.
```

Atau:

```text
◇ Bali Governor Circular No. 7/2025
  Official provincial guidance for sacred temple grounds.
```

Gunakan divider/garis tipis, bukan card.

---

# 13. Interaction yang Direkomendasikan

Section tidak perlu terlalu interaktif. Fokus utamanya adalah readability.

Interaction cukup:

### Hover pada Step

Saat hover:

- Number sedikit membesar.
- Icon berubah menjadi accent.
- Judul sedikit naik.
- Garis penghubung mendapatkan highlight tipis.

Contoh:

```css
.step {
    transition: transform 0.3s ease;
}

.step:hover {
    transform: translateY(-3px);
}
```

### Optional

Klik pada sebuah step dapat membawa user ke fitur terkait.

Contoh:

```text
Ask your question
        ↓
/assistant
```

dan:

```text
Select or arrive at a site
        ↓
/explore
```

Jika fungsi tersebut sudah ada di project.

---

# 14. Layout Mobile

Desktop:

```text
01 ───────── 02 ───────── 03
```

Mobile sebaiknya berubah menjadi vertical timeline.

```text
01
●
│
├── Ask your question
│   Type any queries...
│
02
●
│
├── Get reliable answers
│   Receive instant...
│
03
●
│
└── Understand the culture
    Learn the deeper...
```

Untuk fitur kedua:

```text
GEOFENCING & INFO PURA

01
●
│
├── Select or arrive at a site
│
02
●
│
├── Get smart notifications
│
03
●
│
└── Visit respectfully
```

Ini lebih natural daripada memaksa tiga kolom pada mobile.

---

# 15. Responsive Structure

### Desktop

```text
2 feature journeys
×
3 horizontal steps
```

### Tablet

Bisa tetap horizontal jika lebar memungkinkan:

```text
01 ─────── 02 ─────── 03
```

Tetapi description dapat dipendekkan secara visual atau tetap maksimal 3–4 baris.

### Mobile

```text
01
│
02
│
03
```

Gunakan vertical timeline.

---

# 16. Typography

Untuk tetap konsisten dengan landing page:

### Section eyebrow

```text
STEP-BY-STEP
```

Uppercase, letter spacing sedikit lebih besar.

### Main heading

```text
How it works
```

Gunakan serif heading yang sama dengan section lainnya.

### Feature title

```text
ASISTEN ADAT
```

atau:

```text
Geofencing & Info Pura
```

Gunakan sans-serif yang lebih kuat.

### Step title

```text
Ask your question
Get reliable answers
Understand the culture
```

Buat lebih besar daripada description tetapi lebih kecil daripada section heading.

---

# 17. Spacing

Karena tidak ada card, whitespace menjadi bagian penting dari desain.

Rekomendasi desktop:

```text
Section padding top    : 96px
Section padding bottom : 96px

Header → first feature : 56–72px
Feature → next feature : 72–96px

Step spacing            : 32–48px
```

Jangan membuat semua elemen terlalu rapat.

Whitespace akan membuat section terasa lebih premium.

---

# 18. Dekorasi Artistik

Karena section ini sudah tidak menggunakan card, tambahkan **satu decorative element utama** agar tidak terlihat terlalu kosong.

Contoh:

### Opsi A — Botanical line

```text
      ╱╲
     ╱  ╲
────╯    ╰────────────
```

### Opsi B — Sacred geometry

Gunakan lingkaran geometris sangat tipis di background.

### Opsi C — Topographic line

Gunakan garis kontur tipis di belakang salah satu feature journey.

### Opsi D — Ornamental Bali

Gunakan motif abstrak Bali dengan opacity rendah.

Jangan menggunakan semuanya sekaligus.

Pilih **satu** decorative language agar section tetap clean.

---

# 19. Rancangan Final yang Direkomendasikan

Struktur terbaik:

```text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│ STEP-BY-STEP                                                 │
│                                                              │
│ How it works                                                 │
│ Three simple steps before stepping into sacred grounds.      │
│                                                              │
│                                                              │
│ ASISTEN ADAT                                                 │
│ Official knowledge, made understandable.                     │
│                                                              │
│ 01                      02                      03            │
│ ●───────────────────────●───────────────────────●            │
│                                                              │
│ Ask your question       Get reliable answers    Understand    │
│                                               the culture     │
│ Type any queries...     Receive instant...      Learn the      │
│                                                 deeper...      │
│                                                              │
│ ──────────────────────────────────────────────────────────   │
│                                                              │
│ GEOFENCING & INFO PURA                                       │
│ Know where you are, what is happening, and how to enter      │
│ respectfully.                                                │
│                                                              │
│ 01                      02                      03            │
│ ●───────────────────────●───────────────────────●            │
│                                                              │
│ Select or arrive       Get smart notifications  Visit         │
│ at a site                                      respectfully   │
│ Choose a destination   Receive automatic...     Time your     │
│ in Explore Mode...                            visit...        │
│                                                              │
│ ◇ Bali Governor Circular No. 7/2025                           │
│   Official provincial guidance.                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 20. Versi yang Lebih Minimal Lagi

Jika landing page ingin benar-benar clean, gunakan layout seperti editorial magazine:

```text
How it works

ASISTEN ADAT

01  Ask your question
    Type any queries you have regarding local customs...

02  Get reliable answers
    Receive instant, accurate responses drawn directly...

03  Understand the culture
    Learn the deeper philosophy behind the rules...


GEOFENCING & INFO PURA

01  Select or arrive at a site
    Choose a destination in Explore Mode...

02  Get smart notifications
    Receive automatic alerts about dress codes...

03  Visit respectfully
    Time your visit perfectly...
```

Dengan visual separator berupa garis horizontal dan icon kecil.

Ini merupakan opsi paling aman apabila tujuan utama adalah **mengurangi sebanyak mungkin penggunaan card**.

---

# 21. Rekomendasi Utama

Dari beberapa pendekatan di atas, gunakan:

> **Two Horizontal Journey Flows + Editorial Timeline**

Karena desain ini paling seimbang antara:

- informasi yang lengkap
- penggunaan ruang yang efisien
- minim card
- mudah dipindai
- tetap modern
- cocok dengan tema tourism
- mudah dibuat responsive
- tidak terlalu ramai

Struktur akhirnya:

```text
              HOW IT WORKS
                    ↓

             ASISTEN ADAT
                    ↓
       01 ───── 02 ───── 03
       ↓        ↓        ↓
      ASK     ANSWER   UNDERSTAND


          GEOFENCING & INFO PURA
                    ↓
       01 ───── 02 ───── 03
       ↓        ↓        ↓
     ARRIVE    ALERT    RESPECT
```

---

# 22. Prinsip UX

Section ini bukan tempat untuk memamerkan sebanyak mungkin UI component.

Tugas section adalah menjawab satu pertanyaan:

> **"Bagaimana SASANA membantu saya sebelum dan saat mengunjungi tempat sakral?"**

Jawabannya dibuat menjadi dua journey:

```text
ASK → ANSWER → UNDERSTAND

ARRIVE → ALERT → RESPECT
```

Ini membuat informasi kompleks menjadi mudah dipahami tanpa membutuhkan enam card.

---

# 23. Kesimpulan

Desain lama menggunakan tiga card untuk menjelaskan proses.

Desain baru mengubahnya menjadi **timeline/journey** sehingga:

- Tidak ada tiga card individual.
- Dua fitur utama tetap dapat menjelaskan **masing-masing tiga langkah**.
- Semua informasi yang diberikan tetap dipertahankan.
- Section menjadi lebih ringan dan editorial.
- Number 01/02/03 menjadi visual anchor.
- Garis penghubung menunjukkan urutan proses.
- Icon digunakan sebagai aksen, bukan container.
- Detail tetap terbaca tanpa membutuhkan popup/card tambahan.
- Mobile dapat berubah menjadi vertical timeline.
- Identitas Bali dapat ditambahkan melalui satu decorative element yang subtle.

### Core concept

> **Replace cards with journeys.**

Gunakan **Ask → Answer → Understand** untuk Asisten Adat dan **Arrive → Alert → Respect** untuk Geofencing & Info Pura.

Hasil akhirnya akan terasa lebih seperti **guided experience** dan lebih konsisten dengan tujuan mengurangi repetisi card di landing page.

---

# 24. Interactive Feature Selector

## Konsep Baru

Section **"How It Works"** sebaiknya tidak langsung menampilkan seluruh alur dari semua fitur.

Gunakan pola:

> **Feature Selector → Dynamic Step Timeline**

User terlebih dahulu memilih satu dari tiga fitur SASANA:

```text
Situation Check     Assistant     Zones & Notices
───────────────
     active
```

Setelah fitur dipilih, section menampilkan **cara kerja fitur tersebut dalam tiga langkah**.

Dengan pendekatan ini, informasi tetap lengkap tetapi tidak terasa seperti kumpulan card.

---

# 25. Struktur Interaksi

Flow utama:

```text
User masuk ke "How It Works"
        ↓
Situation Check aktif secara default
        ↓
User melihat 3 langkah fitur
        ↓
User memilih Assistant
        ↓
Timeline berubah menjadi alur Assistant
        ↓
User memilih Zones & Notices
        ↓
Timeline berubah menjadi alur Geofencing
```

Semua perubahan terjadi **di section yang sama**.

Tidak perlu modal dan tidak perlu membuat card baru.

---

# 26. Feature Selector

Gunakan selector berbasis typography, bukan card.

### Recommended

```text
EXPLORE A FEATURE

Situation Check     Assistant     Zones & Notices
────────────────
      active
```

Atau versi editorial:

```text
01  Situation Check
02  Assistant
03  Zones & Notices
```

### Aturan visual

- Tidak menggunakan background card.
- Active feature menggunakan blue/gold accent.
- Tambahkan underline atau garis kecil pada item aktif.
- Hover menggunakan perubahan opacity, warna, atau sedikit movement.
- Tetap tampilkan icon kecil untuk membantu pengenalan fitur.

---

# 27. Default State — Situation Check

Saat section pertama kali dibuka, **Situation Check** dapat menjadi fitur aktif.

Tampilan:

```text
STEP-BY-STEP

How it works

See how each SASANA feature helps you
before and during your visit.


EXPLORE A FEATURE

Situation Check     Assistant     Zones & Notices
───────────────


AI VISION
Situation Check


01 ───────────── 02 ───────────── 03

Take a photo       Get feedback       Know what to adjust
or upload          from SASANA        before you enter

Take a quick       SASANA analyzes    Receive clear guidance
photo of your      your outfit or     on what may need
outfit or          surroundings.      adjustment.
surroundings.
```

Tambahkan CTA opsional:

```text
Explore feature →
```

---

# 28. Situation Check — Tiga Langkah

### 01 — Take a photo or upload

> Take a quick photo of your outfit or surroundings, or ask a question.

### 02 — Get feedback from SASANA

> Let SASANA analyze your outfit or surroundings and provide visual guidance.

### 03 — Know what to adjust

> Receive clear guidance on what may need adjustment before you enter.

### Journey

```text
PHOTO
  ↓
ANALYSIS
  ↓
GUIDANCE
```

Tema visual:

> **Vision → Recognition → Preparation**

Gunakan icon seperti:

- Camera
- Scan
- Eye
- Spark

---

# 29. Assistant — RAG Chatbot

Saat user memilih **Assistant**, selector tetap berada di tempat yang sama tetapi timeline berubah.

```text
EXPLORE A FEATURE

Situation Check     Assistant     Zones & Notices
                    ─────────
                      active


OFFICIAL KNOWLEDGE
Assistant


01 ───────────── 02 ───────────── 03

Ask your           Get reliable      Understand
question           answers           the culture

Type any queries   Receive instant   Learn the deeper
regarding local    accurate          philosophy behind
customs...         responses...      the rules...
```

### 01 — Ask your question

> Type any queries you have regarding local customs, appropriate behavior, or specific rules at your destination.

### 02 — Get reliable answers

> Receive instant, accurate responses drawn directly from official Balinese regulations and guidelines.

### 03 — Understand the culture

> Learn the deeper philosophy behind the rules, so you can appreciate and honor the culture fully.

### Journey

```text
ASK
  ↓
ANSWER
  ↓
UNDERSTAND
```

Tema visual:

> **Knowledge → Guidance → Cultural Understanding**

Gunakan icon seperti:

- Chat
- Spark
- Book / Knowledge
- Quote

---

# 30. Zones & Notices — Geofencing

Saat user memilih **Zones & Notices**, timeline berubah lagi.

```text
EXPLORE A FEATURE

Situation Check     Assistant     Zones & Notices
                                  ────────────────
                                       active


LOCATION AWARENESS
Zones & Notices


01 ───────────── 02 ───────────── 03

Select or         Get smart        Visit
arrive at a site  notifications    respectfully

Choose a          Receive          Time your visit
destination or    automatic        and enter
enter a           alerts...        prepared...
recognized area.
```

### 01 — Select or arrive at a site

> Choose a destination in Explore Mode, or simply walk into a recognized sacred area.

### 02 — Get smart notifications

> Receive automatic alerts about specific dress codes, opening hours, and ongoing local ceremonies.

### 03 — Visit respectfully

> Time your visit perfectly and enter the sacred grounds fully prepared without disrupting ongoing events.

### Journey

```text
ARRIVE
  ↓
ALERT
  ↓
RESPECT
```

Tema visual:

> **Location → Awareness → Respect**

Gunakan icon seperti:

- Map Pin
- Radar
- Bell
- Shield / Temple

---

# 31. Dynamic Timeline

Gunakan **satu timeline component** yang data dan kontennya berubah berdasarkan feature yang dipilih.

Struktur:

```text
Feature Selector
       ↓
Selected Feature
       ↓
Feature Header
       ↓
Step 01 → Step 02 → Step 03
       ↓
Optional CTA
```

Jangan membuat tiga timeline terpisah yang semuanya dirender secara visual.

Secara konsep:

```js
activeFeature = "assistant"
```

maka timeline menampilkan data Assistant.

Ketika:

```js
activeFeature = "zones"
```

timeline menampilkan data Zones & Notices.

---

# 32. Recommended Component Structure

```text
HowItWorksSection
│
├── SectionHeader
│   ├── Eyebrow
│   ├── Heading
│   └── Description
│
├── FeatureSelector
│   ├── SituationCheckTab
│   ├── AssistantTab
│   └── ZonesTab
│
└── DynamicFeatureTimeline
    ├── FeatureHeader
    ├── Step
    ├── Step
    ├── Step
    └── ExploreCTA
```

State:

```js
const [activeFeature, setActiveFeature] =
    useState("situationCheck");
```

---

# 33. Recommended Feature Data Structure

```js
const features = {
    situationCheck: {
        label: "Situation Check",
        category: "AI Vision",
        icon: "camera",
        steps: [
            {
                number: "01",
                title: "Take a photo or upload",
                description:
                    "Take a quick photo of your outfit or surroundings, or ask a question."
            },
            {
                number: "02",
                title: "Get feedback from SASANA",
                description:
                    "Let SASANA analyze your outfit or surroundings and provide visual guidance."
            },
            {
                number: "03",
                title: "Know what to adjust",
                description:
                    "Receive clear guidance on what may need adjustment before you enter."
            }
        ]
    },

    assistant: {
        label: "Assistant",
        category: "Official Knowledge",
        icon: "message",
        steps: [
            {
                number: "01",
                title: "Ask your question",
                description:
                    "Type any queries you have regarding local customs, appropriate behavior, or specific rules at your destination."
            },
            {
                number: "02",
                title: "Get reliable answers",
                description:
                    "Receive instant, accurate responses drawn directly from official Balinese regulations and guidelines."
            },
            {
                number: "03",
                title: "Understand the culture",
                description:
                    "Learn the deeper philosophy behind the rules, so you can appreciate and honor the culture fully."
            }
        ]
    },

    zones: {
        label: "Zones & Notices",
        category: "Location Awareness",
        icon: "location",
        steps: [
            {
                number: "01",
                title: "Select or arrive at a site",
                description:
                    "Choose a destination in Explore Mode, or simply walk into a recognized sacred area."
            },
            {
                number: "02",
                title: "Get smart notifications",
                description:
                    "Receive automatic alerts about specific dress codes, opening hours, and ongoing local ceremonies."
            },
            {
                number: "03",
                title: "Visit respectfully",
                description:
                    "Time your visit perfectly and enter the sacred grounds fully prepared without disrupting ongoing events."
            }
        ]
    }
};
```

---

# 34. Interaction Details

## Default

Situation Check aktif.

```text
Situation Check
───────────────
```

## Hover

Saat cursor berada di atas fitur:

- opacity menjadi lebih tinggi
- accent muncul
- icon sedikit membesar
- underline muncul
- tidak menggunakan card shadow berat

## Selected

Fitur aktif mendapatkan:

- blue/gold accent
- underline yang lebih tegas
- icon active state
- timeline content baru
- animasi masuk yang ringan

---

# 35. Transition Antar Fitur

Jangan langsung mengganti teks secara mendadak.

Gunakan transition sederhana:

```text
Old content
opacity 1
translateY 0

      ↓

opacity 0
translateY 8px

      ↓

New content
opacity 1
translateY 0
```

Rekomendasi durasi:

```text
300–400ms
```

Gunakan easing yang natural.

Hindari:

- bounce berlebihan
- rotating card
- 3D flip
- animasi panjang

Karena visual website harus tetap premium dan tenang.

---

# 36. Final Layout

Layout desktop yang direkomendasikan:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ STEP-BY-STEP                                                │
│                                                             │
│ How it works                                                │
│ See how each SASANA feature helps you before and during     │
│ your visit.                                                 │
│                                                             │
│ EXPLORE A FEATURE                                           │
│                                                             │
│ Situation Check      Assistant      Zones & Notices         │
│ ───────────────                                           │
│                                                             │
│ AI VISION                                                    │
│ Situation Check                                               │
│                                                             │
│ 01 ─────────────── 02 ─────────────── 03                   │
│                                                             │
│ Take a photo        Get feedback        Know what to adjust │
│ or upload           from SASANA         before you enter    │
│                                                             │
│ Take a quick        SASANA analyzes     Receive clear       │
│ photo of your      your outfit or      guidance before     │
│ outfit...          surroundings...     you enter.           │
│                                                             │
│                                      Explore feature →      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Saat Assistant dipilih, hanya bagian feature header dan timeline yang berubah.

---

# 37. Mobile Layout

Pada mobile, selector dapat menjadi horizontal scroll:

```text
← Situation Check | Assistant | Zones & Notices →
```

Kemudian timeline menjadi vertical:

```text
ASSISTANT

01
●
│
├── Ask your question
│   Type any queries...
│
02
●
│
├── Get reliable answers
│   Receive instant...
│
03
●
│
└── Understand the culture
    Learn the deeper...
```

Ini jauh lebih nyaman daripada memaksa tiga kolom pada layar kecil.

---

# 38. UX Principle

Section ini harus menjawab:

> **"Bagaimana masing-masing fitur SASANA bekerja?"**

Bukan:

> "Apa saja card fitur yang dimiliki SASANA?"

Karena itu, pola yang digunakan adalah:

```text
CHOOSE
  ↓
SEE HOW IT WORKS
  ↓
UNDERSTAND
  ↓
EXPLORE
```

User tidak perlu membaca semua informasi sekaligus.

---

# 39. Kesimpulan Final

Desain terbaik untuk section ini adalah:

> **Interactive Feature Tabs + Dynamic Step Timeline**

Tiga fitur:

```text
Situation Check
Assistant
Zones & Notices
```

ditampilkan sebagai **selector tanpa card**.

Setelah user memilih satu fitur, timeline menampilkan tiga langkah yang relevan.

### Tiga journey utama

```text
Situation Check
PHOTO → ANALYSIS → GUIDANCE


Assistant
ASK → ANSWER → UNDERSTAND


Zones & Notices
ARRIVE → ALERT → RESPECT
```

Konsep ini:

- Mengurangi penggunaan card.
- Tetap memuat seluruh informasi penting.
- Membuat user aktif memilih informasi yang ingin dipelajari.
- Menghemat vertical space.
- Memberikan interaction yang jelas.
- Mudah diimplementasikan dengan satu state dan satu dynamic timeline.
- Tetap selaras dengan visual SASANA yang clean, premium, dan editorial.

### Core UX concept

> **Let the user choose the feature, then show the journey.**
