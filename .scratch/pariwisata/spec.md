# Spec — Pariwisata: posisi yang sadar, dan tempat yang bisa dijelaskan

**Owner:** Daniyal · **Branch prefix:** `pariwisata/`, `geofencing/`, `assistant/`
**Ditetapkan:** 2026-09-10, lewat sesi grilling

Dua pekerjaan yang lahir dari satu pertanyaan: bagaimana SASANA berkontribusi
pada pariwisata Bali tanpa berhenti jadi SASANA. Kosakata: `CONTEXT.md`.
Latar belakang: ADR-0004, ADR-0014, ADR-0015, ADR-0020.

---

## Kenapa

Bali AI Tech Fest 2026 menganjurkan unsur pariwisata masuk ke produk. Refleks
pertamanya adalah menambah daftar tempat wisata. Refleks itu ditolak, dan
alasannya bukan kemurnian:

**Daftar tempat wisata adalah lapangan yang produk ini pasti kalah.** Anggaran
Rp 0 (`docs/tech-spec.md` §5) berarti tanpa Google Places, tanpa foto
profesional, tanpa rating, tanpa jam buka — karena jam buka ada di balik pagar
volatilitas ADR-0014. Hasilnya adalah Google Maps versi lebih buruk, dibangun
oleh tim yang punya sesuatu yang tidak dimiliki Google Maps dan tidak
memakainya.

Tiga hal juga sudah menutup pintunya lebih dulu, dan ketiganya keputusan sadar:

- `CONTEXT.md` menuliskan **"tempat wisata"** sebagai kata yang dihindari,
  tepat di baris `_Avoid_` milik **Amenity**.
- ADR-0020 menolak `addresstype: attraction` di daftar putih geocoder, karena
  menerimanya memasukkan kembali gang bernama "Bogor".
- `PRODUCT.md` menetapkan suara produk sebagai *"a calm, knowledgeable local
  friend rather than a punitive authority or a generic tourism brochure"*.

Yang tersisa, dan yang tidak dimiliki siapa pun: SASANA tahu **di mana visitor
berdiri terhadap sebuah tempat suci**, dan bisa menjelaskan **apa yang terjadi
di sana serta apa artinya**, tanpa satu kalimat pun yang dikarang. Turis yang
paham datang lebih banyak *dan* berperilaku lebih baik. Itu klaim dampak yang
bisa dipertahankan.

---

## Keputusan (Daniyal, 2026-09-10)

### Suara

- **Menjelaskan, bukan menawarkan.** Bukan "kenapa Anda harus ke sini",
  melainkan "apa tempat ini dan apa yang dilakukan orang di sini". Ketertarikan
  lahir dari kedalaman, bukan dari ajakan. Kalimat berbentuk keunggulan,
  highlight, atau daya tarik tidak ditulis.
