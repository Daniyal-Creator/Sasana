# 01 — Mode "Lihat sekitar"

**What to build:** Sebuah tombol di peta `/explore` yang membawa kamera ke z17,
tempat tile OSM mulai menggambar nama POI, dan menyembunyikan Zone serta
Approach selama mode itu aktif.

**Blocked by:** —

**Status:** resolved

**Owner:** Daniyal

**Branch:** `geofencing/nearby-mode`

**Berkas yang boleh disentuh:**
`frontend/src/lib/nearby.ts` (baru),
`frontend/src/components/explore/NearbyToggle.tsx` (baru),
`frontend/src/components/explore/BaseMap.tsx`,
`frontend/src/components/explore/MapLayers.tsx`,
`frontend/src/app/explore/page.tsx`,
`frontend/src/lib/i18n.explore.ts` (penambahan saja),
`frontend/src/app/globals.css` (penambahan saja, selector di bawah `.explore-map`).

## Kenapa mode, bukan sekadar menaikkan zoom

Tile OSM Standard baru menggambar nama POI pada z17, dan pada z17 Zone sebuah
Site berdiameter 678 px sementara Approach 1355 px. Layar acuan proyek ini
375 px (guardrails §6 L5). Menaikkan `SITE_ZOOM` begitu saja akan diam-diam
merusak fitur inti demi fitur pendukung: kedua lingkaran berhenti terbaca
sebagai lingkaran dan tinggal jadi semburat warna.

- [x] `lib/nearby.ts`: `NEARBY_ZOOM = 17` dengan komentar yang menyebut angka
      terukurnya. Aturan "jangan pernah zoom keluar" pindah ke `BaseMap`,
      lihat catatan di bawah
- [x] `BaseMap`: prop `zoomAtLeast: number | null`, sebuah **lantai** dan bukan
      zoom pasti. Saat jadi angka, kamera datang sedekat itu sambil
      mempertahankan apa yang sedang dibidik; saat kembali null, ia pulang ke
      zoom yang diingatnya. Ini perilaku kamera, yang memang tugas BaseMap
- [x] Flag `programmatic` harus diset sebelum zoom, kalau tidak `zoomstart`
      akan membaca gerakan kamera sendiri sebagai visitor mengambil alih dan
      mematikan follow-mode
- [x] `MapLayers`: prop `nearby: boolean`. Zone dan Approach diberi
      `className: "sasana-zone"`, dan kelas `sasana-zones-off` di-toggle pada
      container. Disembunyikan lewat kelas, bukan dengan membangun ulang group
      — pola yang sama dengan `sasana-labels-off` yang sudah ada di berkas itu
- [x] **Site marker tetap tampak.** Melihat sekitar tanpa jangkar tempat
      sakralnya adalah peta tanpa alasan untuk dibuka
- [x] `NearbyToggle.tsx`: tombol sebagai child `BaseMap`, di atas tombol lokasi,
      ikut `bottomInset` supaya tidak tenggelam di balik sheet
- [x] Guardrail C6 tetap berlaku di dalam carve-out: status aktif tidak boleh
      dibawa warna saja. `aria-pressed` plus perubahan yang terlihat selain hue
- [x] Memilih sebuah Site mematikan mode. Memilih Site berarti "ceritakan tempat
      ini", dan Zone serta Approach adalah jawabannya
- [x] Kunci i18n baru dwibahasa, penambahan saja: label tombol dan keterangan
      satu baris yang menjelaskan Zone sedang disembunyikan
- [x] Copy tunduk W1–W6: tanpa em dash, tanpa isian pemasaran
- [x] Tes: kunci i18n ada di `en` dan `id`, dan pengukuran yang jadi alasan
      mode ini dikunci sebagai tes
- [x] `npm run typecheck` dan `npm run test:run` bersih di `frontend/`

## Comments

**2026-09-09 — selesai.** `npm run typecheck` bersih, `npm run test:run`
299 lulus (dari 294). Diverifikasi di peta sungguhan pada z17: nama tempat
muncul ("Pura Batu Bolong", "Pura Penataran", "Sunset Terrace Tanah Lot"),
Zone dan Approach hilang, Site marker tetap ada, dan mematikan mode
mengembalikan kamera ke z14 dengan kedua lingkaran kembali.

**Tiga penyimpangan dari checklist.**

`enterNearbyZoom` tidak jadi ada. Aturannya — jangan pernah menarik keluar
visitor yang sudah lebih dekat — butuh zoom saat ini, dan satu-satunya yang tahu
zoom saat ini adalah `BaseMap`. Menyimpannya di `lib/nearby.ts` berarti dua
definisi untuk satu aturan, jadi `zoomAtLeast` jadi lantai dan `Math.max` hidup
di tempat angkanya diketahui. Yang tinggal di `lib/nearby.ts` adalah bagian yang
memang milik SASANA: angka hasil pengukuran, dan alasannya.

`zoomKeeping` sempat masuk dependency list efeknya, dan itu bug: identitasnya
ikut berubah setiap inset berubah, dan di ponsel sheet mengubah inset terus
menerus. Sekarang dibaca lewat ref, pola yang sama dengan `handlers` di berkas
yang sama.

Zoom yang mempertahankan titik bidik ditambahkan setelah melihat layarnya.
`setZoom` saja menahan titik tengah kontainer, bukan titik yang sedang dibidik,
dan karena panel menutupi kiri peta, menekan tombol di Tanah Lot mendarat di
laut. Ketahuan dari layar, bukan dari kode.

**Catatan alat, bukan aplikasi.** Zoom beranimasi Leaflet bersandar pada
`requestAnimationFrame`, yang berhenti saat pane browser tidak dirender. Selama
pengujian itu terlihat persis seperti tombol yang tidak berfungsi. Dengan pane
tampak, animasinya selesai normal. Tidak ada yang perlu diperbaiki di aplikasi.
