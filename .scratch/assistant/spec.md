# Spec — Assistant

**Owner:** Daniyal · **Branch prefix:** `assistant/`

Apa arti "selesai" untuk area Assistant (F2 Custom Assistant). Dibaca sebelum
memulai branch di sini. Kosakata: `CONTEXT.md`. Latar belakang produk:
`docs/prd.md` §12 dan `docs/backend-spec.md` §2.2.

Area ini dibuka pada 2026-09-05. Sebelumnya chatbot tidak dimiliki area mana
pun — ia duduk di antara backend dan frontend tanpa pemilik, yang adalah
sebagian alasan kenapa bug di bawah bertahan begitu lama.

---

## Masalah yang memicu pekerjaan ini

Keluhan aslinya: **terlalu banyak pertanyaan pengunjung yang tidak bisa
dijawab.** Penelusuran menemukan empat sebab yang berbeda, bukan satu.

1. **Gerbang server membuang jawaban yang baik.** `safeParseChat` menolak
   respons yang tidak membawa `source` berisi string, padahal `CHAT_SCHEMA`
   tidak mewajibkan model mengisinya. Model bisa menjawab benar, menandai
   `grounded: true`, lupa mengisi `source`, dan jawabannya diganti kalimat
   penolakan. Ini bug, bukan desain.
2. **KB hanya berisi 13 rule.** Apa pun di luar itu memang tidak terjawab, dan
   itu sesuai desain (`AGENTS.md`, guardrail W6).
3. **Penolakannya jalan buntu.** Satu kalimat datar, tanpa menawarkan apa pun.
   Pengunjung membaca "tidak tahu" padahal sistemnya tahu banyak hal lain.
4. **Kegagalan ikut ter-cache satu jam.** Sekali apes, tetap apes.

Yang dirasakan sebagai "cakupan sempit" sebenarnya campuran dari keempatnya,
dan hanya nomor 2 yang benar-benar soal ukuran KB.

---

## Keputusan (Daniyal, 2026-09-05)

Diambil lewat sesi grilling penuh, 23 pertanyaan, lima ronde.

### Grounding dan jangkauan jawaban

- **`ruleIds` menggantikan `source` sebagai klaim model.** Model menyebut id
  rule yang ia pakai; server yang mengambil teks sumbernya lewat `rulesByIds()`.
  Id yang tidak dikenal KB dibuang, bukan digemakan kembali. Klaim grounding
  jadi **bisa diverifikasi**, bukan sekadar kata sifat yang diketik model.
- **Cakupan selebar mungkin, dibatasi volatilitas dan bukan topik.** Adat,
  makna budaya, sejarah, dan latar pariwisata semuanya masuk. Yang ditolak
  hanya fakta yang berubah — `docs/adr/0004-no-open-closed-status.md` berlaku
  penuh.
- **Tiga tingkat jawaban**, diwakili
  `kind: "rule" | "context" | "general" | "none"`. `grounded: boolean` dihapus
  dari kontrak; satu sumber kebenaran, empat keadaan eksplisit.

  *Direvisi 2026-09-06.* Rancangan awal berhenti di dua tingkat. Bukti dari
  layar sungguhan mengubahnya: dua pertanyaan berturut-turut — "boleh membawa
  makanan ke pura?" dan "ada penginapan bagus di Tanah Lot?" — dijawab dengan
  kalimat penolakan yang sama persis, padahal sebabnya berbeda. Yang pertama
  lubang KB, yang kedua memang di luar. Tingkat 3 dibuka untuk yang kedua.
- **Server hanya boleh menurunkan tingkat, tidak pernah menaikkan.** Model
  mengajukan `kind`, server memverifikasi terhadap KB dan menurunkannya kalau
  klaimnya tidak berdiri. Setiap kegagalan model mendorong jawaban ke arah yang
  lebih hati-hati.
