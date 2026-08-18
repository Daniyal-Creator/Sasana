# Spec — explore-approach

Memperbaiki geofencing Explore yang sudah ada di `main` supaya perilakunya
menepati janji yang sudah tertulis di layarnya sendiri. Bukan penulisan ulang:
bentuk fitur, dua ADR yang sudah ada, dan `ZoneMap` tidak berubah.

Sumber kebenaran keputusan: `docs/adr/0005-approach-notice-foreground-only.md`
(dibuat di tiket 01). Latar belakang produk: `docs/prd.md` §F3. Kosakata:
`CONTEXT.md`.

## Prinsip

Jangkauan yang sempit tapi jujur lebih baik daripada janji luas yang meleset.
Ketiga keputusan besar di bawah turun dari kalimat itu.

## Keputusan cakupan (disetujui Daniyal, 2026-08-18)

- **Notice menyala di Approach, bukan di Zone.** `Approach` adalah term baru di
  `CONTEXT.md`: lingkaran lebih luar tempat visitor diberi tahu. `Zone` tetap
  berarti tempat customs berlaku. Approach = `radiusM + 400 m` (konstanta
  global, bukan field per-Site). Garis keluar = Approach + 100 m histeresis.
- **Latar depan saja.** Tidak ada service worker, manifest, Push, atau
  Periodic Background Sync. Push mensyaratkan notifikasi yang terlihat user,
  izin kedua, dan pengiriman posisi ke server — yang membatalkan kalimat
  privasi di Screen A. Batas ini harus dikatakan di layar, bukan didiamkan.
- **Masuk dan keluar sama-sama butuh keyakinan akurasi.** Masuk kalau
  `jarak + akurasi <= Approach`; keluar kalau `jarak - akurasi > Approach + 100`.
  Notice cenderung telat menyala dan telat padam, dan itu arah kesalahan yang
  benar.
- **Hanya `PERMISSION_DENIED` yang membuang ke Explore Mode.**
  `POSITION_UNAVAILABLE` dan `TIMEOUT` pulih sendiri dan watch tidak dibatalkan
  otomatis, jadi membuang Live Mode karenanya adalah kerugian sia-sia.
- **Custom wajib menunjuk Rule** lewat `ruleIds: string[]` yang tidak boleh
  kosong. 13 Rule di `backend/src/data/rules.json` sudah menutup kelima Custom,
  jadi tidak ada perubahan di `backend/`.
- **Peta tidak berubah.** Tidak ada lingkaran Approach di `ZoneMap`. Rasio
  antar-lingkaran akan jadi artefak clamp, bukan informasi.
- `odalanDates` tetap kosong (ADR-0004). Tidak ada dependency baru selain
  `vitest`.

## Tiket

| NN | Judul | Pemilik | Blocked by | Berkas yang disentuh |
|----|-------|---------|-----------|----------------------|
| 01 | ADR-0005 | Daniyal | — | `docs/adr/0005-*.md` |
| 02 | Harness Vitest di frontend | Rekan A | — | `frontend/package.json`, `frontend/vitest.config.mts`, `frontend/__tests__/harness.test.ts` |
| 03 | Copy Screen A + kunci status sinyal | Rekan B | — | `frontend/src/lib/i18n.explore.ts` |
| 04 | `ruleIds`: Custom menunjuk Rule + tes silang | Rekan A | 02 | `frontend/src/data/sites.ts`, `frontend/__tests__/site-rules.test.ts` |
| 05 | `geo.ts`: Approach, akurasi, `formatDistance` + tes | Daniyal | 02 | `frontend/src/lib/geo.ts`, `frontend/__tests__/geo.test.ts` |
| 06 | Halaman Explore: watch, error, akurasi, izin, simulate | Daniyal | 03, 05 | `frontend/src/app/explore/page.tsx` |
| 07 | Dokumen: README `?simulate=` + catatan kepala prompt | Rekan B | 06 | `README.md`, `docs/geofencing-ui-prompt.md` |

## Alur pengerjaan

```
       01 (D)  ─────────────────────────────┐
       02 (A)  ──┬── 04 (A) ────────────────┤
                 └── 05 (D) ──┐             ├── selesai
       03 (B)  ───────────────┴── 06 (D) ───┘
                                  └── 07 (B)
```

- **01, 02, 03 mulai bersamaan.** Tidak ada satu pun berkas yang beririsan.
- 04 dan 05 keduanya menunggu 02 (butuh test runner), lalu **jalan paralel** —
  04 hanya menyentuh `sites.ts`, 05 hanya menyentuh `geo.ts`.
- 06 menunggu 03 dan 05 karena ia mengimpor kunci i18n dari 03 dan fungsi dari
  05. 06 tidak menyentuh `sites.ts`, jadi ia tidak menunggu 04.
- 07 menunggu 06 karena mendokumentasikan perilaku `?simulate=` yang baru.

## Aturan supaya tidak tabrakan

1. **Satu berkas, satu pemilik.** Kolom terakhir tabel di atas adalah kontrak.
   Kalau sebuah tiket terasa butuh menyentuh berkas milik tiket lain, berhenti
   dan tulis alasannya di `## Comments`, jangan diedit.
2. **Satu cabang per tiket**, dari `main`: `explore-approach/NN-<slug>`.
   Merge ke `main` sesuai urutan blokir, bukan sesuai urutan selesai.
3. **Nama diketuk lebih dulu, bukan ditemukan belakangan.** Nama kunci i18n
   (tiket 03) dan tanda tangan fungsi `geo.ts` (tiket 05) sudah dipatok di
   masing-masing tiket. Tiket 06 menulis kode terhadap nama-nama itu. Kalau
   sebuah nama harus berubah, yang berubah adalah tiketnya dulu.
4. **Berkas tes tidak pernah dipakai berdua.** 02 → `harness.test.ts`,
   04 → `site-rules.test.ts`, 05 → `geo.test.ts`.
5. Sebelum mulai, ubah `Status:` di tiket jadi `claimed`, tulis nama Anda,
   commit perubahan itu sendirian, dan push — sebelum menyentuh apa pun yang
   lain. Itu satu-satunya yang mencegah dua orang membangun tiket yang sama.

## Kenapa effort ini ikut git, yang lain tidak

`.gitignore` mengabaikan `.scratch/` karena isinya catatan kerja lokal. Effort
ini dikecualikan (`!.scratch/explore-approach/`) karena dikerjakan lebih dari
satu orang, dan tiket yang tidak bisa dibaca rekan tim bukan tiket. Tiga effort
lama (`backend-mvp`, `content-sections`, `landing-hero`) tetap lokal.

Ringkasan cara memungut tiket juga ada di `README.md` bagian *Working the
tickets*, supaya orang yang baru `git clone` menemukannya tanpa harus tahu
direktori ini lebih dulu.

**Yang ikut hanya berkas `.md`.** Log, screenshot, `.txt`, dan `.env` yang
diletakkan di direktori ini tetap lokal. Buang bahan mentah ke direktori
sebelah, misalnya `.scratch/notes/` — seluruh isi `.scratch/` selain effort ini
lokal secara default. Aturannya satu kalimat: tiket ditulis di
`explore-approach/`, semua tempelan mentah masuk `notes/`.

Alasannya bukan kerapian: berkas yang sudah ter-push tidak bisa ditarik kembali.
Menghapusnya nanti hanya mengeluarkannya dari commit terakhir, bukan dari
riwayat. Kalau sebuah kunci sampai ikut ter-commit, perbaikannya adalah mencabut
kunci itu dan menerbitkan yang baru.
