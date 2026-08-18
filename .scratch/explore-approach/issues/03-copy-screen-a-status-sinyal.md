# 03 — Copy Screen A + kunci status sinyal

**What to build:** Dua perubahan kata di `frontend/src/lib/i18n.explore.ts`,
dua bahasa. Tidak ada JSX, tidak ada logika. Tapi ini bukan pekerjaan kosmetik:
kalimat pertama menutup satu janji yang saat ini tidak ditepati aplikasi.

Layar izin (`/explore`, Screen A) menjanjikan "Satu pemberitahuan saat Anda
mendekati situs". Yang tidak dikatakannya: pemberitahuan itu hanya bekerja
selagi halaman ini terbuka di layar. Web tidak punya cara memberi tahu dari
latar belakang tanpa mengirim posisi visitor ke server, dan itu sengaja tidak
kami lakukan (lihat ADR-0005 dari tiket 01). Jadi batasnya harus tertulis.

**Blocked by:** None — bisa mulai sekarang.

**Status:** ready-for-human — Rekan B

**Owner:** Rekan B

**Berkas yang boleh Anda sentuh:** `frontend/src/lib/i18n.explore.ts`. Hanya itu.

- [ ] `explore.permission.feature1.body` diubah supaya menyebut batas
      "selama halaman ini terbuka" **di dalam kalimat yang sama** dengan
      janjinya. Bukan baris keempat baru, bukan dipindah ke kartu privasi
- [ ] Dua kunci baru ditambahkan, dengan nama **persis** seperti ini karena
      tiket 06 sudah menulis kode terhadap keduanya:
      - `explore.signal.searching.title`
      - `explore.signal.searching.body`
      Isinya: judul pendek yang mengatakan aplikasi sedang menunggu posisi yang
      cukup pasti, dan satu kalimat yang menjelaskan kenapa tanpa menyalahkan
      visitor dan tanpa istilah teknis. Kata "akurasi", "GPS", "sinyal lemah",
      dan angka meter tidak muncul di teks yang dibaca visitor
- [ ] Semuanya ada dalam EN dan ID
- [ ] `npx tsc --noEmit` di `frontend/` bersih (tipe `ExploreKey` ikut bertambah
      sendiri karena `satisfies`, jadi salah ketik nama kunci akan ketahuan)

**Aturan copy yang mengikat** (`docs/design-guardrails.md`, dan §5 poin 10 di
`docs/geofencing-ui-prompt.md`):
- Tanpa em dash, tanpa tanda seru, tanpa ALL CAPS, tanpa emoji
- Tanpa kata pemasaran ("seamless", "otomatis", "canggih", "real-time")
- Mulai dari apa yang terjadi atau apa yang bisa dilakukan visitor, jangan dari
  apa yang gagal
- Indonesia harus terdengar seperti orang lokal yang tenang dan tahu, bukan
  terjemahan mesin. Bandingkan dengan entri yang sudah ada di berkas itu

**Cara melihat hasilnya:** `npm run dev` di `frontend/`, buka
`http://localhost:3000/explore`. Screen A muncul pertama. Ganti bahasa lewat
tombol di header untuk mengecek versi ID. Kunci `explore.signal.*` belum
dipakai di layar mana pun sampai tiket 06 mendarat — itu normal.