- **Pagar volatilitas, bukan pagar topik.** Tingkat 2 dan 3 boleh menjelaskan
  *apa arti sesuatu* dan *apa yang pernah terjadi*, tidak pernah *apa yang
  sedang terjadi*. Semua fakta yang berubah menurut tanggal, jam, harga, cuaca,
  atau jadwal dilarang mutlak. Rekomendasi bisnis — hotel, restoran, pemandu,
  tur — ikut ditolak: tidak ada cara memeriksa tempatnya masih ada atau masih
  bagus. Ditegakkan lewat prompt sebagai pagar utama, plus saringan sempit di
  server sebagai jaring.

  Ini pergeseran cara pikir yang penting: bahayanya bukan topik, melainkan
  volatilitas. Fakta yang berubah adalah fakta yang akan menjadi salah, dan
  begitu cache persisten masuk, satu halusinasi menjadi halusinasi permanen.
  Prompt vision sudah memakai pagar yang sama (`lib/prompts.ts`,
  `buildPhotoMetaLine`), jadi ini konsisten dengan sistem, bukan aturan baru.
- **Perbedaan tingkat terlihat oleh pengunjung.** Tiap tingkat punya ikon Lucide
  dan kalimatnya sendiri di `SourceReference`: `shield-check` untuk aturan resmi,
  `map-pin` untuk data peta, `book-open` untuk penjelasan adat, `globe` untuk
  latar Bali, dan tidak ada baris sama sekali untuk penolakan. Bobotnya mengikuti
  atribusi: yang bisa menyebut sumber dapat garis pemisah dan warna aksen, yang
  tidak tetap muted. Tanpa warna baru, tanpa badge, tanpa background baru.
  Terverifikasi patuh guardrail I1, I5, dan C6 — C6 justru **mewajibkan** dua
  keadaan dibedakan oleh lebih dari warna.
- **Klaim di UI ikut dikoreksi.** Lima kalimat menjanjikan bahwa setiap jawaban
  berasal dari aturan resmi. Sejak tingkat 2 dan 3 dibuka itu jadi overclaim,
  dan ADR-0014 tegas bahwa perbedaannya harus sampai ke pengunjung. Sekarang
  yang dijanjikan adalah yang benar: jawaban resmi membawa sumbernya, sisanya
  menyatakan dirinya bukan aturan resmi.
- **Penolakan mengalihkan, bukan menutup pintu.** Penolakan dibangun per
  pertanyaan, dan bentuknya ditentukan oleh **alasan** penolakan: `uncovered`
  menawarkan topik yang dipunya KB, `volatile` menyebut kelas faktanya lalu
  menunjuk petugas pura.

  *Direvisi 2026-09-06.* Rancangan awal menjadikan `searchRules()` mekanisme
  utamanya. Pengukuran membatalkan itu: skornya tidak memisahkan kecocokan asli
  dari kebetulan. "apakah harus melepas sepatu" mendapat 5 di `shoe-removal`,
  tapi "berapa harga tiket masuk" mendapat 3 di `sacred-area-entry` semata-mata
  karena "masuk" adalah keyword, dan tidak ada ambang yang duduk di antara
  keduanya. Jadi `searchRules()` tetap dipakai, tapi hanya untuk **melunakkan
  kata-kata** dari daftar topik menjadi tawaran; daftar kategori KB adalah jalur
  yang selalu bekerja. Keyword yang lebih tajam adalah pekerjaan KB, bukan kode.

  Penolakan `volatile` tidak pernah menawarkan rule sama sekali — menjawab
  pertanyaan harga dengan "mau saya jelaskan soal area suci?" persis bentuk
  non-sequitur yang membuat asisten terasa rusak.
- **Tempat terdekat dibaca dari OpenStreetMap, bukan dari model.** Tingkat
  `places`: Overpass ditanya penginapan atau tempat makan bernama dalam radius
  **3 km** dari Site, **5 terdekat** masuk prompt, model hanya merangkai
  kalimatnya. Deteksi lewat regex sebelum Gemini dipanggil, bukan lewat function
  calling yang memakan satu round trip tambahan tiap pertanyaan.

  *Ditambahkan 2026-09-06,* setelah pertanyaan "adakah penginapan terdekat di
  sekitar Pura Tanah Lot?" ditolak. Mencabut pagarnya tidak akan menjawabnya —
  model tidak punya peta, jadi yang keluar adalah nama hotel karangan yang
  diucapkan sepercaya nama asli. Jawabannya harus datang dari peta.
  [`docs/adr/0015`](../../docs/adr/0015-nearby-places-from-openstreetmap.md).
  Konsekuensinya `SiteContext` membawa `lat`/`lng`, dan **jawaban peta tidak
  pernah di-cache**: yang lain diturunkan dari KB yang berubah kalau diedit,
  yang ini menggambarkan dunia yang berubah sendiri.
