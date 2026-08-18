# 05 — `geo.ts`: ambang Approach, keyakinan akurasi, perbaikan `formatDistance`

**What to build:** Seluruh logika keputusan geofencing, sebagai fungsi murni,
plus tesnya. Halaman Explore (tiket 06) tidak boleh menghitung apa pun sendiri —
ia hanya memanggil berkas ini.

**Blocked by:** 02 (butuh test runner)

**Status:** claimed — Daniyal

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/lib/geo.ts`,
`frontend/__tests__/geo.test.ts`.

- [ ] `APPROACH_BUFFER_M = 400` sebagai konstanta modul; `EXIT_BUFFER_M = 100`
      tetap
- [ ] `approachRadiusM(site)` → `site.radiusM + APPROACH_BUFFER_M`
- [ ] `hasEnteredApproach(pos, accuracyM, site)` →
      `haversineMeters(pos, site) + accuracyM <= approachRadiusM(site)`
- [ ] `hasExitedApproach(pos, accuracyM, site)` →
      `haversineMeters(pos, site) - accuracyM > approachRadiusM(site) + EXIT_BUFFER_M`
- [ ] `isInsideZone` **tetap ada dan tetap berarti "customs berlaku"**. Ia tidak
      lagi memicu notice. Beri komentar di atasnya yang mengatakan itu, supaya
      orang berikutnya tidak menyambungnya kembali ke notice
- [ ] `hasExitedZone` dihapus, karena garis keluar sekarang diukur dari
      Approach. Pastikan tidak ada pemanggil tersisa
- [ ] `formatDistance` diperbaiki: `975` sekarang menghasilkan `1000 m`. Harus
      `1 km`. Batas 1000 m dievaluasi **setelah** pembulatan ke 50 m, bukan
      sebelumnya
- [ ] `frontend/__tests__/geo.test.ts` mengunci, dengan koordinat tetap (tanpa
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
- [ ] `npm run test:run` dan `npx tsc --noEmit` di `frontend/` hijau
