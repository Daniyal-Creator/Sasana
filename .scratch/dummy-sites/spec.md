# Spec — Dummy Sites

**Owner:** Daniyal · **Branch prefix:** `geofencing/` · **Tanggal keputusan:** 2026-08-27

Lima Site contoh yang diletakkan di sekeliling posisi user, dan hanya muncul
ketika tidak ada Site sungguhan di dekatnya. Kosakata: `CONTEXT.md`. Area dan
kepemilikan berkas: `.scratch/geofencing/spec.md`.

---

## Masalah

User yang membuka `/explore` dari luar Bali melihat peta kosong dan daftar pura
sejauh ribuan kilometer. Seluruh fitur geofencing — lingkaran Zone, garis
Approach, sheet yang terbuka sendiri saat dilintasi — tidak pernah bisa dilihat
bekerja. `?simulate=<siteId>` yang sudah ada memindahkan **user ke Bali** dan
memalsukan GPS-nya; itu bagus untuk demo sambil diam, tapi tidak bisa
memperagakan perlintasan Approach dengan kaki sendiri.

Fitur ini kebalikannya: **GPS asli, pura yang diletakkan di dekat user.**

## Prinsip

Yang boleh fiktif hanyalah **lokasi dan namanya**. Setiap kalimat budaya yang
sampai ke layar tetap tunduk pada aturan "never invent a rule" di `AGENTS.md`:
bersumber, tertaut Rule, dan diuji oleh tes yang sama dengan Site sungguhan.

## Keputusan

**Kapan aktif.** Otomatis, tanpa saklar dan tanpa URL param, ketika Site
sungguhan terdekat berjarak **lebih dari 50 km**. Diperiksa **sekali** — pada
fix GPS pertama yang `accuracy <= 200 m` (`LOW_ACCURACY_M` yang sudah ada) —
lalu dikunci sepanjang sesi.

- 50 km, bukan 5 km: pada 5 km, turis yang menginap di Kuta akan melihat lima
  pura palsu di sekelilingnya. Itu persis orang yang produk ini tidak boleh
  bohongi. Pada 50 km, satu-satunya yang melihat dummy adalah orang yang memang
  tidak sedang berada di Bali.
- Sekali, bukan tiap pembaruan posisi: fix yang berayun di sekitar garis 50 km
  akan memunculkan dan menghilangkan lima pura berulang kali.
- Fix pertama yang **layak**, bukan fix pertama apa pun: fix pertama sering
  datang dari menara seluler dan bisa meleset kilometer. Dijangkarkan ke situ,
  kelima pura mendarat di tempat yang salah dan tidak bisa diperbaiki.

**Tanpa izin lokasi, tidak ada dummy.** Seluruh premis fitur ini adalah "di
sekitar user"; tanpa posisi, kata "sekitar" tidak punya arti. Explore Mode
sudah punya jawabannya sendiri: pilih pura dari daftar.

**Geometri: beku, deterministik, dan semuanya mulai di LUAR Approach.**

| # | Arah | Jarak | `radiusM` | Approach | Untuk memicu sheet |
|---|------|-------|-----------|----------|--------------------|
| 1 | 0°   | 900 m | 400 | 800 m | jalan ± 150 m |
| 2 | 72°  | 1,4 km | 300 | 700 m | jalan ± 750 m |
| 3 | 144° | 2,2 km | 500 | 900 m | — |
| 4 | 216° | 3,2 km | 250 | 650 m | — |
| 5 | 288° | 4,5 km | 350 | 750 m | — |

- **Beku**, karena dummy yang dihitung ulang tiap pembaruan posisi ikut lari
  saat user berjalan: jaraknya selamanya tetap, Approach tidak pernah
  terlintasi, dan fiturnya tidak pernah menyala.
- **Semuanya di luar Approach.** Approach = `radiusM + 400`. Dummy terdekat
  pada 500 m dengan `radiusM` 400 berarti Approach 800 m — user sudah di
  dalamnya sejak detik nol, dan `ApproachSheet` menutupi 45–60% layar sebelum
  satu ikon pun terlihat. Yang diminta adalah "user melihat ikon tempat", jadi
  dummy terdekat digeser ke 900 m. Demo instan tetap tersedia lewat
  `?simulate=`, yang memang itu tugasnya.
- **Deterministik**, bukan acak per sesi: acak berarti tidak ada yang tahu apa
  yang akan muncul di layar saat juri melihatnya, dan lima titik acak bisa
  menumpuk di satu sisi.