- **KB naik ke ~40 rule.** Sumber wajib: dokumen resmi, atau sumber adat yang
  **disebutkan namanya** (buku, jurnal, laman dinas). "Adat" sebagai selimut
  tidak diterima — sumber yang tidak bisa ditelusuri sama saja dengan tanpa
  sumber.

  *Sebagian dikerjakan 2026-09-06: 13 → 27 rule.* Empat belas klausul SE No. 7
  Tahun 2025 yang belum tercakup ditambahkan, dibaca dari daftar klausul yang
  dikutip laman resmi Pemprov Bali (bmc.baliprov.go.id, 24 Maret 2025) karena
  PDF aslinya memakai font CID yang tidak bisa diekstrak. `source` menyebut
  otoritasnya untuk pengunjung; `why_source` mencatat halaman yang benar-benar
  dibaca, supaya bisa ditelusuri ulang.

  **Sisa utang: 13 rule lagi, dan 7 rule lama yang masih memakai selimut
  "Balinese Hindu custom (adat)".** Ketujuhnya didaftar eksplisit di
  `__tests__/rules-sourcing.test.ts` sebagai `UNSOURCED_LEGACY` supaya utangnya
  terhitung dan hanya bisa mengecil. Menulis ulang atribusinya tanpa membaca
  sumber nyata sama saja dengan mengarang sumber, yang lebih buruk daripada
  mengakui utangnya.
- **Standar sumber ditegakkan sebagai test, bukan sebagai niat.**
  `rules-sourcing.test.ts` menolak sumber di luar daftar, rule tanpa keyword
  yang muncul di teks Indonesianya, dan — pelajaran mahal — **keyword yang
  muncul di lebih dari separuh rule**. Menambahkan "pura" ke 13 rule sekaligus
  membuat semua pertanyaan bahasa Indonesia mencocoki semuanya, dan penolakan
  yang mengalihkan mulai menawarkan Tata Busana kepada orang yang bertanya soal
  makanan. Kata yang berguna adalah kata yang **membedakan** satu rule dari
  yang lain.

### Cache dan hemat token

Diminta sebagai deliverable akademik. Yang dinilai rancangan dan buktinya.

- **Pencocokan lewat normalisasi token.** Stopword dan klitik dibuang, kata
  sisanya diurutkan, hasilnya jadi kunci — `STOPWORDS` EN+ID di
  `lib/knowledge.ts` dipakai ulang lewat `normalizeQuestion()`. Empat cara
  menanyakan hal yang sama bertemu di `celana|pakai|pendek`. **Nol panggilan API
  tambahan.**

  Klitik `-kah`, `-lah`, `-nya` dilucuti dengan batas sisa 3 huruf, sehingga
  "bolehkah" sampai ke stopword "boleh" tanpa merusak "punya" atau "tanya".
  Prefiks tidak disentuh: bahasa Indonesia memakai peluluhan nasal, "memakai"
  adalah me+pakai, dan pelucut naif merusak lebih banyak kata daripada yang
  diperbaikinya.

  Embedding ditolak justru karena alasan akademik: menambah satu panggilan API
  per pertanyaan pada sistem yang tesisnya adalah penghematan token adalah
  pertanyaan sidang yang tidak punya jawaban.
- **`node:sqlite` bawaan Node.** `backend/Dockerfile` memakai `node:24-alpine`,
  jadi modul ini tersedia tanpa dependensi baru — lolos `AGENTS.md` aturan 4
  tanpa menyentuh `package.json`. Butuh volume baru di `docker-compose.yml`.

  *Menaikkan batas Node proyek ke 24.* `node:sqlite` baru ada sejak 22.5.
  Ketahuan karena CI merah padahal lokal hijau: workflow menguji di Node 20
  sementara kedua Dockerfile mengirim Node 24, jadi **CI selama ini membuktikan
  kode bekerja di runtime yang tidak pernah dideploy**. Sekarang keduanya 24,
  dan README menyebut batas yang sebenarnya.
- **Invalidasi lewat hash isi `rules.json`**, dihitung sekali di `loadRules()`.
  Hash berbeda = anggap miss. Versi manual ditolak karena bergantung pada
  disiplin manusia yang pasti gagal di malam sebelum demo.
