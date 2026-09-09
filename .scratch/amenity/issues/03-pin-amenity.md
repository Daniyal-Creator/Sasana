# 03 — Amenity sampai ke peta sebagai pin

**What to build:** Koordinat Amenity menyeberang dari backend ke frontend lewat
kontrak, dan satu tujuan terpilih digambar sebagai pin di peta.

**Blocked by:** 02

**Status:** ready-for-agent

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

- [ ] `Place` di backend menyimpan `lat` dan `lng`
- [ ] `Amenity` di `shared/contract.ts` sebagai **`interface`**: `name`, `kind`,
      `distanceM`, `lat`, `lng`. Berkas itu types only — satu `const` saja
      merusak jaminan bahwa tidak ada yang perlu di-resolve lintas folder
- [ ] `ChatResponse.amenities?: Amenity[]`. Opsional, seperti `SiteContext`:
      jawaban yang bukan tier `places` tidak membawanya, dan aplikasi berperilaku
      persis seperti sebelum ini ada
- [ ] Prosa jawaban **tidak berubah bentuknya**. Daftar terstruktur ikut di
      sampingnya, bukan menggantikannya
- [ ] Endpoint terpisah `GET /api/amenities` ditolak: Amenity hanya pernah lahir
      dari jawaban chat, jadi itu endpoint dengan satu pemanggil dan tempat kedua
      bagi bbox serta daftar putih kategori untuk mulai berbeda
- [ ] Aturan cache tidak berubah: `kind === "places"` tetap tidak tersimpan
      ([chat.ts](../../../backend/src/routes/chat.ts) sudah menegakkannya)
- [ ] Frontend menggambar **satu** pin tujuan, bukan lima. Papan berisi lima pin
      yang bersaing dengan label tile adalah persis tumpang tindih yang mode di
      tiket 01 dibuat untuk hindari
- [ ] Pin Amenity **tidak** punya Zone maupun Approach, dan bentuknya harus jelas
      berbeda dari Site marker. Satu-satunya hal yang boleh dibaca dari sebuah
      pin Amenity adalah "ada tempat di sini", bukan "ada adat di sini"
- [ ] Membuka pin Amenity mematikan mode "Lihat sekitar" (tiket 01)
- [ ] Atribusi OSM ikut ditampilkan, tidak boleh hilang oleh perubahan UI
      mana pun — ODbL, bukan kesopanan
- [ ] Tes: `parseOverpass` mempertahankan koordinat; jawaban non-`places` tidak
      pernah membawa `amenities`
- [ ] `npm run typecheck` dan `npm run test:run` bersih di kedua workspace

## Comments
