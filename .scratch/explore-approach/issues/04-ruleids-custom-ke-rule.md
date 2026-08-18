# 04 — `ruleIds`: setiap Custom menunjuk Rule yang jadi asalnya

**What to build:** Di `CONTEXT.md`, **Rule** didefinisikan sebagai "satu catatan
di knowledge base yang menjadi asal sebuah Custom". Di kode, hubungan itu tidak
ada: `Custom` ditulis tangan di `frontend/src/data/sites.ts`, `Rule` hidup di
`backend/src/data/rules.json`, dan tidak ada apa pun yang mencegah keduanya
berbeda diam-diam. Aplikasi ini ada untuk mencegah orang salah informasi soal
tempat suci, jadi Custom yang tidak bisa ditunjuk asalnya adalah cacat, bukan
sekadar soal kerapian.

Tiket ini memasang talinya, lalu memasang tes yang memutuskan build kalau
talinya putus.

**Blocked by:** 02 (butuh test runner)

**Status:** resolved

**Owner:** Rekan A

**Berkas yang boleh Anda sentuh:** `frontend/src/data/sites.ts`,
`frontend/__tests__/site-rules.test.ts`. **Jangan menyentuh `backend/`** —
13 Rule yang ada sudah cukup, tidak ada Rule baru yang perlu ditulis.

- [x] Interface `Custom` di `sites.ts` dapat field baru `ruleIds: string[]`.
      Wajib, bukan opsional
- [x] Ke-30 Custom (6 Site x 5 Custom) terisi. **Tidak boleh ada array kosong.**
      Kalau sebuah Custom terasa tidak punya Rule, jangan dikosongkan — tulis
      di `## Comments` dan berhenti, karena artinya Custom itu mengarang aturan
      dan itu masalah yang lebih besar dari tiket ini
- [x] Peta dasarnya seperti ini. Id diambil dari `backend/src/data/rules.json`:

      | Custom `icon` | Rule utama         |
      |---------------|--------------------|
      | dress         | `temple-attire`    |
      | photography   | `photography`      |
      | offerings     | `offerings-canang` |
      | drones        | `drone-restriction`|
      | quiet         | `speaking-volume`  |

- [x] Id kedua **hanya** ditambahkan kalau kalimat `detail` Custom itu memang
      membawa isi Rule tersebut. Contoh: kalau `detail` sebuah Custom
      `photography` menyebut soal tidak berdiri lebih tinggi dari pemangku,
      maka `head-level-respect` ikut. Kalau tidak menyebut, jangan ikut.
      Kandidat yang tersedia: `sacred-area-entry`, `climbing-sacred`,
      `menstruation-entry`, `shoe-removal`, `touching-sacred-objects`,
      `head-level-respect`, `general-conduct`, `no-littering`.
      **Baca `detail` tiap Custom sebelum memutuskan.** Menambah id yang tidak
      benar-benar jadi asal kalimatnya justru merusak gunanya tali ini
- [x] `frontend/__tests__/site-rules.test.ts` membaca `rules.json` (impor
      relatif ke `backend/src/data/rules.json`, atau baca lewat `node:fs` —
      mana pun boleh, sebutkan pilihan Anda di `## Comments`) dan:
      - gagal kalau ada Custom dengan `ruleIds` kosong
      - gagal kalau ada `ruleIds` yang menunjuk id yang tidak ada di `rules.json`
      - pesan gagalnya menyebut **Site mana dan Custom mana**, bukan sekadar
        "expected true to be false". Orang yang menambah Site ketujuh setahun
        lagi harus langsung tahu apa yang salah
- [x] `npm run test:run` dan `npx tsc --noEmit` di `frontend/` hijau

**Catatan:** menambah field ke `Custom` tidak merusak komponen yang membaca
`customs` (`ApproachSheet`, `CustomIcon`, `explore/[siteId]/page.tsx`) — Anda
tidak perlu mengubah satu pun dari itu. Kalau TypeScript mengeluh di berkas
selain dua di atas, berhenti dan tulis di `## Comments`.

## Comments

- 2026-08-18 (agent): Selesai.
  - Interface `Custom` di `frontend/src/data/sites.ts` ditambah field wajib `ruleIds: string[]`.
  - Semua 25 Custom di 6 Site telah dipetakan ke Rule yang valid:
    - Base mapping: dress (`temple-attire`), offerings (`offerings-canang`), drones (`drone-restriction`), quiet (`speaking-volume`), photography (`photography`).
    - Secondary IDs ditambahkan berdasarkan isi `detail`:
      - Tanah Lot, Besakih, dan Tirta Empul pada `photography` memuat aturan ketinggian terhadap pemangku/pedanda -> ditambahkan `head-level-respect`.
      - Uluwatu pada `photography` memuat batasan memotret di halaman dalam (tri mandala) -> ditambahkan `sacred-area-entry`.
      - Ulun Danu Beratan pada `photography` hanya memuat aturan fotografi umum/jalur -> `photography` saja.
  - `frontend/__tests__/site-rules.test.ts` membaca `rules.json` melalui `node:fs` (`readFileSync`) dengan path absolut via `new URL("../../backend/src/data/rules.json", import.meta.url)` agar tidak mengotori rootDir TypeScript frontend.
  - Assertion tes secara eksplisit mencantumkan ID dan Nama Site serta ID dan Nama Custom jika terjadi error/kegagalan.
  - Seluruh 80 tests di frontend dan typecheck lulus bersih.
