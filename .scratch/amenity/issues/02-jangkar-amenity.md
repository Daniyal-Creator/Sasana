# 02 — Jangkar Amenity lepas dari Site

**What to build:** Nama daerah yang visitor sebut jadi titik jangkar pencarian
Amenity, lewat Nominatim, dikunci ke Bali dan dijaga daftar putih `addresstype`.

**Blocked by:** —

**Status:** ready-for-agent

**Owner:** Daniyal

**Branch:** `assistant/amenity-anchor`

**Berkas yang boleh disentuh:** `backend/src/lib/places.ts`,
`backend/src/lib/geocode.ts` (baru), `backend/src/routes/chat.ts`,
`backend/src/lib/prompts.ts`, `CONTEXT.md` (penambahan),
`docs/adr/0020-*.md` (baru), tes di `backend/__tests__/`.

## Kenapa

ADR-0015 memutuskan "No Site, no lookup": pertanyaan tentang yang di sekitar
tanpa Site yang menempel ditolak, bukan ditebak lokasinya. Itu keputusan yang
benar untuk saat itu, tapi ia mengunci fitur ini pada enam Site. Visitor yang
bertanya "penginapan dekat Ubud" tidak sedang berdiri di salah satunya.

Yang menggantikan pagarnya bukan kepercayaan pada model, melainkan dua saringan
mekanis dan satu penolakan.

- [ ] `lib/geocode.ts`: Nominatim, `bounded=1` dengan viewbox Bali
      (114,4 / −8,03 / 115,8 / −8,95), User-Agent yang menyebut proyek ini
      (kebijakan Nominatim mewajibkannya), timeout sejalan `places.ts`
- [ ] **Daftar putih `addresstype`**: hanya `city`, `town`, `village`, `suburb`,
      `island`, `county`. Diuji: `Bogor` dengan `bounded=1` mengembalikan sebuah
      *jalan* bernama Bogor di Bali (`addresstype: road`, importance 0,053),
      bukan kosong. Tanpa saringan ini visitor bertanya soal Bogor dan aplikasi
      mendarat di sebuah gang di Bali tanpa memberi tahu siapa pun
- [ ] Ambang `importance` **tidak** dipakai sendirian: angka itu akan menolak
      desa kecil yang sah
- [ ] Ekstraksi nama daerah: regex pola posisi `di|dekat|sekitar|near|around`
      diikuti nama, sejalan bentuk `detectPlaceQuery` yang sudah ada. Pra-pass
      ke Gemini ditolak dengan alasan yang sama seperti ADR-0015 menolak function
      calling: satu round trip tambahan di setiap pertanyaan
- [ ] Urutan mundurnya: regex kena → geocode. Tidak kena → Site aktif bila ada.
      Tidak ada juga → **tolak dan minta visitor menyebut daerahnya.** Tidak
      pernah menebak
- [ ] `display_name` hasil resolve masuk ke prompt dan wajib muncul di jawaban,
      supaya resolve yang keliru terlihat visitor alih-alih senyap
- [ ] Gagal geocode mengembalikan null, bukan melempar — pola `places.ts`:
      server sukarela yang sibuk tidak boleh jadi kartu error
- [ ] `CONTEXT.md`: entri **Amenity**. "Tempat di dekat sebuah Site yang mungkin
      dibutuhkan visitor, penginapan atau tempat makan, dibaca dari
      OpenStreetMap. Tidak membawa Custom apa pun." _Avoid_: POI, destination,
      Site, tempat wisata
- [ ] ADR-0020: menggantikan sebagian ADR-0015. **ADR-0015 tidak disunting** —
      jejak bahwa "No Site, no lookup" pernah jadi keputusan sadar harus tetap
      terbaca
- [ ] Filter tetap hanya kategori, jarak, `cuisine`. Prompt menyebut eksplisit
      bahwa harga, jam buka, dan mutu tidak ada di peta
- [ ] Tes: daftar putih menolak `road`; ekstraksi regex kena dan meleset;
      urutan mundur sampai ke penolakan
- [ ] `npm run typecheck` dan `npm run test:run` bersih di `backend/`

## Comments