- **Dampak pariwisata dinyatakan lewat sebabnya, bukan lewat angka karangan.**
  Surat Edaran Gubernur Bali No. 7/2025 ada *karena* ada masalah perilaku
  pengunjung; SASANA adalah lapisan pencegah sebelum aturan itu perlu
  ditegakkan. Itu bukti bersumber. Angka terukur datang dari `/stats`, yang
  menghitung pemakaian sungguhan. **Metrik dampak karangan ("X pelanggaran
  dicegah") tidak pernah ditulis** — itu W6 dalam bentuk lain.

### Significance

- **Kosakata baru: `Significance` / *Makna Tempat*.** Apa sebuah Site itu dan
  apa yang dilakukan orang di sana, selalu dengan sumber. `_Avoid_`: daya
  tarik, keunggulan, highlight, atraksi, destinasi.
- **`frontend/src/data/significance.ts`, meniru persis pola `meanings.ts`:**
  dikunci per `site.id`, isi `Localized` + `source`, dan sebuah tes yang gagal
  kalau ada entri dengan `source` kosong.
- **Tidak pernah memuat tanggal.** Tanggal hanya boleh lewat `Odalan`, yang
  sudah mewajibkan jangkar kalender dan URL sumber (ADR-0004). Satu lapis baru,
  bukan dua, justru supaya aturan tanggal tetap tinggal di satu tempat: dua
  tempat yang boleh menyebut kapan sesuatu terjadi berarti ADR-0004 punya dua
  pintu untuk ditembus.
- **Frekuensi boleh disebut, sumber tetap wajib.** "Kecak digelar tiap sore"
  sah bila ada sumbernya — halaman pengelola pura, daftar resmi pariwisata
  kabupaten, atau situs pemkab sudah cukup. Palangnya rendah, bukan nol. Tanpa
  sumber, kalimatnya **turun** ke bentuk tanpa jadwal ("panggung tari kecak"),
  tidak dibuang.
- **Utang yang sudah tayang:** `frontend/src/data/sites.ts:170` menulis Uluwatu
  *"hosts the nightly kecak dance performance at sunset"* — jadwal berulang
  tanpa sumber, di sisi yang salah dari pagar ADR-0014. Diperbaiki lebih dulu,
  di luar gelombang ini, karena ia tayang sebelum penjurian.

### Halaman Site

- **`/explore/[siteId]` berhenti me-`redirect` dan merender `SiteBrief` yang
  sama di halaman polos.** Hari ini rutenya 17 baris dan seluruhnya
  `redirect()` ke `/explore?site=`, jadi tiap tempat suci terkunci di dalam
  peta: tidak bisa dibaca tanpa izin lokasi, tidak bisa ditautkan, tidak bisa
  diindeks.
- **Diperiksa sebelum diputuskan:** `SiteBrief.tsx` tidak mengimpor apa pun dari
  Leaflet — tidak `BaseMap`, tidak `useLeafletMap()`. Ia sudah bisa dirender di
  halaman biasa dengan `distanceM: null`. Jadi ini bukan komponen baru.
- **Nol konten kedua.** Satu komponen melayani dua tempat; salinan kedua adalah
  tempat kedua untuk mulai berbeda dari aslinya.
- **`?site=` tetap bekerja berdampingan**, tidak digantikan. Peta masih
  memakainya.
- **Kenapa ini yang terbesar dampaknya:** turis memilih tujuan **sebelum**
  mendarat di Bali, dari laptop di negara lain, tanpa GPS dan tanpa alasan
  membuka peta. Konten pariwisata yang hanya bisa dicapai lewat peta ber-GPS
  tidak terlihat oleh satu pun calon pengunjung.

### Katalog Site

- **Enam Site baru, satu commit per Site**, menggenapkan katalog jadi dua belas.
- Syarat seleksi, berurutan: **(i)** tercakup Surat Edaran No. 7/2025 sebagai
  tempat suci — kalau tidak, ia tidak punya Custom dan tidak berhak jadi Site;
  **(ii)** punya ritus atau kedudukan yang bisa disumber, supaya `Significance`
  tidak kosong; **(iii)** menyebar ke kabupaten yang belum terwakili;
  **(iv)** ada foto berlisensi terbuka.
- Kandidat: **Pura Taman Ayun** (Badung), **Pura Ulun Danu Batur** (Bangli),
  **Pura Gunung Kawi** (Gianyar), **Pura Goa Lawah** (Klungkung),
  **Pura Lempuyang Luhur** (Karangasem), **Pura Taman Saraswati Ubud**
  (Gianyar). Tiga kabupaten baru masuk peta.
- **Custom dipetakan ke Rule yang sudah ada**, tidak ada Rule baru dikarang.
  `site-rules.test.ts` sudah menegakkan tautannya.
- **Foto:** Wikimedia Commons berlisensi terbuka, fotografer dan URL dicatat
  sesuai `frontend/public/sites/README.md`. Tidak dapat lisensi → Site dikirim
  **tanpa** `image`; kartunya turun anggun ke placeholder. **Celah foto tidak
  pernah diisi AI** (guardrail I4).
- **Foto tidak pernah memblokir sebuah Site.**
- **Agen menyumber, owner memverifikasi sebelum PR dibuka.** Koordinat dari
  OSM, dicocokkan sampai benar-benar menunjuk pura yang dimaksud.
- **Tiga `odalan` yang kosong diisi** (Besakih, Batu Bolong, Ulun Danu Beratan)
  hanya bila jangkar kalendernya bisa disumber. Kosong tetap default yang aman.

### Halaman /about

- Dua paragraf bersumber: Surat Edaran No. 7/2025 sebagai bukti masalahnya
  nyata dan resmi, dan apa yang SASANA lakukan sebelum aturan itu perlu
  ditegakkan. Tidak ada halaman baru.

---

## Yang ini bukan

Bukan direktori tempat wisata. Bukan pemberi rekomendasi kualitas. Bukan brosur.
`Significance` adalah pendalaman panduan tata krama, bukan produk kedua di dalam
produk pertama — batas yang sama yang sudah ditarik untuk Amenity.

## Yang diterima sadar

- **Menulis `Significance` adalah kerja penelusuran sumber, bukan kerja kode.**
  Ia tidak bisa dipercepat dengan menulis lebih cepat, dan itulah alasan
  gelombang ini berdiri di luar tenggat Jumat.
- **Daftar putih dan pagar volatilitas tidak dilonggarkan** oleh pekerjaan ini.
  Harga, rating, dan "yang bagus" tetap di luar.
- **Kewajiban atribusi ODbL bertambah** kalau ada koordinat atau foto yang
  diambil dari OSM.
- **Halaman Site menambah permukaan yang harus tetap hijau** di `typecheck` dan
  `test:run`, dan ikut ke static export yang di-commit (ADR-0019).
- **Beberapa kandidat Site akan gugur** di syarat (ii) atau (iv). Gugur lebih
  baik daripada Site dengan `Significance` kosong.

---

## Tiket

| # | Cabang | Isi | Butuh |
| --- | --- | --- | --- |
| 01 | `geofencing/site-page` | `/explore/[siteId]` merender `SiteBrief`, `?site=` tetap jalan | — |
| 02 | `pariwisata/significance-layer` | `data/significance.ts`, tes `source` wajib, kata baru di `CONTEXT.md`, tampil di `SiteBrief` | — |
| 03 | `pariwisata/sites-wave-one` | Enam Site baru, satu commit per Site, foto + provenance | 02 |
| 04 | `pariwisata/odalan-backfill` | Isi tiga `odalan` kosong bila jangkarnya bisa disumber | — |
| 05 | `landing/about-impact` | Dua paragraf dampak bersumber di `/about` | — |

Tiket 01 dan 02 bisa jalan paralel. 03 menunggu 02 karena tiap Site baru lahir
sudah dengan `Significance`-nya, bukan ditambahkan belakangan.

## Menyusul, bukan sekarang

- **Halaman `/rules`** — 35 Rule beserta lapis maknanya hanya bisa dicapai lewat
  Explore → pilih Site → buka satu Custom hari ini. Isu tertunda di
  `.scratch/content-sections/issues/01-rules-page-and-impact-section.md`,
  berhenti di Pertanyaan 6.
- **`proximity` untuk Situation Check.** `PhotoMeta` sudah membawa `coords`
  fotonya sendiri, yang lebih tepat daripada posisi visitor saat menekan kirim.
  Dua sumber lokasi dalam satu prompt adalah dua sumber yang bisa berselisih.
