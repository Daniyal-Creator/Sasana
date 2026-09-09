# 04 — Rute ke sebuah Amenity

**What to build:** Proksi OSRM di backend, polyline dan daftar langkah tertulis
di peta, dengan fallback garis lurus berlabel saat rute tidak tersedia.

**Blocked by:** 03

**Status:** ready-for-agent

**Owner:** Daniyal

**Branch:** `geofencing/amenity-route`

**Berkas yang boleh disentuh:** `backend/src/lib/route.ts` (baru),
`backend/src/routes/route.ts` (baru), `backend/src/app.ts`,
`shared/contract.ts`, `frontend/src/components/explore/*`,
`frontend/src/lib/i18n.explore.ts` (penambahan saja),
`docs/adr/0021-*.md` (baru), tes di kedua workspace.

## Kenapa diproksi, dan kenapa mobil

Frontend adalah static export (ADR-0019), jadi kunci API apa pun di sana adalah
kunci publik. OSRM demo memang tidak butuh kunci, tapi proksi tetap dipakai:
bentuknya sama dengan `lib/places.ts`, dan ia yang memegang User-Agent jujur
serta jadi tempat cache bernaung kalau nanti dibutuhkan.

Profil mobil bukan pilihan, melainkan yang tersedia. Diuji Kuta → Tanah Lot:

```
driving: distance 22817.6 m, duration 1587 s, weight 1674.4
foot:    distance 22817.6 m, duration 1587 s, weight 1674.4
```

Identik sampai desimal. Server demo melayani profil mobil apa pun nama profil
yang diminta.

- [ ] `lib/route.ts`: OSRM demo, `steps=true`, timeout sejalan `places.ts`,
      User-Agent yang menyebut proyek ini
- [ ] Gagal mengembalikan null, bukan melempar — tapi **tidak** senyap. Berbeda
      dari Overpass, di sini visitor secara eksplisit menekan tombol minta rute,
      jadi diam bukan pilihan
- [ ] Fallback: garis lurus dan jaraknya, dengan label wajib **"garis lurus,
      bukan rute jalan"**. Tanpa label ia berbohong tentang jarak tempuh; dengan
      label ia keterangan yang benar. **Label ini bagian dari fitur** — kalau
      nanti dihapus demi tampilan, fitur ini mulai berbohong
- [ ] Label rute berbunyi **"rute berkendara"**, tidak pernah "rute" saja
- [ ] Polyline plus daftar langkah tertulis yang bisa di-scroll. **Bukan
      turn-by-turn**: re-routing, wake lock, GPS latar belakang, dan tanggung
      jawab kalau visitor salah belok adalah produk kedua, bukan fitur
- [ ] Satu tujuan pada satu waktu. Mode "Lihat sekitar" mati selama rute tampil
- [ ] ADR-0021: keputusan routing, termasuk kenapa deep link ke aplikasi peta
      luar ditolak dan kenapa OpenRouteService adalah jalan keluar berikutnya
      kalau rute jalan kaki dibutuhkan
- [ ] Atribusi OSM menutupi rute juga: data jalannya OSM, ODbL yang sama
- [ ] Tes: parser respons OSRM; fallback terpicu saat gagal; label fallback ada
      dalam kedua bahasa
- [ ] `npm run typecheck` dan `npm run test:run` bersih di kedua workspace

## Comments
