# 07 — Dokumen: cara pakai `?simulate=` + catatan kepala di brief lama

**What to build:** Dua tulisan pendek. Tidak ada kode.

**Blocked by:** 06 (perilaku `?simulate=` baru final di sana)

**Status:** ready-for-human — Rekan B

**Owner:** Rekan B

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

- [ ] Satu bagian pendek menjelaskan
      `http://localhost:3000/explore?simulate=<siteId>`, dengan satu contoh id
      yang benar-benar ada di `frontend/src/data/sites.ts` (misalnya
      `pura-tanah-lot`) — buka berkasnya dan salin id-nya, jangan mengarang
- [ ] Menyebut bahwa layar menampilkan badge "Lokasi simulasi" selama mode ini
      aktif, jadi tidak ada yang bisa salah mengira itu posisi sungguhan
- [ ] Menyebut alternatif tanpa simulate: Chrome DevTools > Sensors, override
      lokasi ke koordinat Site
- [ ] Tidak menjanjikan yang tidak ada: notice hanya bekerja selagi halaman
      terbuka, dan tidak ada notifikasi latar belakang

## Bagian 2 — `docs/geofencing-ui-prompt.md`

Berkas itu adalah surat tugas pada satu tanggal, bukan spek yang dirawat terus.
Setelah tiket 05 dan 06, §8 (tanda tangan `geo.ts`) dan §9.1 (state machine)
tidak lagi menggambarkan kode.

- [ ] Sebuah catatan pendek di paling atas berkas, sebelum judul isinya, yang
      mengatakan: dokumen ini historis, ia merekam perintah kerja pada
      2026-08-13, dan perilaku terkini ada di
      `docs/adr/0005-approach-notice-foreground-only.md`
- [ ] Menyebut spesifik bagian mana yang sudah usang (§8 dan §9.1) supaya orang
      tidak membaca sisanya dengan curiga — §4 sampai §7 masih berlaku
- [ ] **Isi dokumennya tidak ditulis ulang dan tidak dihapus.** Nilai berkas ini
      justru pada apa adanya, termasuk instruksi seperti "jangan pasang
      dependency" yang menjelaskan kenapa peta digambar tangan
