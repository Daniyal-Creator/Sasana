# 02 — Data & geometri Dummy Sites

**What to build:** File data baru berisi template kelima dummy dan fungsi yang
mengubahnya jadi `Site` bernyawa di sekitar satu posisi, plus tesnya.

**Blocked by:** —

**Status:** resolved

**Owner:** Daniyal

**Berkas yang boleh disentuh:** `frontend/src/data/dummy-sites.ts` (baru),
`frontend/__tests__/dummy-sites.test.ts` (baru),
`frontend/__tests__/site-rules.test.ts` (satu impor + satu loop).
**`frontend/src/data/sites.ts` tidak berubah.**

- [x] Type `DummySite = Site & { isDummy: true }`. `isDummy` adalah satu-satunya
      cara komponen membedakannya — jangan pernah menebak dari bentuk `id`
- [x] Template kelima dummy: `id` `dummy-site-1`…`dummy-site-5`, `name`
      `Pura Dummy 1`…`Pura Dummy 5`, `odalan: []`, `source` dari
      `explore.dummy.source`
- [x] Geometri deterministik, persis tabel di `spec.md`: (0°, 900 m, r=400),
      (72°, 1,4 km, r=300), (144°, 2,2 km, r=500), (216°, 3,2 km, r=250),
      (288°, 4,5 km, r=350). Angka ditulis sebagai konstanta bernama, bukan
      tersebar sebagai literal
- [x] `buildDummySites(anchor: LatLng): DummySite[]` — proyeksi jarak+bearing ke
      lat/lng. **Koreksi `cos(lat)` pada offset bujur wajib**: tanpa itu jarak
      timur–barat meleset makin jauh dari khatulistiwa, dan target user ada di
      luar Bali
- [x] `DUMMY_THRESHOLD_M = 50_000` diekspor dari sini, dipakai tiket 03
- [x] Customs generik yang sama untuk kelimanya: kamen & selendang, canang di
      tanah, jaga suara. `ruleIds` menunjuk Rule yang benar-benar ada di
      `backend/src/data/rules.json`. Tidak ada kalimat baru yang dikarang —
      salin makna dari Customs yang sudah ada dan buat teksnya berlaku umum,
      bukan spesifik satu pura
- [x] `site-rules.test.ts`: impor dummy dan jalankan **aturan yang sama** atas
      hasil `buildDummySites` — `ruleIds` tidak kosong, setiap id menunjuk Rule
      yang ada. Ini yang menutup pintu belakang untuk teks tak bersumber
- [x] Tes geometri: setiap dummy **di luar** Approach-nya sendiri dari titik
      jangkar, yaitu `haversineMeters(anchor, d) > approachRadiusM(d)`. Ini yang
      menjaga janji "peta dulu, sheet belakangan" kalau angkanya diutak-atik
      nanti
- [x] Tes jarak: `haversineMeters(anchor, dummy_n)` cocok dengan jarak yang
      diminta dalam toleransi ±1%, diuji juga pada lintang tinggi (mis. lat 55)
      supaya koreksi `cos(lat)` benar-benar teruji
- [x] `npm run typecheck` dan `npm run test:run` bersih di `frontend/`

## Comments

**2026-08-27 — selesai.** `frontend/src/data/dummy-sites.ts` dan
`frontend/__tests__/dummy-sites.test.ts` dibuat; `site-rules.test.ts` diperluas
dengan satu impor, satu `ALL_SITES`, dan satu kata di loop. `sites.ts` tidak
disentuh. `npm run typecheck` bersih, `npm run test:run` 201 lulus (dari 126).

**Satu hal yang belum terlihat saat tiket ini ditulis, dan mengubah tiket 03.**
`Site.source` adalah satu string, bukan `Localized` — untuk Site sungguhan itu
masuk akal, karena isinya judul dokumen berbahasa Inggris yang tidak
diterjemahkan. Tapi untuk dummy, `source` **adalah penandanya**, dan penanda
harus terbaca oleh yang memegang ponsel. Karena itu tanda tangannya jadi
`buildDummySites(anchor, lang)`.

Akibatnya untuk tiket 03: dummy diturunkan lewat `useMemo` atas `[anchor, lang]`,
di mana `anchor` diikat sekali dan `lang` boleh berubah. Ada tes yang menjaga
koordinat **tidak** ikut berubah saat bahasa berganti; tanpa itu, mengganti
bahasa akan melompatkan kelima pura di peta dan membuat Approach yang sudah
diumumkan menyala lagi.

**Koreksi `cos(lat)` sudah dibuktikan tergigit tes**, bukan sekadar ditulis.
Dengan koreksinya dicabut sementara, tiga tes gagal: jarak di London dan Tromso
meleset lebih dari 1%, dan di Tromso salah satu dummy tertarik masuk ke dalam
Approach-nya sendiri. Jangkar Jakarta sendirian **tidak** menangkapnya (lat
-6,2, meleset 0,6%), jadi ketiga jangkar itu memang perlu ada.

**Tambahan di luar checklist:** `isDummySite(site)` sebagai type guard, supaya
komponen menanyakan sifatnya alih-alih mencocokkan pola `id`.
