# Spec — Amenity dan Rute

**Owner:** Daniyal · **Branch prefix:** `geofencing/` dan `assistant/`
**Ditetapkan:** 2026-09-09, lewat sesi grilling

Membiarkan visitor melihat tempat sungguhan di sekitar sebuah Site, meminta
saran penginapan atau tempat makan kepada Assistant, lalu menarik rute ke satu
di antaranya. Kosakata: `CONTEXT.md`. Latar belakang: ADR-0014, ADR-0015.

---

## Kenapa

Keluhan aslinya: peta `/explore` "belum ada data tempat sungguhan" seperti
aplikasi peta lain. Rencananya lebih besar dari itu — Assistant menyarankan
tempat sesuai daerah yang visitor sebut, lalu geofence menuntun rute ke sana.

Sebagian besar dari itu ternyata sudah ada. ADR-0015 sudah memasang tier
`places`: Overpass API, radius 3 km, lima terdekat, kategori `lodging` dan
`food`, tidak pernah di-cache, atribusi OSM ikut jawaban. Yang benar-benar
hilang cuma tiga hal, dan cuma satu di antaranya soal peta.

**Peta sudah membawa datanya; kameranya yang tidak pernah ke sana.** Tile OSM
Standard mulai menggambar nama POI pada z17. Diukur langsung pada tile Kuta:

| zoom | POI | Zone (400 m) | Approach (800 m) |
| --- | --- | --- | --- |
| 14 (sekarang) | tidak ada | 85 px | 169 px |
| 15 | tidak ada | 169 px | 339 px |
| 16 | ikon saja, tanpa nama | 339 px | 678 px |
| 17 | ikon **dan nama** | **678 px** | **1355 px** |

`SITE_ZOOM` dan `WALKING_ZOOM` dua-duanya 14, jadi visitor tidak pernah melihat
satu pun nama tempat. Menaikkannya ke 17 begitu saja akan menukar satu masalah
dengan yang lebih buruk: pada layar acuan 375 px (guardrails §6 L5) Zone dan
Approach jadi lebih lebar dari layar dan berhenti terbaca sebagai lingkaran.

---

## Keputusan (Daniyal, 2026-09-09)

### Peta

- **POI datang dari tile, bukan dari layer kita.** Menggambar ulang marker dari
  Overpass berarti menggambar ulang sesuatu yang sudah digambar tile secara
  gratis, dan dua sumber POI di satu layar saling menimpa.
- **Mode "Lihat sekitar" terpisah.** `SITE_ZOOM` tetap 14. Sebuah tombol
  membawa peta ke z17 dan menyembunyikan Zone serta Approach selama mode itu
  aktif. Zone/Approach menjawab "apa yang diharapkan dariku di sini", POI
  menjawab "ada apa di sekitar sini" — dua pertanyaan berbeda yang tidak pernah
  ditanya bersamaan, memperebutkan layar yang sama.
- **Site marker tetap tampak** di dalam mode itu. Melihat sekitar tanpa jangkar
  tempat sakralnya adalah peta tanpa alasan untuk dibuka.
- **Tidak pernah dua sumber POI sekaligus.** "Lihat sekitar" menampilkan label
  tile saja, nol pin kita. "Rute" menampilkan satu pin tujuan dan garis, dengan
  mode Lihat sekitar dimatikan.

### Amenity

- **Kosakata baru: Amenity.** Tempat di dekat visitor yang mungkin ia butuhkan,
  penginapan atau tempat makan, dibaca dari OpenStreetMap. **Tidak membawa
  Custom apa pun, dan tidak punya Zone maupun Approach.** Hotel tidak punya
  adat; melintasi "Approach" sebuah restoran akan memunculkan kartu tanpa isi.
  Masuk `CONTEXT.md` bersama tiket 02, bukan lebih awal.
- **Jangkar tidak lagi wajib menempel ke Site.** ADR-0015 memutuskan "No Site,
  no lookup". Itu dilonggarkan: nama daerah diambil dari pertanyaan lewat regex
  `di|dekat|sekitar|near|around`, lalu di-geocode Nominatim.
- **Terkunci ke bbox Bali** (±114,4–115,8 BT, −8,95–−8,03 LS). Seluruh basis
  pengetahuan bersandar pada Surat Edaran Gubernur Bali No. 7/2025. Peta yang
  melebar tanpa sumber adat yang ikut melebar berarti aplikasi menyebut hotel di
  daerah yang aturannya tidak ia punya.
