# Riset — data yang dibutuhkan untuk `Significance` (tiket 02, 03, 04)

> **Dihentikan 2026-09-10, atas keputusan pemilik.** Riset ini tidak jadi
> dipakai; gelombang pariwisata dihentikan. Dibiarkan utuh karena isinya masih
> berguna terlepas dari gelombangnya: standar sumber yang repo ini tegakkan,
> daftar sumber yang diterima dan ditolak, dan catatan arsip mana yang bisa
> dijangkau dan mana yang mati. Bagian **"Yang sudah dicoba agen"** khususnya
> menghemat waktu siapa pun yang nanti perlu menyumberkan klaim budaya apa pun
> di aplikasi ini, bukan hanya `Significance`.

**Untuk:** Daniyal · **Disiapkan:** 2026-09-10
**Kenapa ada:** agen mencoba menyumber sendiri dan gagal menjangkau arsipnya.
Hasil percobaannya ada di bagian terakhir. Pencarian dari Indonesia kemungkinan
besar berhasil di tempat agen gagal.

---

## Aturan yang menentukan semuanya

Isi dokumen ini akan jadi kalimat yang dibaca pengunjung. `AGENTS.md` melarang
menampilkan apa pun yang tidak tertelusur, dan `rules-sourcing.test.ts` menulis
alasannya:

> *"Rewriting their attribution without reading a real source would be inventing
> one, which is worse than owing it."*

Tiga konsekuensi praktis:

1. **Kutip kalimatnya, jangan diringkas.** Salin kalimat asli dari halamannya,
   apa adanya, beserta URL-nya. Kalau yang sampai ke sini adalah ringkasan, kita
   cuma memindahkan masalah "belum pernah dibaca" satu langkah ke belakang.
2. **Ringkasan AI tanpa tautan tidak terpakai.** Gemini/Google boleh dipakai
   untuk *menemukan* halamannya, tapi yang dikirim balik harus halaman yang
   Anda buka sendiri.
3. **"Tidak ketemu" adalah jawaban yang bagus.** Kolom kosong jauh lebih baik
   daripada kolom terisi yang tidak bisa dipertanggungjawabkan. Site tanpa
   `Significance` tetap tampil normal.

### Sumber yang diterima

- Instansi pemerintah Indonesia: apa pun berakhiran **`.go.id`** — Kemdikbud /
  BPCB Bali, Pemprov Bali, `lovebali.baliprov.go.id`, situs kabupaten
  (`gianyarkab.go.id`, `badungkab.go.id`, `klungkungkab.go.id`, dst)
- **UNESCO** (`whc.unesco.org`) untuk pura di dalam Lanskap Budaya Bali
- Jurnal atau terbitan universitas
- Media arus utama, khusus untuk **tanggal upacara** (Bali Post sudah dipakai
  untuk Odalan Uluwatu)
- Buku terbitan resmi, sebutkan judul, penulis, halaman

### Sumber yang ditolak

Operator tur, blog hotel, agen perjalanan, TripAdvisor, Expedia, artikel yang
ditulis untuk menjual paket. Ini yang mendominasi hasil pencarian biasa: agen
mendapat sembilan dari sembilan hasil jenis ini pada percobaan pertama.
Wikipedia **bukan** sumber akhir, tapi daftar referensi di kakinya sering
menunjuk ke sumber yang benar.

### Yang tidak boleh ditanyakan sama sekali

Pagar volatilitas (ADR-0014) tetap berlaku. **Jangan** cari: jam buka, harga
tiket, biaya, apakah tempatnya ramai, atau apakah tempatnya bagus. Frekuensi
("digelar tiap sore") boleh **hanya** kalau ada sumbernya, dan itu masuk kolom
terpisah di bawah.

---

## A. Prioritas 1 — enam Site yang sudah ada

Ini yang paling berguna: keenamnya sudah tayang, jadi `Significance`-nya
langsung terlihat begitu digabungkan.

Untuk **tiap** pura di bawah, isi empat hal:

| # | Yang dicari | Bentuknya |
| --- | --- | --- |
| 1 | **Apa tempat ini** — kedudukannya dalam praktik Hindu Bali, bukan keindahannya | 1-3 kalimat |
| 2 | **Apa yang orang lakukan di sana** — ritus, praktik, kebiasaan; tanpa jadwal | 1-3 kalimat |
| 3 | **Kutipan asli** yang menopang 1 dan 2 | salin apa adanya |
| 4 | **URL + nama lembaganya** | tautan yang bisa dibuka |

Puranya:

- **Pura Tanah Lot** (Tabanan)
- **Pura Luhur Uluwatu** (Badung) — sekalian: adakah sumber resmi untuk jadwal
  tari kecak? Kalimat "setiap sore" pernah tayang tanpa sumber dan sudah
  diturunkan. Kalau ada sumber resminya, ia boleh kembali.
- **Pura Besakih** (Karangasem)
- **Pura Batu Bolong** (Badung)
- **Pura Tirta Empul** (Gianyar) — khususnya: **urutan pancuran** dalam melukat.
  Agen tidak menemukan satu pun sumber terjangkau yang menyebutkannya.
- **Pura Ulun Danu Beratan** (Tabanan)

