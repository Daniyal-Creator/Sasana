# 05 — `geo.ts`: ambang Approach, keyakinan akurasi, perbaikan `formatDistance`

**What to build:** Seluruh logika keputusan geofencing, sebagai fungsi murni,
plus tesnya. Halaman Explore (tiket 06) tidak boleh menghitung apa pun sendiri —
ia hanya memanggil berkas ini.

**Blocked by:** 02 (butuh test runner)

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/lib/geo.ts`,
`frontend/__tests__/geo.test.ts`.

- [x] `APPROACH_BUFFER_M = 400` sebagai konstanta modul; `EXIT_BUFFER_M = 100`
      tetap
- [x] `approachRadiusM(site)` → `site.radiusM + APPROACH_BUFFER_M`
- [x] `hasEnteredApproach(pos, accuracyM, site)` →
      `haversineMeters(pos, site) + accuracyM <= approachRadiusM(site)`
- [x] `hasExitedApproach(pos, accuracyM, site)` →
      `haversineMeters(pos, site) - accuracyM > approachRadiusM(site) + EXIT_BUFFER_M`
- [x] `isInsideZone` **tetap ada dan tetap berarti "customs berlaku"**. Ia tidak
      lagi memicu notice. Beri komentar di atasnya yang mengatakan itu, supaya
      orang berikutnya tidak menyambungnya kembali ke notice
- [~] `hasExitedZone` **tidak jadi dihapus di tiket ini** — dipindahkan ke
      tiket 06. `app/explore/page.tsx` masih memanggilnya dan berkas itu milik
      tiket 06; menghapusnya di sini membuat `main` gagal typecheck di antara
      dua merge. Ditandai `@deprecated` dengan alasannya, dan tiket 06 mencabut
      pemanggil beserta fungsinya sekaligus
- [x] `formatDistance` diperbaiki: `975` sekarang menghasilkan `1000 m`. Harus
      `1 km`. Batas 1000 m dievaluasi **setelah** pembulatan ke 50 m, bukan
      sebelumnya
- [x] `frontend/__tests__/geo.test.ts` mengunci, dengan koordinat tetap (tanpa
      GPS, tanpa mock):
      - `haversineMeters` terhadap jarak yang diketahui, toleransi wajar
      - masuk / tidak masuk Approach tepat di sekitar ambang, dengan akurasi 0
      - akurasi buruk menahan masuk: posisi di dalam Approach dengan akurasi
        besar tetap `false`
      - histeresis: posisi di antara Approach dan Approach + 100 bukan "masuk"
        dan juga bukan "keluar"
      - keluar juga tertahan akurasi buruk
      - `isInsideZone` masih benar di ambang `radiusM`
      - `formatDistance`: 975 → `1 km`; 4100 → `4.1 km` (EN) dan `4,1 km` (ID);
        18000 → `18 km`; 400 → `400 m`
- [x] `npm run test:run` dan `npx tsc --noEmit` di `frontend/` hijau

## Comments

- 2026-08-18 (agent): Selesai. `npm run test:run` → 23/23 lulus (termasuk satu
  tes harness dari tiket 02); `npx tsc --noEmit` bersih.

  Dua penyimpangan, keduanya disengaja:

  1. **`hasExitedZone` belum dihapus** — lihat butir bertanda `[~]` di atas.
     Penghapusannya dipindahkan ke tiket 06 dan sudah ditambahkan ke
     checklist-nya, termasuk izin eksplisit untuk menyentuh `lib/geo.ts` pada
     baris itu saja. Alasannya bukan kerapian: `main` harus tetap hijau di
     setiap commit, dan `page.tsx` bukan milik tiket ini.
  2. **Tes batas tidak diuji tepat di garis.** Helper `northOf` meleset sekitar
     3e-11 m dari target, jadi `<=` pada 800 m gagal karena floating point,
     bukan karena aturannya salah. Batas dipatok setengah meter di kedua sisi
     (799,5 → masuk, 800,5 → belum), yang jauh lebih ketat daripada pembacaan
     GPS mana pun dan tidak menguji model float.

  `formatDistance` sekarang menjatuhkan desimal nol, jadi 975 m terbaca `1 km`,
  bukan `1.0 km` — konsekuensi yang tidak tertulis di tiket tapi mengikuti dari
  hasil yang diminta.

  Belum diverifikasi di browser: perilaku layar belum berubah sama sekali,
  karena `page.tsx` masih memanggil fungsi lama sampai tiket 06.
