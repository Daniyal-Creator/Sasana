# 04 — Penandaan dummy di komponen

**What to build:** Tiga perubahan kecil di dua komponen supaya dummy menandai
dirinya di tempat yang sudah ada, tanpa elemen UI baru.

**Blocked by:** 01 (kunci i18n), 02 (`isDummy`)

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/components/explore/SiteBrief.tsx`,
`frontend/src/components/explore/ApproachSheet.tsx`.
`MapLayers.tsx`, `ApproachBanner.tsx`, dan `SiteList` **tidak** berubah — nama
"Pura Dummy N" sudah membawa penandaannya ke sana sendiri.

- [x] `SiteBrief`: tombol "Lihat semua" disembunyikan kalau `site.isDummy`.
      `/explore/dummy-site-1` memanggil `notFound()`, dan 404 di tengah demo
      adalah kegagalan yang paling mahal di fitur ini
- [x] `ApproachSheet`: prop `simulated` yang sudah ada dinyalakan untuk dummy,
      dengan teks `explore.dummy.sheetNotice`. Baris ini ada di **kepala**
      sheet — sheet terbuka pada `PEEK_FRAC` 0,45, dan pada tinggi itu baris
      `source` di kakinya belum terlihat
- [x] Kalau `simulated` sekarang harus membawa dua teks berbeda (lokasi
      simulasi vs situs contoh), ganti jadi prop yang menerima teksnya, bukan
      menambah boolean kedua. Dua boolean yang saling meniadakan adalah bug
      yang menunggu
- [x] Tidak ada tag, chip, atau badge baru di sebelah nama — dibatalkan secara
      sadar; kata "Dummy" ada di dalam nama dan ikut ke kelima permukaan
- [x] Baris `source` tidak diubah bentuknya: ia sudah merender `site.source`,
      dan dummy mengisinya dengan kalimat penanda dari tiket 02
- [x] Diperiksa di lebar mobile dan desktop
- [x] `npm run typecheck` dan `npm run test:run` bersih di `frontend/`

## Comments

**2026-08-27 — selesai.** `SiteBrief.tsx`, `ApproachSheet.tsx`, dan
penyambungannya di `page.tsx` (item yang dipindahkan dari tiket 03).
`npm run typecheck` bersih, `npm run test:run` 201 lulus.

`ApproachSheet` sekarang menerima `notice?: string | null` menggantikan
`simulated?: boolean`. Pemanggilnya yang memiliki kalimatnya; komponen hanya
merendernya kalau ada. Dua boolean bersebelahan yang tidak boleh sama-sama
benar adalah bug yang menunggu, dan sekarang keadaan itu tidak bisa terjadi.

**Dua cacat teks yang hanya kelihatan setelah dilihat di layar, bukan dari
kode.** Keduanya sudah diperbaiki:

1. Baris penanda di `SiteBrief` terbaca **"Sumber: Situs dummy. Tempat ini
   tidak nyata."** Awalan "Sumber:" berasal dari `explore.detail.source`, dan
   ia mengubah satu-satunya baris yang mengaku tempat ini karangan menjadi
   sesuatu yang tampak seperti asal-usulnya. Untuk dummy, `source` kini
   dirender apa adanya tanpa awalan itu. Site sungguhan tidak berubah.
2. Teks `explore.dummy.source` berbunyi "Adat **di bawah** berlaku umum",
   padahal daftar adatnya ada di **atas** baris itu, di `SiteBrief` maupun
   `ApproachSheet`. Diganti jadi "Adat **yang ditampilkan**".

### Verifikasi di browser

- **Dummy, ApproachSheet** — "Situs dummy, bukan tempat nyata" muncul di kepala
  sheet tepat di bawah nama, dan kalimat `source` tetap di kaki. Dua penanda,
  satu di bagian yang terlihat pada tinggi peek
- **Dummy, SiteBrief** — tidak ada tombol "Lihat semua adat di sini", dan tidak
  ada satu pun tautan `/explore/*` di halaman. Pintu ke 404 tertutup
- **Site sungguhan, SiteBrief** — tetap "Sumber: Bali Governor Circular
  No. 7/2025" dan tetap punya tautan ke `/explore/pura-tanah-lot`
- **`?simulate=pura-tanah-lot`** — tetap menampilkan "Lokasi simulasi", lima
  Custom asli, sumber asli, dan **nol dummy**. Refaktor `notice` tidak
  mengubah perilaku lama
