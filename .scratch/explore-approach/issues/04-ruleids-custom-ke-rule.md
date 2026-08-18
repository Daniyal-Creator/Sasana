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

**Status:** ready-for-human — Rekan A

**Owner:** Rekan A

**Berkas yang boleh Anda sentuh:** `frontend/src/data/sites.ts`,
`frontend/__tests__/site-rules.test.ts`. **Jangan menyentuh `backend/`** —
13 Rule yang ada sudah cukup, tidak ada Rule baru yang perlu ditulis.

- [ ] Interface `Custom` di `sites.ts` dapat field baru `ruleIds: string[]`.
      Wajib, bukan opsional
- [ ] Ke-30 Custom (6 Site x 5 Custom) terisi. **Tidak boleh ada array kosong.**
      Kalau sebuah Custom terasa tidak punya Rule, jangan dikosongkan — tulis
      di `## Comments` dan berhenti, karena artinya Custom itu mengarang aturan
      dan itu masalah yang lebih besar dari tiket ini
- [ ] Peta dasarnya seperti ini. Id diambil dari `backend/src/data/rules.json`:

      | Custom `icon` | Rule utama         |
      |---------------|--------------------|
      | dress         | `temple-attire`    |
      | photography   | `photography`      |
      | offerings     | `offerings-canang` |
      | drones        | `drone-restriction`|
      | quiet         | `speaking-volume`  |

- [ ] Id kedua **hanya** ditambahkan kalau kalimat `detail` Custom itu memang
      membawa isi Rule tersebut. Contoh: kalau `detail` sebuah Custom
      `photography` menyebut soal tidak berdiri lebih tinggi dari pemangku,
      maka `head-level-respect` ikut. Kalau tidak menyebut, jangan ikut.
      Kandidat yang tersedia: `sacred-area-entry`, `climbing-sacred`,
      `menstruation-entry`, `shoe-removal`, `touching-sacred-objects`,
      `head-level-respect`, `general-conduct`, `no-littering`.
      **Baca `detail` tiap Custom sebelum memutuskan.** Menambah id yang tidak
      benar-benar jadi asal kalimatnya justru merusak gunanya tali ini
- [ ] `frontend/__tests__/site-rules.test.ts` membaca `rules.json` (impor
      relatif ke `backend/src/data/rules.json`, atau baca lewat `node:fs` —
      mana pun boleh, sebutkan pilihan Anda di `## Comments`) dan:
      - gagal kalau ada Custom dengan `ruleIds` kosong
      - gagal kalau ada `ruleIds` yang menunjuk id yang tidak ada di `rules.json`
      - pesan gagalnya menyebut **Site mana dan Custom mana**, bukan sekadar
        "expected true to be false". Orang yang menambah Site ketujuh setahun
        lagi harus langsung tahu apa yang salah
- [ ] `npm run test:run` dan `npx tsc --noEmit` di `frontend/` hijau

**Catatan:** menambah field ke `Custom` tidak merusak komponen yang membaca
`customs` (`ApproachSheet`, `CustomIcon`, `explore/[siteId]/page.tsx`) — Anda
tidak perlu mengubah satu pun dari itu. Kalau TypeScript mengeluh di berkas
selain dua di atas, berhenti dan tulis di `## Comments`.
