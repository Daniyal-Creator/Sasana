# Site Photographs (Panduan Aset Gambar Tempat Suci)

Dokumen ini memuat panduan pengadaan dan peletakan gambar tempat suci untuk kartu *Sites Showcase* (Slider) di Landing Page SASANA, sesuai ketetapan **[ADR-0007](../../../docs/agents/adr/0007-site-photos-on-landing.md)** dan **[Design Guardrails](../../../docs/design-guardrails.md)**.

---

## 1. Spesifikasi Gambar

- **Format File**: `.webp` (direkomendasikan) atau `.jpg` berkualitas tinggi.
- **Rasio Aspek**: `16:9` (lebar : tinggi).
- **Dimensi Rekomendasi**: `800 × 450 px` (atau `720 × 405 px`).
- **Ukuran File**: Target `< 150 KB` per gambar (Next.js berjalan dalam mode `output: "export"` dengan `images: { unoptimized: true }`, sehingga gambar harus sudah terkompresi dengan baik sebelum dimasukkan).

---

## 2. Daftar Nama File yang Dibutuhkan

Simpan file gambar di dalam folder ini (`frontend/public/sites/`) dengan nama file berikut:

| Nama Tempat Suci | Lokasi | Nama File Target | Path Publik di `sites.ts` |
| :--- | :--- | :--- | :--- |
| **Pura Tanah Lot** | Tabanan, Bali | `pura-tanah-lot.webp` | `/sites/pura-tanah-lot.webp` |
| **Pura Luhur Uluwatu** | Badung, Bali | `pura-luhur-uluwatu.webp` | `/sites/pura-luhur-uluwatu.webp` |
| **Pura Besakih** | Karangasem, Bali | `pura-besakih.webp` | `/sites/pura-besakih.webp` |
| **Pura Batu Bolong** | Badung, Bali | `pura-batu-bolong.webp` | `/sites/pura-batu-bolong.webp` |
| **Pura Tirta Empul** | Gianyar, Bali | `pura-tirta-empul.webp` | `/sites/pura-tirta-empul.webp` |
| **Pura Ulun Danu Beratan** | Tabanan, Bali | `pura-ulun-danu-beratan.webp` | `/sites/pura-ulun-danu-beratan.webp` |

---

## 3. Ketentuan Budaya & Legalitas (ADR-0007 & Guardrail I4)

- **Foto Asli (Bukan AI)**: Dilarang keras menggunakan gambar hasil generasi AI untuk tempat suci.
- **Privasi**: Tidak menampilkan wajah orang secara close-up atau dapat diidentifikasi tanpa izin.
- **Lisensi Jelas**: Utamakan foto berlisensi terbuka (misal: Wikimedia Commons, Unsplash CC0) atau dokumentasi foto pribadi.
- **Pencatatan Sumber**: Catat URL asal dan nama fotografer untuk rekam jejak provenance.

---

## 4. Cara Menampilkan Gambar di Web

Setelah file gambar diletakkan di folder ini, buka [`frontend/src/data/sites.ts`](../../src/data/sites.ts), lalu tambahkan properti `image` pada situs yang bersangkutan:

```ts
{
  id: "pura-tanah-lot",
  name: "Pura Tanah Lot",
  // ...
  image: "/sites/pura-tanah-lot.webp", // <-- Tambahkan baris ini
  // ...
}
```

Jika properti `image` belum diisi, kartu akan secara elegan menampilkan ikon placeholder pin tanpa memicu broken image (404).
