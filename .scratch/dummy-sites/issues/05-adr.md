# 05 — ADR: tempat fiktif di peta sungguhan

**What to build:** Satu ADR yang mencatat kenapa app yang aturan paling
kerasnya "never invent a rule" menampilkan lima pura yang tidak ada.

**Blocked by:** —

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `docs/adr/0012-dummy-sites.md` (baru).
Nomor dikonfirmasi dulu terhadap isi `docs/adr/` saat menulis.

Ini bukan formalitas. Orang berikutnya yang membuka `dummy-sites.ts` akan
melihat lima pura palsu di repo yang melarang mengarang, lalu punya dua pilihan
— menghapusnya, atau menirunya di area lain. ADR ini yang mencegah keduanya.

- [x] Konteks: `/explore` tidak bisa diperagakan dari luar Bali; `?simulate=`
      memalsukan posisi user dan tidak bisa memperagakan perlintasan Approach
      dengan kaki sendiri
- [x] Keputusan: lima Site fiktif, otomatis, hanya saat Site sungguhan terdekat
      > 50 km, dijangkarkan sekali pada fix `accuracy <= 200 m`
- [x] **Garis yang tidak dilewati**: yang fiktif hanya lokasi dan nama. Customs
      tetap bersumber dan tertaut Rule, `odalan` kosong (ADR-0004), dan `source`
      berisi kalimat penanda — bukan nama sumber sungguhan. Tuliskan alasannya:
      nama fiktif + koordinat fiktif + surat edaran gubernur asli di bawah ikon
      perisai bukan "data dummy", itu klaim palsu berstempel
- [x] Penanda yang menjaganya: kata "Dummy" di dalam nama (ikut ke kelima
      permukaan), kalimat `source`, baris di kepala `ApproachSheet`, dan teks
      `EmptyState` yang diperbaiki
- [x] Konsekuensi yang diterima: user di luar Bali melihat tempat yang tidak
      ada di peta asli. Ambang 50 km adalah yang membatasi siapa itu
- [x] Alternatif yang ditolak dan alasannya: saklar manual (`?demo=1`) — nilai
      demonya sama tapi tidak menolong user sungguhan yang kebingungan melihat
      peta kosong; klon pura asli dengan koordinat dipindah — klaim palsu
      berstempel; nama Bali yang terdengar nyata — hampir pasti ada tempat
      dengan nama itu
- [x] Ditaut dari `spec.md` efort ini dan dari komentar kepala
      `dummy-sites.ts`

## Comments

**2026-08-27 — selesai.** `docs/adr/0012-dummy-sites.md`. Nomor 0006 dipakai
karena 0003 dan 0005 masih terhitung ada di riwayat meski terhapus di working
tree branch ini; memakai ulang nomornya akan bertabrakan.

ADR ini menuliskan satu hal yang belum pernah dirumuskan eksplisit sepanjang
percakapan: **apa persisnya yang dilanggar dan apa yang tidak.** "Never invent a
rule" berbicara tentang klaim kepada pengunjung soal cara bersikap di tempat
suci. Dummy tidak membuat klaim semacam itu yang tidak benar — Customs-nya
bersumber dan berlaku di pura Bali mana pun. Yang dikarang adalah satu titik di
peta. Batas itu dijaga oleh tes, bukan oleh niat baik: nama yang kehilangan kata
"Dummy", `source` yang mulai memuat kata kutipan sungguhan, dan `ruleIds` yang
menunjuk Rule yang tidak ada, ketiganya membuat tes merah.
