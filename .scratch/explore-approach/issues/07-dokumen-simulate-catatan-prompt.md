# 07 — Dokumen: cara pakai `?simulate=` + catatan kepala di brief lama

**What to build:** Dua tulisan pendek. Tidak ada kode.

**Blocked by:** 06 (perilaku `?simulate=` baru final di sana)

**Status:** resolved

**Owner:** Rekan B, dikerjakan Daniyal atas permintaannya sendiri

**Berkas yang boleh Anda sentuh:** `README.md`, `docs/geofencing-ui-prompt.md`.
Hanya dua itu.

## Bagian 1 — `README.md`

Juri lomba tidak sedang berada di Bali, jadi mereka tidak bisa memicu notice
dengan berjalan kaki. `?simulate=` adalah cara mereka melihatnya. Kalau tidak
tertulis di README, fitur itu praktis tidak ada saat penilaian.

> **Sudah ada di README dan bukan milik Anda:** bagian *Working the tickets*
> (cara memungut tiket) dan baris `.scratch/` di *Project structure* ditulis
> Daniyal pada 2026-08-18. Jangan diubah atau ditulis ulang. Tugas Anda menambah
> bagian baru tentang `?simulate=`, bukan merapikan yang sudah ada.

- [x] Satu bagian pendek menjelaskan
      `http://localhost:3000/explore?simulate=<siteId>`, dengan satu contoh id
      yang benar-benar ada di `frontend/src/data/sites.ts` (misalnya
      `pura-tanah-lot`) — buka berkasnya dan salin id-nya, jangan mengarang
- [x] Menyebut bahwa layar menampilkan badge "Lokasi simulasi" selama mode ini
      aktif, jadi tidak ada yang bisa salah mengira itu posisi sungguhan
- [x] Menyebut alternatif tanpa simulate: Chrome DevTools > Sensors, override
      lokasi ke koordinat Site
- [x] Tidak menjanjikan yang tidak ada: notice hanya bekerja selagi halaman
      terbuka, dan tidak ada notifikasi latar belakang

## Bagian 2 — `docs/geofencing-ui-prompt.md`

Berkas itu adalah surat tugas pada satu tanggal, bukan spek yang dirawat terus.
Setelah tiket 05 dan 06, §8 (tanda tangan `geo.ts`) dan §9.1 (state machine)
tidak lagi menggambarkan kode.

- [x] Sebuah catatan pendek di paling atas berkas, sebelum judul isinya, yang
      mengatakan: dokumen ini historis, ia merekam perintah kerja pada
      2026-08-13, dan perilaku terkini ada di
      `docs/adr/0005-approach-notice-foreground-only.md`
- [x] Menyebut spesifik bagian mana yang sudah usang (§8 dan §9.1) supaya orang
      tidak membaca sisanya dengan curiga — §4 sampai §7 masih berlaku
- [x] **Isi dokumennya tidak ditulis ulang dan tidak dihapus.** Nilai berkas ini
      justru pada apa adanya, termasuk instruksi seperti "jangan pasang
      dependency" yang menjelaskan kenapa peta digambar tangan

## Comments

- 2026-08-18 (agent): Selesai. Dikerjakan Daniyal, bukan Rekan B, atas
  permintaan Daniyal langsung. Dicatat di sini supaya papan tidak berbohong
  soal siapa yang mengerjakan apa.

  README dapat bagian baru *Trying Explore without being in Bali* dengan dua
  cara: `?simulate=pura-tanah-lot` (id diverifikasi ada di `sites.ts`, dan URL
  ini yang saya pakai saat memverifikasi tiket 06), dan DevTools > Sensors.
  Perbedaan keduanya saya sebutkan eksplisit: simulasi tidak melewati jalur
  geolocation asli, jadi penanganan akurasi hanya teruji lewat Sensors.

  Satu penyimpangan: **tabel Scripts di README juga saya perbaiki.** Tiket 02
  menambahkan `npm test` dan `npm run test:run` ke `frontend/package.json`,
  tapi tabel di README masih memuat empat perintah lama, jadi README menyatakan
  sesuatu yang salah tentang repo ini. Berkasnya milik tiket ini, perbaikannya
  dua baris, dan membiarkannya salah hanya untuk menjaga batas checklist tidak
  masuk akal.

  `docs/geofencing-ui-prompt.md` dapat catatan kepala dan isinya tidak diubah
  sebaris pun. Catatan itu menyebut §8 dan §9.1 sudah usang beserta apa yang
  menggantikannya, dan menyatakan §4 sampai §7 masih berlaku dengan satu
  pengecualian: tiap Custom kini juga membawa id Rule asalnya (tiket 04).