- **Jawaban `kind: "none"` tidak disimpan.** Kegagalan tidak layak diabadikan.
- **Penghematan diukur, bukan diperkirakan.** `totalTokenCount` asli disimpan
  per entri; tiap hit menambahkannya ke penghitung. `GET /api/stats` menyajikan
  hit rate, jumlah entri, dan token terhemat.
- **Teks asli pengunjung tidak disimpan.** Hanya kunci ternormalisasi, jawaban,
  dan pencacah frekuensi. Kuncinya masih terbaca manusia dan berguna untuk
  analisis topik, tapi bukan lagi kalimat yang diketik seseorang.
- **`TTLCache` dihapus beserta test-nya.** SQLite jadi satu-satunya cache, dan
  konsep TTL ikut dibuang: jawaban turunan KB tidak basi karena waktu berlalu,
  ia basi ketika `rules.json` berubah — dan hash sudah menangkap itu dengan
  tepat. Dua lapis cache hanya menambah dua hal yang bisa tidak sinkron.

---

## Urutan pengerjaan

Tujuh pull request. **Garis potong ada setelah PR-4** — kalau waktu habis,
berhenti di sana: PR-2 sampai PR-4 sendirian sudah menyelesaikan keluhan aslinya,
dan keduanya perubahan backend murni yang tidak bisa merusak tampilan.

| PR | Isi | Status |
| --- | --- | --- |
| 1 | Kontrak: `kind` + `ruleIds` menggantikan `grounded` + `source`. Tabel area README. | selesai, belum di-merge |
| 2 | Tiga tingkat di server: `kind` diajukan model, penurunan oleh server, pagar volatilitas. | selesai, belum di-merge |
| 3 | Tempat terdekat dari OpenStreetMap (`kind: "places"`). | selesai, belum di-merge |
| 4 | Penolakan yang mengalihkan, dibentuk oleh alasan penolakan. | selesai, belum di-merge |
| 5 | UI per tingkat: ikon + copy di `SourceReference`, plus koreksi klaim. | selesai, belum di-merge |
| 6 | Isi KB: 13 → 27 rule bersumber, plus standar sumber sebagai test. | sebagian, belum di-merge |
| 7 | Cache SQLite + `GET /api/stats`. | selesai, belum di-merge |

Cache sengaja ditaruh terakhir. Cache yang dibangun di atas gerbang yang masih
membuang jawaban bagus akan meng-cache kegagalan itu dan mengabadikannya.
Perbaiki dulu apa yang di-cache, baru cache-nya.

**PR-6 adalah satu-satunya yang tidak bisa dikerjakan agen.** PR lainnya
selesai dalam hitungan hari; 27 rule dengan sumber nyata butuh orang duduk
membaca. Kalau itu tidak dijadwalkan, chatbot akan punya arsitektur yang jauh
lebih baik dan cakupan yang hampir sama.

---

## ADR yang harus ditulis

Dua, sebagai bagian dari PR yang bersangkutan.

- **Tingkat 2 dan 3 melonggarkan guardrail W6** (`docs/design-guardrails.md`:
  *"Never invent a rule. Ungrounded answers say so plainly."*) — ditulis sebagai
  [`docs/adr/0014-assistant-answer-tiers.md`](../../docs/adr/0014-assistant-answer-tiers.md).
- **Cache persisten dan pilihan SQLite**, termasuk alasan hash `rules.json`
  supaya orang berikutnya tidak menghapusnya karena mengira berlebihan —
  ditulis sebagai
  [`docs/adr/0016-persistent-answer-cache.md`](../../docs/adr/0016-persistent-answer-cache.md).

`docs/adr/0004-no-open-closed-status.md` **tidak dicabut.** Ia melarang jam buka
dan status buka/tutup; pagar volatilitas melarang kelas fakta yang persis sama.
Pekerjaan ini memperkuatnya, tidak menabraknya.

---

## Catatan kepemilikan

Rafli dan Manu sedang berhenti sementara atas keputusan Daniyal; development
terpusat di satu orang. `shared/contract.ts` secara nominal milik area AI
vision, dan aturan README tetap dihormati: **perubahan kontrak ship sebagai
pull request kecil sendiri, merge sebelum apa pun yang bergantung padanya.**

Yang tidak berubah karena ditegakkan mesin, bukan kesepakatan tim: pull request
tetap wajib (GitHub menolak push langsung ke `main`), dan CI tetap harus hijau —
`npm run typecheck` dan `npm run test:run` di setiap workspace yang disentuh.
