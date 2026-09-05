# 01 — Kunci i18n untuk Dummy Sites

**What to build:** Semua teks baru yang dibutuhkan tiket 03 dan 04, ditambahkan
lebih dulu supaya dua tiket itu tidak saling menunggu di berkas yang sama.

**Blocked by:** —

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/lib/i18n.explore.ts` — penambahan
saja, tidak mengubah kunci yang sudah ada.

- [x] `explore.dummy.source` — kalimat penanda yang mengisi field `source`.
      ID: "Situs contoh. Tempat ini tidak nyata; Customs di bawah berlaku umum
      di pura Bali." EN sepadan. Ini tampil di samping ikon `ShieldCheck`, jadi
      kalimatnya harus membantah ikon itu, bukan mengikutinya
- [x] `explore.dummy.sheetNotice` — teks satu baris untuk prop `simulated` di
      `ApproachSheet` saat yang ditampilkan dummy. Pendek: "Situs contoh"
- [x] `explore.dummy.areaLabel` — untuk `areaLabel` kelima dummy
- [x] `explore.dummy.region` — untuk field `region`
- [x] `explore.dummy.none.title` dan `explore.dummy.none.description` —
      pengganti `explore.none.title` / `explore.none.description` saat mode
      dummy aktif. Kalimat pertama tetap benar ("tidak ada situs suci
      **sungguhan** di dekat sini"), kalimat kedua menjelaskan kenapa daftar di
      bawahnya tidak kosong
- [x] `explore.dummy.replace` — label tombol "Letakkan ulang contoh di sekitar
      saya"
- [x] Nama `Pura Dummy 1`…`5` **tidak** masuk i18n: `Site.name` satu string dan
      kata "Dummy" sama di kedua bahasa
- [x] `npm run typecheck` dan `npm run test:run` bersih di `frontend/`

## Comments

**2026-08-27 — selesai.** Tujuh kunci ditambahkan di bawah judul
`// Dummy Sites` menjelang akhir `i18n.explore.ts`, penambahan saja.
`npm run typecheck` bersih, `npm run test:run` 126 lulus.

Satu penyimpangan dari checklist: kata yang dipakai adalah **"dummy"**, bukan
"contoh". Tiket ini ditulis sebelum kata penandanya final di Q26, dan memakai
dua kata untuk satu konsep ("Pura Dummy 1" dengan kalimat "Situs contoh") persis
kebingungan yang penggabungan kata itu dimaksudkan untuk hilangkan.

`explore.dummy.region` berbunyi "Di dekat lokasi Anda" ketimbang meniru bentuk
"Tabanan, Bali". Itu satu-satunya hal yang benar-benar diketahui tentang letak
sebuah dummy, dan mengarang nama kabupaten untuknya adalah mengarang.

**2026-08-27, sesudah tiket 04.** `explore.dummy.source` diubah: "Adat di
bawah" jadi "Adat yang ditampilkan". Barisnya dirender di bawah daftar adat,
bukan di atasnya, jadi "di bawah" menunjuk ke tempat kosong. Ketahuan saat
melihat layar aslinya, tidak dari kode.
