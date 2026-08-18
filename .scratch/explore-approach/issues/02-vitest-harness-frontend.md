# 02 — Harness Vitest di frontend

**What to build:** Frontend belum punya test runner sama sekali, padahal
`docs/prd.md` §Testing menyebut logika geofence harus di-unit-test. Tiket ini
memasang harness-nya saja — bukan tesnya. Dua tiket sesudahnya (04 dan 05)
menumpang di atas ini, jadi tiket ini kecil tapi harus mendarat lebih dulu.

Ini pekerjaan mekanis: tiru yang sudah jalan di `backend/`, sesuaikan seperlunya.

**Blocked by:** None — bisa mulai sekarang.

**Status:** ready-for-human — Rekan A

**Owner:** Rekan A

**Berkas yang boleh Anda sentuh:** `frontend/package.json`,
`frontend/vitest.config.mts`, `frontend/__tests__/harness.test.ts`.
Tidak ada yang lain. Kalau terasa perlu, tulis di `## Comments`.

- [ ] `vitest` masuk ke `devDependencies` di `frontend/package.json`, versi
      sama dengan yang dipakai `backend/package.json` supaya tidak ada dua
      versi berbeda di satu repo
- [ ] Script `"test": "vitest"` dan `"test:run": "vitest run"` ada, persis
      seperti di backend
- [ ] `frontend/vitest.config.mts` ada, meniru `backend/vitest.config.mts`,
      dengan dua perbedaan yang disengaja:
      alias `@` menunjuk ke `./src` (frontend punya alias `@/*` di
      `tsconfig.json` — cocokkan ke situ, jangan ditebak), dan blok `env`
      backend **tidak** ikut disalin karena frontend tidak punya `env.ts` yang
      memvalidasi saat import
- [ ] `environment: "node"` — tes yang datang di tiket 04 dan 05 semuanya
      fungsi murni, tidak ada DOM, jadi jangan pasang `jsdom` atau
      `@testing-library`. Kalau nanti ada tes komponen, itu tiket lain
- [ ] `frontend/__tests__/harness.test.ts` berisi satu tes yang membuktikan
      harness-nya benar-benar hidup: impor sesuatu lewat alias `@`
      (contoh: `formatDistance` dari `@/lib/geo`) dan assert satu nilai yang
      sudah pasti benar hari ini, misalnya `formatDistance(400, "en") === "400 m"`.
      Kalau alias-nya salah pasang, tes ini yang gagal, bukan tiket 04/05
- [ ] `npm run test:run` di dalam `frontend/` hijau
- [ ] `npx tsc --noEmit` di dalam `frontend/` bersih

**Catatan:** jangan menyentuh `frontend/src/lib/geo.ts`. Isinya sedang diubah di
tiket 05. Tes harness Anda hanya membacanya.
