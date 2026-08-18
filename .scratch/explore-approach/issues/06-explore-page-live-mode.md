# 06 — Halaman Explore: watch, pemilahan error, akurasi, izin, simulate

**What to build:** Menyambungkan `geo.ts` yang baru ke layar, dan memperbaiki
tiga hal yang membuat Live Mode rapuh di lapangan.

**Blocked by:** 03 (kunci i18n), 05 (fungsi `geo.ts`)

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/app/explore/page.tsx`.
`ZoneMap.tsx` tidak berubah. `sites.ts` tidak berubah — itu tiket 04.

- [x] Notice menyala lewat `hasEnteredApproach`, tidak lagi lewat `isInsideZone`
- [x] Set `announced` dibersihkan lewat `hasExitedApproach`, tetap di `useRef`
      dan tetap **tidak** ditulis ke storage apa pun
- [x] `hasExitedZone` dicabut dari `page.tsx` **dan** dari `lib/geo.ts`.
      Tiket 05 sengaja meninggalkannya bertanda `@deprecated`: ia satu-satunya
      pemanggil, dan menghapus fungsinya lebih dulu akan membuat `main` gagal
      typecheck di antara dua merge. Ini satu-satunya baris di tiket ini yang
      boleh menyentuh `lib/geo.ts`
- [x] Masuk Zone setelah Approach tidak memicu apa-apa: sheet yang sama tetap
      terbuka, tidak ada penanda kedua
- [x] `watchPosition` dipanggil dengan
      `{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }`
- [x] Pemilahan error: `PERMISSION_DENIED` (kode 1) → Explore Mode.
      `POSITION_UNAVAILABLE` (2) dan `TIMEOUT` (3) → watch dibiarkan hidup,
      tampilkan status sinyal. Jangan `clearWatch`
- [x] Status sinyal muncul kalau `coords.accuracy` di atas 200 bertahan lebih
      dari sekitar 20 detik, memakai `explore.signal.searching.title` dan
      `explore.signal.searching.body` dari tiket 03. Punya ikon dan label teks
      (Guardrail 9: warna tidak pernah jadi satu-satunya sinyal)
- [x] `navigator.permissions.query({ name: "geolocation" })`: kalau `granted`,
      langsung mulai watch tanpa menampilkan Screen A; kalau `denied`, langsung
      Explore Mode; kalau `prompt`, Screen A seperti biasa. Bungkus dengan
      pengaman — API ini bisa tidak tersedia, dan kegagalannya harus jatuh ke
      perilaku sekarang, bukan ke layar kosong
- [x] `?simulate=<siteId>` memulai posisi **tepat di luar Approach** lalu
      bergerak masuk, supaya yang tersimulasi adalah perlintasannya, bukan
      hasil akhirnya. Badge "Lokasi simulasi" tetap tampil
- [x] Jalan keluar dari `explore` kembali ke Live Mode tetap tidak ada di tiket
      ini kecuali lewat muat ulang halaman. Kalau ternyata terasa perlu, itu
      tiket baru, bukan tambahan di sini
- [x] `npx tsc --noEmit` bersih; diverifikasi di dev server lewat DevTools >
      Sensors dan lewat `?simulate=`

## Comments

- 2026-08-18 (agent): Selesai. `npm run test:run` → 80/80 lulus;
  `npx tsc --noEmit` bersih; diverifikasi di dev server.

  **Yang terbukti di browser:**
  - `?simulate=pura-tanah-lot` berakhir di layar "You are approaching Pura Tanah
    Lot" dengan badge "Simulated location" dan kelima Custom tampil.
  - Permissions API bekerja: browser uji menolak lokasi
    (`navigator.permissions.query` → `state=denied`), dan halaman langsung ke
    Explore Mode tanpa menyodorkan Screen A.
  - Console bersih, tidak ada error.

  **Yang tidak bisa saya potret, dan kenapa:** perlintasan Approach-nya sendiri.
  Jalan simulasi hanya 2,7 detik (4 langkah x 900 ms), sementara satu putaran
  perintah ke browser lebih lama dari itu, jadi setiap pembacaan selalu jatuh
  setelah langkah terakhir. Sifat "mulai di luar Approach" dijamin oleh
  konstruksinya, bukan oleh pengamatan: langkah-langkahnya diturunkan dari
  `approachRadiusM(site)`, dan langkah pertama berada 200 m di luarnya dengan
  akurasi simulasi 15 m, sehingga `hasEnteredApproach` mustahil bernilai true di
  sana. Untuk Tanah Lot (Zone 400 m, Approach 800 m) urutannya 1000 m, 860 m,
  740 m, 350 m — notice menyala di langkah ketiga.

  **Yang belum diverifikasi langsung:** cabang `prompt` (Screen A muncul untuk
  pengunjung yang belum pernah memberi izin) dan status sinyal setelah 20 detik
  akurasi buruk. Browser uji ini terkunci di `denied`, jadi keduanya perlu
  DevTools > Sensors di browser biasa. Kodenya ada dan typecheck bersih, tapi
  saya tidak mengklaim melihatnya.

  Satu keputusan kecil yang saya ambil sendiri: baris status sinyal hanya
  dipasang di layar "Nearby", bukan di Explore Mode. Explore Mode adalah
  penjelajahan manual dan posisi tidak menentukan apa pun di sana, jadi
  memberitahu "sedang mencari lokasi" di layar itu hanya kebisingan.