- **bbox saja bocor, jadi ada penjaga kedua.** Diuji langsung: mencari `Bogor`
  dengan `bounded=1` ke bbox Bali tidak mengembalikan kosong, melainkan sebuah
  *jalan* bernama Bogor di Bali (`addresstype: road`, importance 0,053). Jadi
  hanya `addresstype` dalam daftar putih `city`, `town`, `village`, `suburb`,
  `island`, `county` yang diterima. Orang tidak pernah memaksudkan sebuah gang
  saat menyebut nama daerah.
- **Hasil resolve ditampilkan** (`display_name`), supaya resolve yang keliru
  terlihat visitor alih-alih senyap.
- **Gagal resolve berarti menolak**, bukan menebak. Regex tidak kena → pakai
  Site aktif bila ada; tidak ada juga → minta visitor menyebut daerahnya.
- **Filter hanya pada tag yang benar-benar ada:** kategori, jarak, `cuisine`.
  Harga, rating, "yang bagus", "cocok untuk keluarga" tetap di balik pagar
  volatilitas ADR-0014. OSM tidak menyimpannya, jadi menyaringnya berarti
  mengarang — kegagalan yang persis ADR-0015 dibangun untuk mencegah.

### Rute

- **OSRM demo, profil mobil, diproksi lewat backend** dengan bentuk yang sama
  seperti `lib/places.ts`. Tanpa API key, tanpa kartu, sesuai anggaran Rp 0
  (`docs/tech-spec.md` §5). Frontend adalah static export (ADR-0019), jadi kunci
  API apa pun di sana akan jadi kunci publik.
- **Dilabeli "rute berkendara", tidak pernah "rute" saja.** Diuji langsung:
  server demo mengembalikan hasil identik sampai desimal untuk profil `driving`
  dan `foot` (22817,6 m / 1587 s untuk Kuta → Tanah Lot). Ia melayani profil
  mobil apa pun yang diminta, jadi "rute jalan kaki" akan jadi rute mobil yang
  diberi label salah.
- **OpenRouteService menyusul** kalau rute jalan kaki benar-benar dibutuhkan.
  Ia punya profil jalan kaki sungguhan; harganya sebuah API key di env backend.
- **Polyline dan daftar langkah tertulis. Bukan turn-by-turn.** Navigasi hidup
  adalah produk kedua di dalam produk pertama: re-routing, wake lock, GPS latar
  belakang, dan tanggung jawab kalau visitor salah belok di jalan asing.
- **Gagal berarti garis lurus dengan label wajib** "garis lurus, bukan rute
  jalan", plus jaraknya. Tanpa label, garis lurus berbohong tentang jarak
  tempuh; dengan label ia jadi keterangan yang benar. **Labelnya bagian dari
  fitur, bukan hiasan** — menghapusnya demi tampilan membuat fitur ini berbohong.

### Kontrak

- **`ChatResponse.amenities?: Amenity[]`.** Prosa tetap seperti sekarang, daftar
  terstruktur ikut di sampingnya. Endpoint terpisah ditolak: Amenity hanya
  pernah lahir dari jawaban chat, jadi itu akan jadi endpoint dengan satu
  pemanggil dan tempat kedua bagi bbox serta daftar putih kategori untuk mulai
  berbeda dari aslinya.
- **`Amenity` sebagai `interface` di `shared/contract.ts`.** File itu types
  only; satu nilai runtime saja merusak jaminannya.
- **`Place` di backend berhenti membuang lat/lng.** Sekarang ia menghitung
  jarak lalu membuangnya, dan tanpa koordinat tidak ada pin dan tidak ada rute.

### Proses

- **Dua ADR, bukan satu, dan ADR-0015 tidak disunting.** ADR-0020 untuk Amenity
  dan jangkar geocoding, ADR-0021 untuk routing. Menyunting 0015 di tempat akan
  menghapus jejak bahwa "No Site, no lookup" pernah jadi keputusan sadar beserta
  alasannya; ADR adalah catatan keputusan pada satu waktu. Ini juga pola yang
  repo ini sudah pakai: 0015 *extends* 0014 tanpa menimpanya.
- **Empat tiket, empat branch.** Masing-masing bisa di-merge sendiri dan
  meninggalkan aplikasi dalam keadaan jalan.

---

---

## Revisi setelah dipakai (2026-09-09)

Tiga hal berubah setelah fiturnya dijalankan dengan lokasi sungguhan di Bali.

