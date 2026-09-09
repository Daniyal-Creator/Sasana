# 03 — Amenity sampai ke peta sebagai pin

**What to build:** Koordinat Amenity menyeberang dari backend ke frontend lewat
kontrak, dan satu tujuan terpilih digambar sebagai pin di peta.

**Blocked by:** 02

**Status:** resolved

**Owner:** Daniyal

**Branch:** `assistant/amenity-pins`

**Berkas yang boleh disentuh:** `shared/contract.ts`,
`backend/src/lib/places.ts`, `backend/src/routes/chat.ts`,
`frontend/src/components/explore/MapLayers.tsx`,
`frontend/src/app/explore/page.tsx`, `frontend/src/lib/i18n.explore.ts`
(penambahan saja), tes di kedua workspace.

## Kenapa

`Place` menghitung jarak lalu **membuang** lat/lng, dan `ChatResponse` cuma
membawa prosa. Tanpa koordinat di frontend tidak ada pin, dan tanpa pin tidak
ada tujuan untuk dirutekan. Tiket 04 tidak bisa berdiri tanpa tiket ini.

- [x] `Place` di backend menyimpan `lat` dan `lng`
- [x] `Amenity` di `shared/contract.ts` sebagai **`interface`**: `name`, `kind`,
      `distanceM`, `lat`, `lng`. Berkas itu types only — satu `const` saja
      merusak jaminan bahwa tidak ada yang perlu di-resolve lintas folder
- [x] `ChatResponse.amenities?: Amenity[]`. Opsional, seperti `SiteContext`:
      jawaban yang bukan tier `places` tidak membawanya, dan aplikasi berperilaku
      persis seperti sebelum ini ada
- [x] Prosa jawaban **tidak berubah bentuknya**. Daftar terstruktur ikut di
      sampingnya, bukan menggantikannya
- [x] Endpoint terpisah `GET /api/amenities` ditolak: Amenity hanya pernah lahir
      dari jawaban chat, jadi itu endpoint dengan satu pemanggil dan tempat kedua
      bagi bbox serta daftar putih kategori untuk mulai berbeda
- [x] Aturan cache tidak berubah: `kind === "places"` tetap tidak tersimpan
      ([chat.ts](../../../backend/src/routes/chat.ts) sudah menegakkannya)
- [x] Frontend menggambar **satu** pin tujuan, bukan lima. Papan berisi lima pin
      yang bersaing dengan label tile adalah persis tumpang tindih yang mode di
      tiket 01 dibuat untuk hindari
- [x] Pin Amenity **tidak** punya Zone maupun Approach, dan bentuknya harus jelas
      berbeda dari Site marker. Satu-satunya hal yang boleh dibaca dari sebuah
      pin Amenity adalah "ada tempat di sini", bukan "ada adat di sini"
- [x] Membuka pin Amenity mematikan mode "Lihat sekitar" (tiket 01)
- [x] Atribusi OSM ikut ditampilkan, tidak boleh hilang oleh perubahan UI
      mana pun — ODbL, bukan kesopanan
- [x] Tes: `parseOverpass` mempertahankan koordinat; jawaban non-`places` tidak
      pernah membawa `amenities`
- [x] `npm run typecheck` dan `npm run test:run` bersih di kedua workspace

## Comments

**2026-09-09 — selesai.** `npm run typecheck` bersih di kedua workspace,
`npm run test:run` 532 di backend dan 311 di frontend.

Diverifikasi ujung ke ujung di browser dengan `fetch` disadap, jadi backend
tidak perlu hidup: jawaban Assistant menampilkan "Found on the map" dengan dua
baris dan atribusi peta, mengetuk satu baris pindah ke `/explore`, dan di sana
pin emas tergambar di Ubud dengan kartu tujuannya, tanpa Zone dan tanpa
Approach. Menghapus tujuan membersihkan pin, kartu, dan sessionStorage.

**Dua hal yang ditambahkan setelah melihat layarnya.**

Kartu tujuan tidak ada di checklist. Tanpa itu pin tidak punya cara dihapus dan
akan menetap sampai tab ditutup. Ia juga jadi tempat yang benar untuk atribusi
ODbL, dan tempat tombol rute di tiket 04 akan duduk.

Efek di `page.tsx` yang mengarahkan kamera ke Site terpilih saat masuk Explore
Mode menimpa fokus destinasi, karena ia jalan belakangan. Sekarang dijaga
sebuah ref: visitor yang datang untuk ditunjukkan sebuah tempat mendapat
tempatnya. Ketahuan dari layar, bukan dari kode — zoom-nya diam di 14 padahal
diminta 16.

**Satu tumpang tindih yang disengaja.** Di ponsel kartu tujuan berbagi strip
atas dengan ApproachCard dan kalah selama enam detik kartu itu tampil. Itu
urutan yang benar: melintasi Approach adalah pemberitahuan yang jadi alasan
aplikasi ini ada. Di layar lebar ApproachCard merapat ke rel kanan dan keduanya
tidak pernah bertemu.
