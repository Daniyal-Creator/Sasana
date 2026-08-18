# 01 — ADR-0005: Explore memberi tahu di Approach, di latar depan saja

**What to build:** Satu ADR yang merekam tiga keputusan sekaligus, karena
ketiganya lahir dari satu argumen yang sama dan memecahnya membuat pembaca masa
depan membaca separuh alasan lalu menyimpulkan yang salah.

**Blocked by:** None — bisa mulai sekarang.

**Status:** resolved

**Owner:** Daniyal

- [x] `docs/adr/0005-approach-notice-foreground-only.md` ada, `status: accepted`,
      mengikuti format `docs/adr/0003-stylized-svg-map.md`
- [x] Merekam **dua ambang**: Zone tetap tempat customs berlaku, Approach
      (`radiusM + 400 m`, konstanta global) adalah tempat notice menyala.
      Menyebut kenapa bukan memperbesar Zone (merusak arti Zone yang dipakai di
      seluruh copy dan peta) dan kenapa bukan field per-Site (angkanya akan jadi
      tebakan yang menyamar sebagai data)
- [x] Merekam **latar depan saja**: tidak ada service worker, manifest, Push,
      Periodic Background Sync. Alasan berbasis dokumentasi: Push mensyaratkan
      notifikasi yang terlihat user, izin terpisah, dan server — artinya posisi
      visitor harus dikirim keluar perangkat, yang membatalkan kalimat privasi
      di Screen A. Konsekuensinya batas ini wajib dikatakan di layar (tiket 03)
- [x] Merekam **ambang akurasi asimetris**: masuk `jarak + akurasi <= Approach`,
      keluar `jarak - akurasi > Approach + 100`. Menyebut bahwa notice jadi
      telat menyala dan telat padam, dan kenapa itu arah kesalahan yang benar
- [x] Bagian *Considered options* menyebut opsi yang ditolak beserta alasannya:
      PWA + Push, satu lingkaran diperbesar, `approachM` per-Site, mengabaikan
      `coords.accuracy` seperti kode sekarang
- [x] Bagian *Consequences* menyebut: `ZoneMap` sengaja tidak menggambar
      Approach, dan `docs/geofencing-ui-prompt.md` §8/§9.1 jadi historis
- [x] Menyebut hubungannya dengan ADR-0003 (peta) dan ADR-0004 (tidak
      mengklaim yang tidak bisa dipertanggungjawabkan) — ADR-0005 adalah
      penerapan logika yang sama pada sinyal GPS

## Comments

- 2026-08-18 (agent): Selesai. `docs/adr/0005-approach-notice-foreground-only.md`
  mengikuti bentuk ADR-0003 (frontmatter `status: accepted`, Decision /
  Considered options / Consequences).

  Dua hal yang saya tambahkan di luar checklist:

  1. **Opsi kelima di Considered options** — menolak setiap pembacaan di atas
     akurasi tertentu lalu menunggu yang lebih baik. Itu jalan yang paling
     mudah diambil orang berikutnya saat menemui aturan akurasi ini, dan
     kegagalannya (di dalam ruangan pembacaan bagus mungkin tidak pernah
     datang) tidak kelihatan sampai dicoba. Lebih murah ditulis sekali di sini.
  2. **FR3.1 dinyatakan dipersempit oleh ADR ini**, mengikuti cara ADR-0004
     memperlakukan FR3.3 — dipersempit di ADR, bukan dengan mengubah teks PRD.
     ADR-0003 memilih jalan lain (mengubah PRD §8 dan §9); saya ikut pola 0004
     karena yang berubah di sini adalah lingkaran mana yang dipakai, bukan
     teknologi yang disebut PRD. FR3.6 tidak tersentuh: posisi tetap dibaca di
     perangkat dan tetap tidak disimpan.

  Satu kalimat yang sengaja saya masukkan ke Consequences dan bukan sekadar
  catatan: batas latar depan dan kalimat privasi di Screen A adalah **satu**
  keputusan. Kalau nanti Push dipasang tanpa menegosiasi ulang kalimat itu,
  aplikasinya mulai berbohong tanpa ada yang memutuskannya.
