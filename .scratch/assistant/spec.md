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
- **Perbedaan tingkat terlihat oleh pengunjung.** Ikon Lucide berbeda plus copy
  berbeda di slot `SourceReference` yang sudah ada. Tanpa warna baru, tanpa
  badge, tanpa background baru. Terverifikasi patuh guardrail I1, I5, dan C6 —
  C6 justru **mewajibkan** dua keadaan dibedakan oleh lebih dari warna.
- **Penolakan mengalihkan, bukan menutup pintu.** `searchRules()` dijalankan
  pada pertanyaan yang gagal; rule yang nyaris cocok ditawarkan. Daftar kategori
  statis jadi jaring saat hasilnya kosong. Fungsi itu sudah ditulis dan diuji
  sejak awal tapi belum pernah dipanggil di produksi.
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

### Cache dan hemat token

Diminta sebagai deliverable akademik. Yang dinilai rancangan dan buktinya.

- **Pencocokan lewat normalisasi token.** Stopword dibuang, kata sisanya
  diurutkan, hasilnya jadi kunci — `STOPWORDS` EN+ID di `lib/knowledge.ts`
  dipakai ulang. "boleh pakai celana pendek?" dan "apakah celana pendek boleh?"
  bertemu di kunci yang sama. **Nol panggilan API tambahan.**

  Embedding ditolak justru karena alasan akademik: menambah satu panggilan API
  per pertanyaan pada sistem yang tesisnya adalah penghematan token adalah
  pertanyaan sidang yang tidak punya jawaban.
- **`node:sqlite` bawaan Node.** `backend/Dockerfile` memakai `node:24-alpine`,
  jadi modul ini tersedia tanpa dependensi baru — lolos `AGENTS.md` aturan 4
  tanpa menyentuh `package.json`. Butuh volume baru di `docker-compose.yml`.
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
| 4 | Penolakan yang mengalihkan lewat `searchRules()`. | belum |
| 5 | UI per tingkat: ikon + copy di `SourceReference`. | belum |
| 6 | Isi KB: rule baru dengan sumber, dicicil per batch. | belum |
| 7 | Cache SQLite + `GET /api/stats`. | belum |

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
  supaya orang berikutnya tidak menghapusnya karena mengira berlebihan.
  Ditulis bersama PR-7 sebagai ADR-0016.

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
