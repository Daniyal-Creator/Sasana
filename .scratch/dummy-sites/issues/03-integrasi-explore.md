# 03 — Integrasi di halaman Explore

**What to build:** Menyambungkan dummy ke mesin yang sudah ada: kapan
dimunculkan, di mana dijangkarkan, dan bagaimana ia masuk ke daftar.

**Blocked by:** 01 (kunci i18n), 02 (`buildDummySites`, `DUMMY_THRESHOLD_M`)

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/app/explore/page.tsx`.
`lib/geo.ts` **tidak** berubah — tidak ada konstanta atau fungsi baru di sana.

- [x] State `dummyAnchor: LatLng | null` di `page.tsx`, awalnya null, dan
      `dummySites` diturunkan lewat `useMemo(() => anchor ? buildDummySites(anchor, lang) : [], [anchor, lang])`.
      **Jangan** simpan hasilnya sebagai state: `source` ikut bahasa, jadi ia
      harus dibangun ulang saat `lang` berganti, sementara `anchor` tetap
      terikat sekali (lihat catatan di tiket 02)
- [x] Dijangkarkan **sekali**, di dalam `handlePosition`, pada fix pertama yang
      `accuracy <= LOW_ACCURACY_M` (konstanta yang sudah ada, jangan tambah yang
      baru). Sebelum fix layak itu datang, peta dan daftar tetap jalan seperti
      sekarang — dummy menyusul, tidak ada layar tunggu
- [x] Di fix jangkar yang sama, sekali juga: kalau
      `nearestSite(p, SITES).distanceM > DUMMY_THRESHOLD_M`, isi `dummySites`;
      kalau tidak, kunci sebagai kosong. Setelah itu **jangan pernah**
      dievaluasi ulang oleh pembaruan posisi — fix yang berayun di sekitar garis
      50 km akan memunculkan dan menghilangkan lima pura berulang kali
- [x] Simulasi (`?simulate=`) tidak pernah memunculkan dummy: jalurnya sudah
      punya Site sendiri, dan dua mekanisme demo di satu layar membingungkan
- [x] `allSites = [...SITES, ...dummySites]` di satu tempat, lalu **keempat**
      pemakaian `SITES` di file ini diganti ke situ: `nearestSite` di
      `handlePosition`, `closest` di `useMemo`, `SiteList` di view `outside`,
      `SiteList` di view `explore`. Melewatkan satu berarti dummy tergambar di
      peta tapi tidak pernah memicu apa pun, atau sebaliknya
- [x] `MapLayers sites={allSites}` — dummy tergambar dengan Zone, Approach, dan
      marker yang sama. Tidak ada gaya khusus untuk dummy (Q10)
- [x] Urutan daftar tetap murni jarak, tanpa pengelompokan: kelima dummy naik ke
      atas dengan sendirinya, keenam Site sungguhan tetap ada di bawah
- [x] `EmptyState` memakai `explore.dummy.none.*` saat `dummySites` tidak
      kosong, dan teks lama saat kosong. Tanpa ini judul "Tidak ada situs suci
      di dekat sini" berdiri tepat di atas "Pura Dummy 1 · 900 m"
- [x] Tombol sekunder "Letakkan ulang contoh di sekitar saya"
      (`explore.dummy.replace`) di bawah daftar, hanya saat `dummySites` tidak
      kosong. Menjangkarkan ulang ke posisi terkini, dan **membersihkan
      `announced` serta `dismissed`** untuk id dummy lama — kalau tidak, dummy
      baru di posisi baru tidak akan pernah memicu sheet
- [x] `SiteBrief` dan `ApproachSheet` menerima prop dari tiket 04 (dikerjakan di tiket 04); sambungkan
      saja di sini, jangan ubah komponennya dari tiket ini
- [x] Diverifikasi manual lewat DevTools > Sensors dengan koordinat di luar
      Bali (mis. Jakarta): lima ikon muncul, sheet **tidak** langsung terbuka,
      daftar berisi 11 baris urut jarak
- [x] Diverifikasi juga dengan koordinat di Bali: tidak ada dummy sama sekali
- [x] `npm run typecheck` dan `npm run test:run` bersih di `frontend/`

## Comments

**2026-08-27 — selesai.** Hanya `explore/page.tsx` yang disentuh. `lib/geo.ts`
tidak berubah, tidak ada konstanta baru: ambang datang dari
`DUMMY_THRESHOLD_M` di tiket 02 dan mutu fix dari `LOW_ACCURACY_M` yang sudah
ada. `npm run typecheck` bersih, `npm run test:run` 201 lulus.

**Satu item dipindahkan ke tiket 04**, yang menyambungkan prop ke `SiteBrief`
dan `ApproachSheet`. Prop itu belum ada, jadi mengoperkannya sekarang tidak
akan lolos typecheck. Perubahan komponen dan penyambungannya sekarang jatuh di
tiket yang sama, yang memang lebih benar.

**Jebakan closure yang harus tetap dijaga.** `handlePosition` ditangkap oleh
`watchPosition` saat watch dimulai dan tidak pernah dilanggan ulang, jadi ia
membaca dummy lewat `dummySitesRef`, bukan dari closure-nya. Kalau suatu saat
ada yang menggantinya dengan membaca `dummySites` langsung, kelima dummy akan
tergambar di peta tapi tidak satu pun pernah menyalakan notice, dan typecheck
tidak akan berkata apa-apa.

**Bug yang tertangkap saat verifikasi di browser, bukan oleh tes.** Berganti
bahasa selagi ApproachSheet terbuka membuat seluruh sheet jadi Indonesia
kecuali baris `source`, yang tetap Inggris. Sebabnya `approachSite` disimpan
sebagai state pada saat perlintasan, jadi ia memegang objek dari bahasa lama;
semua tempat lain menurunkan Site-nya dari `allSites` tiap render dan karena
itu tidak ikut basi. Diperbaiki dengan `approachSiteLive`, yang mencari ulang
Site itu berdasarkan id.

### Verifikasi di browser (dev server, geolocation di-stub)

- **Jakarta, fix 25 m** — peta memuat 11 penanda, `aria-label` berbunyi "Peta
  11 situs suci di Bali", ApproachSheet **tidak** terbuka. Daftar terdekat:
  Pura Dummy 1 (900 m), 2 (1,4 km), 3 (2,2 km) — persis tabel di `spec.md`
- **Berjalan 150 m ke utara** — ApproachSheet terbuka di Pura Dummy 1 dengan
  tiga Custom dan baris penanda `source`. Ini perlintasan Approach yang
  seluruh fitur ini ada untuk memperagakannya
- **Ganti bahasa** — seluruh sheet ikut, termasuk baris `source` (setelah
  perbaikan di atas)
- **Denpasar** — nol dummy, enam pura asli, teks EmptyState yang lama, tanpa
  tombol letakkan ulang. Ini penjaga kejujurannya
- **Menjauh 3 km lalu Letakkan ulang** — dummy tetap di tempat saat berjalan
  (beku, seperti seharusnya), lalu kembali ke 900 m / 1,4 km / 2,2 km di
  sekitar posisi baru setelah tombol ditekan