Halaman yang paling menjanjikan dan **gagal dibuka dari sini**, layak dicoba
duluan:

```
https://kebudayaan.kemdikbud.go.id/bpcbbali/pura-tirta-empul/
https://kebudayaan.kemdikbud.go.id/bpcbbali/  (telusuri pura lain di sini)
https://diparda.gianyarkab.go.id/destinasi/tirta-empul
https://whc.unesco.org/en/list/1194/
```

---

## B. Prioritas 2 — enam Site kandidat (tiket 03)

Hanya perlu kalau kita jadi menambah katalog. Selain empat kolom di bagian A,
tiap kandidat butuh:

| # | Yang dicari | Catatan |
| --- | --- | --- |
| 5 | **Koordinat resmi** | atau konfirmasi koordinat OSM di bawah |
| 6 | **Kabupaten** | |
| 7 | **Foto berlisensi terbuka** | Wikimedia Commons; catat URL, nama fotografer, lisensinya |

Koordinat yang agen dapat dari OpenStreetMap, **belum diverifikasi**:

| Pura | lat, lng | Catatan |
| --- | --- | --- |
| Pura Taman Ayun | `-8.5418, 115.1725` | Mengwi, Badung |
| Pura Ulun Danu Batur | `-8.2567, 115.3386` | Batur, Bangli |
| Pura Goa Lawah | `-8.5515, 115.4690` | Pesinggahan, Klungkung |
| Pura Lempuyang Luhur | `-8.3952, 115.6481` | **Perlu keputusan**, lihat bawah |
| Pura Taman Saraswati | `-8.5059, 115.2615` | Ubud, Gianyar |
| Pura Gunung Kawi | tidak ketemu | Tampaksiring, Gianyar |

**Keputusan yang perlu diambil soal Lempuyang.** Koordinat di atas adalah
**pura puncaknya**, yang dicapai lewat ribuan anak tangga. Yang didatangi
sebagian besar pengunjung adalah **Pura Penataran Agung Lempuyang** di bawah,
yang punya gapura "Gates of Heaven". Dua tempat berbeda dengan nama mirip.
Pilih salah satu dan sebutkan mana.

---

## C. Prioritas 3 — tiga tanggal Odalan yang kosong (tiket 04)

Untuk **Pura Besakih**, **Pura Batu Bolong**, dan **Pura Ulun Danu Beratan**.

Sebuah tanggal hanya bisa dipakai kalau ketiganya ada. Tanpa salah satunya,
tanggalnya tidak dipakai — ADR-0004 melarang tanggal upacara yang tidak
berjangkar.

| # | Yang dicari | Contoh yang sudah ada |
| --- | --- | --- |
| 8 | **Tanggal** upacara | `2027-02-02` |
| 9 | **Jangkar kalendernya** | "Anggara Kasih Medangsia, tiap 210 hari" |
| 10 | **URL sumbernya** | berita pemkab atau Bali Post |

Pola yang berhasil sebelumnya: cari berita "piodalan" atau "pujawali" pura itu,
catat tanggal yang diberitakan **beserta nama wuku/wewaran-nya**, lalu tanggal
berikutnya dihitung 210 hari. Yang dicatat tetap tanggal berikutnya, bukan
beritanya.

---

## Format kirim balik

Satu blok per pura. Kolom yang tidak ketemu ditulis `tidak ketemu`, jangan
dikosongkan diam-diam — supaya terlihat mana yang sudah dicari dan mana yang
belum.

```
### Pura Tirta Empul

1. Apa tempat ini:
2. Apa yang orang lakukan:
3. Kutipan asli:
   "..."
4. Sumber: <nama lembaga> — <URL>

(kandidat baru saja)
5. Koordinat:
6. Kabupaten:
7. Foto: <URL Wikimedia> — <fotografer> — <lisensi>

(kalau ketemu)
8. Tanggal odalan:
9. Jangkar:
10. URL:
```

---

## Yang sudah dicoba agen, supaya tidak diulang

| Sumber | Hasil dari sini |
| --- | --- |
| `kebudayaan.kemdikbud.go.id` (BPCB Bali) | **DNS tidak menemukan host** |
| `diparda.gianyarkab.go.id` | **HTTP 500** |
| `whc.unesco.org` | **403 Forbidden** |
| `lovebali.baliprov.go.id` | **Terbuka**, tapi hanya satu kalimat deskriptif |

Satu-satunya yang berhasil dibaca, dan yang jadi contoh entri paling minim yang
sah:

> "Locals believe that the sacred water flowing at the Tirta Empul Temple has
> the power to heal and cleanse their bodies and souls."
> — Love Bali, Pemprov Bali

Hasil pencarian juga **meringkaskan** halaman BPCB untuk agen: prasasti
Manukaya, Raja Candrasingha Warmadewa, tahun 884 Saka, tiga kolam, kisah Maya
Denawa dari Usana Bali. Semuanya terdengar seperti sumber kelas satu dan
kemungkinan besar benar — **tidak dipakai**, karena halamannya tidak pernah
terbuka. Kalau Anda bisa membukanya, keterangan itu langsung jadi bahan terbaik
yang kita punya.
