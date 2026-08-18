# 01 — ADR-0005: Explore memberi tahu di Approach, di latar depan saja

**What to build:** Satu ADR yang merekam tiga keputusan sekaligus, karena
ketiganya lahir dari satu argumen yang sama dan memecahnya membuat pembaca masa
depan membaca separuh alasan lalu menyimpulkan yang salah.

**Blocked by:** None — bisa mulai sekarang.

**Status:** claimed — Daniyal

**Owner:** Daniyal

- [ ] `docs/adr/0005-approach-notice-foreground-only.md` ada, `status: accepted`,
      mengikuti format `docs/adr/0003-stylized-svg-map.md`
- [ ] Merekam **dua ambang**: Zone tetap tempat customs berlaku, Approach
      (`radiusM + 400 m`, konstanta global) adalah tempat notice menyala.
      Menyebut kenapa bukan memperbesar Zone (merusak arti Zone yang dipakai di
      seluruh copy dan peta) dan kenapa bukan field per-Site (angkanya akan jadi
      tebakan yang menyamar sebagai data)
- [ ] Merekam **latar depan saja**: tidak ada service worker, manifest, Push,
      Periodic Background Sync. Alasan berbasis dokumentasi: Push mensyaratkan
      notifikasi yang terlihat user, izin terpisah, dan server — artinya posisi
      visitor harus dikirim keluar perangkat, yang membatalkan kalimat privasi
      di Screen A. Konsekuensinya batas ini wajib dikatakan di layar (tiket 03)
- [ ] Merekam **ambang akurasi asimetris**: masuk `jarak + akurasi <= Approach`,
      keluar `jarak - akurasi > Approach + 100`. Menyebut bahwa notice jadi
      telat menyala dan telat padam, dan kenapa itu arah kesalahan yang benar
- [ ] Bagian *Considered options* menyebut opsi yang ditolak beserta alasannya:
      PWA + Push, satu lingkaran diperbesar, `approachM` per-Site, mengabaikan
      `coords.accuracy` seperti kode sekarang
- [ ] Bagian *Consequences* menyebut: `ZoneMap` sengaja tidak menggambar
      Approach, dan `docs/geofencing-ui-prompt.md` §8/§9.1 jadi historis
- [ ] Menyebut hubungannya dengan ADR-0003 (peta) dan ADR-0004 (tidak
      mengklaim yang tidak bisa dipertanggungjawabkan) — ADR-0005 adalah
      penerapan logika yang sama pada sinyal GPS