**Perilaku: ikut penuh.** Dummy diperlakukan sama dengan Site sungguhan —
masuk `nearestSite`, memicu `ApproachBanner` dan `ApproachSheet`, bisa diklik
di peta dan di daftar. Yang dipamerkan adalah fiturnya, bukan ikonnya; ikon
tanpa mesin di belakangnya tidak memperagakan apa pun.

**Daftar: 11 baris, urut jarak apa adanya.** Lima dummy (900 m – 4,5 km) naik
ke atas dengan sendirinya, enam Site sungguhan (ribuan km) turun ke bawah.
Pengelompokan yang diinginkan terjadi tanpa kode pengelompokan. Enam Site
sungguhan **tidak** disembunyikan: orang di luar Bali justru yang paling butuh
fitur "preview before you go" (`docs/prd.md` §F3).

**Penandaan: kata "Dummy" hidup di dalam nama.** `Pura Dummy 1` … `Pura Dummy 5`.

- Tidak ada komponen tag, chip, atau bilah baru. Nama sudah dirender di kelima
  permukaan — baris daftar, `SiteBrief`, kepala `ApproachSheet`,
  `ApproachBanner`, label marker Leaflet — jadi penandaannya ikut ke semuanya
  tanpa satu elemen UI pun ditambahkan, dan tanpa risiko label bertabrakan.
- "Dummy", bukan "Demo" atau "Contoh": terbaca sama di EN dan ID, dan artinya
  "bukan data asli" tanpa bisa dibaca "versi percobaan".
- Nama fiktif yang membosankan adalah fiturnya. Nama pura Bali yang terdengar
  masuk akal hampir pasti benar-benar ada di suatu tempat.

**Dua penanda tambahan, keduanya di permukaan yang sudah ada.**

- `site.source` — field wajib yang **tampil di layar** di `SiteBrief` dan di
  `ApproachSheet`, di samping ikon `ShieldCheck` yang di app ini berarti "ini
  bersumber". Untuk dummy, isinya kalimat penanda, **bukan** nama sumber
  sungguhan. Nama fiktif di koordinat fiktif dengan surat edaran gubernur asli
  sebagai buktinya, di bawah ikon perisai, bukan "data dummy" lagi — itu klaim
  palsu berstempel.
- Prop `simulated` pada `ApproachSheet` yang sudah ada, dinyalakan untuk dummy.
  Alasannya bukan "lebih aman": sheet terbuka pada `PEEK_FRAC` 0,45, dan pada
  tinggi itu baris `source` di kaki sheet belum terlihat.

**`EmptyState` diperbaiki, bukan ditambahi.** Judul "Tidak ada situs suci di
dekat sini" akan berdiri tepat di atas baris "Pura Dummy 1 · 900 m". Teksnya
diganti saat mode dummy aktif supaya layar tidak membantah dirinya sendiri.

**Kode: `SITES` tidak disentuh.** Template hidup di file terpisah dan baru jadi
`Site & { isDummy: true }` setelah ada posisi; penggabungan hanya terjadi di
`page.tsx`. Apa pun yang mengimpor `SITES` — tes, `/explore/[siteId]`, backend
nanti — tidak boleh kebagian pura palsu tanpa memintanya. Menghapus fitur ini
kelak adalah menghapus satu file plus beberapa baris.

**Tes yang sama berlaku.** `site-rules.test.ts` ikut memeriksa dummy: justru
karena Customs-nya asli dengan `ruleIds` asli, dummy menampilkan kalimat budaya
sungguhan ke layar. Tanpa ini ada jalur di mana teks tak bersumber masuk lewat
pintu belakang.

**`odalan: []`.** Mengarang tanggal upacara adalah persis yang dilarang
`docs/adr/0004-no-open-closed-status.md`. Notifikasi odalan sudah punya cara
demonya sendiri lewat `?odalan=1`.

## Yang sengaja TIDAK dilakukan

- `?simulate=` tidak diubah. Dua alat demo dengan tugas berbeda, hidup
  berdampingan: `?simulate=` memindahkan user ke pura asli; dummy memindahkan
  pura ke user.
- `/explore/[siteId]` tidak diubah. Tombol "Lihat semua" disembunyikan untuk
  dummy — halaman itu memanggil `notFound()` untuk id di luar `SITES`, dan
  membuatnya paham dummy berarti membangun ulang seluruh mesin di rute yang
  tidak punya posisi user, demi halaman yang isinya sama dengan sheet.
