# 06 — Halaman Explore: watch, pemilahan error, akurasi, izin, simulate

**What to build:** Menyambungkan `geo.ts` yang baru ke layar, dan memperbaiki
tiga hal yang membuat Live Mode rapuh di lapangan.

**Blocked by:** 03 (kunci i18n), 05 (fungsi `geo.ts`)

**Status:** ready-for-human — Daniyal

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/app/explore/page.tsx`.
`ZoneMap.tsx` tidak berubah. `sites.ts` tidak berubah — itu tiket 04.

- [ ] Notice menyala lewat `hasEnteredApproach`, tidak lagi lewat `isInsideZone`
- [ ] Set `announced` dibersihkan lewat `hasExitedApproach`, tetap di `useRef`
      dan tetap **tidak** ditulis ke storage apa pun
- [ ] `hasExitedZone` dicabut dari `page.tsx` **dan** dari `lib/geo.ts`.
      Tiket 05 sengaja meninggalkannya bertanda `@deprecated`: ia satu-satunya
      pemanggil, dan menghapus fungsinya lebih dulu akan membuat `main` gagal
      typecheck di antara dua merge. Ini satu-satunya baris di tiket ini yang
      boleh menyentuh `lib/geo.ts`
- [ ] Masuk Zone setelah Approach tidak memicu apa-apa: sheet yang sama tetap
      terbuka, tidak ada penanda kedua
- [ ] `watchPosition` dipanggil dengan
      `{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }`
- [ ] Pemilahan error: `PERMISSION_DENIED` (kode 1) → Explore Mode.
      `POSITION_UNAVAILABLE` (2) dan `TIMEOUT` (3) → watch dibiarkan hidup,
      tampilkan status sinyal. Jangan `clearWatch`
- [ ] Status sinyal muncul kalau `coords.accuracy` di atas 200 bertahan lebih
      dari sekitar 20 detik, memakai `explore.signal.searching.title` dan
      `explore.signal.searching.body` dari tiket 03. Punya ikon dan label teks
      (Guardrail 9: warna tidak pernah jadi satu-satunya sinyal)
- [ ] `navigator.permissions.query({ name: "geolocation" })`: kalau `granted`,
      langsung mulai watch tanpa menampilkan Screen A; kalau `denied`, langsung
      Explore Mode; kalau `prompt`, Screen A seperti biasa. Bungkus dengan
      pengaman — API ini bisa tidak tersedia, dan kegagalannya harus jatuh ke
      perilaku sekarang, bukan ke layar kosong
- [ ] `?simulate=<siteId>` memulai posisi **tepat di luar Approach** lalu
      bergerak masuk, supaya yang tersimulasi adalah perlintasannya, bukan
      hasil akhirnya. Badge "Lokasi simulasi" tetap tampil
- [ ] Jalan keluar dari `explore` kembali ke Live Mode tetap tidak ada di tiket
      ini kecuali lewat muat ulang halaman. Kalau ternyata terasa perlu, itu
      tiket baru, bukan tambahan di sini
- [ ] `npx tsc --noEmit` bersih; diverifikasi di dev server lewat DevTools >
      Sensors dan lewat `?simulate=`