- **Geometri rute jadi `overview=full`.** `simplified` mengembalikan 31 titik
  untuk rute 34 km, satu titik per 1,1 km, dan garis yang ditarik lewat titik
  sejarang itu memotong blok bangunan alih-alih mengikuti jalan. `full`
  mengembalikan 1571 titik dan menambah sekitar 35 KB per permintaan. Diukur ke
  server sungguhan pada rute yang sama.
- **Kartu tujuan pindah dari peta ke panel.** Melayang, ia menutupi hal yang ia
  jelaskan, harus memotong daftar langkahnya jadi kotak gulir sendiri di dalam
  sheet yang sudah bisa digulir, dan terbaca seperti dialog yang harus ditutup.
  Di panel ia jadi apa adanya: tugas yang sedang dijalani visitor, duduk di atas
  segala yang mungkin ia lakukan berikutnya.
- **Mode "Lihat sekitar" dihapus** atas permintaan pemilik. Konsekuensinya
  dicatat di sini supaya tidak hilang: nama tempat pada tile hanya muncul di
  z17, sementara `SITE_ZOOM` tetap 14, jadi POI tidak lagi berjarak satu ketukan.
  Visitor masih bisa mencubit peta sampai z17 dan melihatnya; yang hilang adalah
  jalan pintasnya, bukan datanya. Kebutuhan yang melahirkan mode itu sekarang
  dijawab dengan cara lain, yaitu Amenity sungguhan yang bisa dituju.

Pintu keluar ke Google Maps ditambahkan berdampingan dengan rute sendiri,
bukan menggantikannya. Alasannya di [ADR-0022](../../docs/adr/0022-a-door-out-to-google-maps.md).

---

## Yang diterima sadar

- **OSRM demo tidak menjanjikan apa pun.** Server sukarela untuk demo dan
  pengujian. Fallback garis lurus adalah harganya; pindah ke ORS adalah jalan
  keluar kalau ia sering gagal.
- **Regex ekstraksi rapuh.** "penginapan di daerah yang sejuk" tidak akan kena.
  Ia menolak alih-alih menebak, dan itu kegagalan yang benar.
- **Daftar putih `addresstype` akan menolak desa kecil yang sah** yang di OSM
  belum punya status administratif.
- **Bogor tidak akan pernah bekerja**, dan itu disengaja. Melebarkan peta tanpa
  melebarkan sumber adat adalah pekerjaan basis pengetahuan, bukan pekerjaan peta.
- **Kewajiban atribusi ODbL sekarang menyentuh tiga hal:** tile, Amenity, dan
  rute.
- **Celah sisa ADR-0015 tidak berubah.** Model masih bisa menyebut nama keenam
  yang tidak ada di daftar, dan tidak ada yang mengeceknya. Dicatat, bukan
  diselesaikan.
- **Cache rute ditunda.** Rute antara dua koordinat tetap jauh lebih stabil
  daripada daftar hotel — jalan berubah dalam hitungan tahun — dan menekan
  server sukarela berulang untuk rute yang sama adalah beban yang tidak perlu.
  Tapi menambahkan cache ke fitur yang belum pernah hidup adalah mengoptimalkan
  sesuatu yang belum ada. Tiket 05 kalau nanti terbukti perlu.

## Yang ini bukan

Bukan aplikasi navigasi. Bukan pencari tempat umum di luar Bali. Bukan pemberi
rekomendasi kualitas. Amenity adalah pelengkap panduan tata krama, bukan produk
kedua di dalam produk pertama.

---

## Tiket

| # | Branch | Isi |
| --- | --- | --- |
| [01](issues/01-mode-lihat-sekitar.md) | `geofencing/nearby-mode` | Tombol "Lihat sekitar", z17, Zone/Approach disembunyikan |
| [02](issues/02-jangkar-amenity.md) | `assistant/amenity-anchor` | Nominatim, bbox Bali, daftar putih, ekstraksi regex, ADR-0020 |
| [03](issues/03-pin-amenity.md) | `assistant/amenity-pins` | `Amenity` di kontrak, `Place` menyimpan lat/lng, satu pin |
| [04](issues/04-rute-amenity.md) | `geofencing/amenity-route` | Proksi OSRM, polyline dan langkah, fallback, ADR-0021 |

Tiket 01 berdiri sendiri sepenuhnya: frontend saja, nol backend, dan ia yang
menjawab keluhan aslinya. Tiga sisanya adalah visi Assistant-nya.