- Tidak ada reverse-geocoding untuk mengisi `region`. Satu panggilan jaringan,
  satu ketergantungan, dan satu mode gagal baru demi satu baris teks.
- Tidak ada dummy saat user berada di Bali.
- `Site.name` tidak dijadikan `Localized`. Kata "Dummy" sudah netral bahasa.

## Tiket

| # | Judul | Blocked by | Berkas |
|---|-------|-----------|--------|
| 01 | Kunci i18n | — | `frontend/src/lib/i18n.explore.ts` |
| 02 | Data & geometri dummy | — | `frontend/src/data/dummy-sites.ts`, `frontend/__tests__/` |
| 03 | Integrasi di halaman Explore | 01, 02 | `frontend/src/app/explore/page.tsx` |
| 04 | Penandaan di komponen | 01, 02 | `SiteBrief.tsx`, `ApproachSheet.tsx` |
| 05 | ADR | — | `docs/adr/0012-dummy-sites.md` |

---

## Debugging pass, 2026-08-27 (setelah tiket 01 sampai 05)

Menyisir ulang fitur yang baru selesai. Dua bug nyata ditemukan dan diperbaiki,
satu kasus batas diuji dan ternyata sudah benar, dua keterbatasan dicatat
sebagai keterbatasan, bukan bug.

### Diperbaiki

**1. Menekan "Jelajahi situs suci" dari luar Bali menerbangkan peta ke Bali.**
`selectedSiteId` dimulai di `SITES[0]`, dan kamera mode jelajah mengikuti
seleksi itu. Dibuktikan dengan membaca koordinat tile yang sedang dimuat: pusat
peta berada di `-8,61 / 115,07` (Pura Tanah Lot) sementara baris teratas daftar
di bawahnya berbunyi "Pura Dummy 1 · 900 m". Pengunjung dan kelima dummy
tertinggal seribu kilometer di luar layar.

Diperbaiki dengan memindahkan seleksi ke `NEAREST_DUMMY_ID` saat jangkar
dipasang, kecuali pengunjung sudah memilih Site sendiri (`siteChosenByHand`).
`NEAREST_DUMMY_ID` diturunkan dari `DUMMY_PLACEMENTS` dengan mengurutkan jarak,
bukan ditulis tangan, dan ada tes yang gagal kalau konstanta itu berhenti
menunjuk dummy yang benar-benar terdekat.

**2. `aria-label` peta berbunyi "Peta 11 situs suci di Bali"** padahal lima di
antaranya berada di sekitar pengguna. Itu satu-satunya deskripsi yang didapat
pembaca layar, dan isinya salah. Kunci `explore.map.aria.dummy` ditambahkan:
"Peta 11 situs suci, termasuk 5 situs dummy di sekitar Anda".

### Diuji, ternyata sudah benar

**Garis tanggal internasional.** Jangkar di bujur 179,995 membuat dummy 2
mendarat di bujur lebih dari 180. Bujurnya memang keluar dari rentang, tapi
`haversineMeters` menghitung selisihnya dengan benar, jadi jaraknya tetap
akurat. Jangkar "the dateline" sekarang jadi anchor keempat yang permanen di
`dummy-sites.test.ts`.

**Fix pertama yang buruk.** Dengan akurasi 800 m: nol dummy, judul EmptyState
yang lama. Begitu akurasi membaik ke 25 m: kelima dummy muncul dan judulnya
berganti. Jangkar memang menunggu fix yang layak.

**Banner di mode jelajah.** Melintasi Approach sebuah dummy saat sedang
menjelajah memunculkan "Anda sedang mendekati Pura Dummy 1" sebagai banner,
tanpa merebut layar. Daftar tetap di tempatnya.

**Konsol bersih**, tidak ada error di sepanjang seluruh alur.

### Keterbatasan yang dibiarkan, dengan sadar

- **Kalau akurasi tidak pernah mencapai 200 m** (umum di dalam ruangan), dummy
  tidak pernah muncul dan tidak ada kalimat yang menjelaskan kenapa. Yang ada
  hanya `SignalNotice` setelah 20 detik, yang berbunyi "mencari sinyal" dan
  hanya separuh menjelaskan. Memperbaikinya berarti menambah layar keadaan
  baru; kalau ini muncul saat mencoba di sekolah, itu tiket tersendiri.
- **Keputusan dikunci per sesi.** Yang membuka aplikasi di Bali lalu bepergian
  keluar tidak akan mendapat dummy sampai memuat ulang halaman. Ini konsekuensi
  yang sengaja dipilih di Q19 dan tercatat di ADR-0012.
