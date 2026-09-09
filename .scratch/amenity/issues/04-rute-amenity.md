# 04 — Rute ke sebuah Amenity

**What to build:** Proksi OSRM di backend, polyline dan daftar langkah tertulis
di peta, dengan fallback garis lurus berlabel saat rute tidak tersedia.

**Blocked by:** 03

**Status:** resolved

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

- [x] `lib/route.ts`: OSRM demo, `steps=true`, timeout sejalan `places.ts`,
      User-Agent yang menyebut proyek ini
- [x] Gagal mengembalikan null, bukan melempar — tapi **tidak** senyap. Berbeda
      dari Overpass, di sini visitor secara eksplisit menekan tombol minta rute,
      jadi diam bukan pilihan
- [x] Fallback: garis lurus dan jaraknya, dengan label wajib **"garis lurus,
      bukan rute jalan"**. Tanpa label ia berbohong tentang jarak tempuh; dengan
      label ia keterangan yang benar. **Label ini bagian dari fitur** — kalau
      nanti dihapus demi tampilan, fitur ini mulai berbohong
- [x] Label rute berbunyi **"rute berkendara"**, tidak pernah "rute" saja
- [x] Polyline plus daftar langkah tertulis yang bisa di-scroll. **Bukan
      turn-by-turn**: re-routing, wake lock, GPS latar belakang, dan tanggung
      jawab kalau visitor salah belok adalah produk kedua, bukan fitur
- [x] Satu tujuan pada satu waktu. Mode "Lihat sekitar" mati selama rute tampil
- [x] ADR-0021: keputusan routing, termasuk kenapa deep link ke aplikasi peta
      luar ditolak dan kenapa OpenRouteService adalah jalan keluar berikutnya
      kalau rute jalan kaki dibutuhkan
- [x] Atribusi OSM menutupi rute juga: data jalannya OSM, ODbL yang sama
- [x] Tes: parser respons OSRM; fallback terpicu saat gagal; label fallback ada
      dalam kedua bahasa
- [x] `npm run typecheck` dan `npm run test:run` bersih di kedua workspace

## Comments

**2026-09-09 — selesai.** `npm run typecheck` bersih di kedua workspace,
`npm run test:run` 565 di backend dan 346 di frontend. ADR-0021 ditulis.

Diverifikasi di browser dengan `?simulate=pura-tanah-lot` untuk mendapat posisi
tanpa izin geolokasi, dan `/api/route` disadap supaya backend tidak perlu hidup:
rute solid mengikuti jalan dengan ringkasan "3.1 km by car, about 7 min" dan
empat langkah tertulis; router digagalkan, dan yang muncul garis putus-putus
menembus blok bangunan dengan kalimat "No road route available. The line shown
is straight, not a road, and measures 950 m direct." Perbedaan solid-mengikuti-
jalan lawan putus-putus-menembus terlihat langsung di layar.

**Satu hal yang tidak ada di tiket dan seharusnya ada.** Aplikasi menjanjikan
posisi visitor "tidak pernah dikirim ke mana pun". Tombol rute mengirimkannya ke
OSRM, jadi janji itu akan jadi salah begitu fitur ini hidup. Dua kunci copy
dipersempit — `explore.permission.privacy` dan `explore.guide.privacy.body` —
supaya menyebut satu hal yang mengirimnya. Layar itu ada untuk mendapatkan izin;
janji yang diam-diam berhenti benar lebih buruk daripada tidak pernah dibuat.

**Satu keputusan bentuk.** OSRM tidak mengembalikan kalimat, hanya
`maneuver.type` dan `modifier`. Kosakatanya diciutkan server ke empat belas nilai
dan kalimatnya disusun frontend lewat i18n, jadi bahasanya tetap di satu tempat.
Kartu mencari kunci itu lewat string dengan cast, yang lolos type checker — maka
ada tes yang exhaustive by construction: menambah manuver di kontrak tanpa
menambah kuncinya gagal dikompilasi.
