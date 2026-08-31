# Redesign Card Slider Destinasi Pariwisata Bali

## 1. Tujuan Redesign

Card pada slider saat ini masih terasa terlalu polos, kaku, dan lebih menyerupai **informational dashboard** daripada komponen pada website pariwisata.

Arah redesign yang diinginkan adalah membuat card terasa:

- Lebih visual dan menarik.
- Lebih cocok untuk website pariwisata.
- Memiliki gambar yang mewakili setiap destinasi.
- Memiliki deskripsi singkat yang menjelaskan destinasi.
- Dapat diklik seluruhnya untuk menuju halaman detail lokasi.
- Tetap mempertahankan kesan elegan, clean, dan premium dari desain website yang sudah ada.
- Terinspirasi dari struktur card referensi Amsterdam yang menggunakan gambar sebagai fokus utama.

---

## 2. Struktur Card Baru

Struktur card lama:

```text
Badge
↓
Judul
↓
Subtitle
↓
Divider
↓
View details
```

Struktur card baru:

```text
Image
↓
Location Badge / Information
↓
Judul Destinasi
↓
Deskripsi Singkat
↓
CTA / Explore
```

Contoh struktur:

```text
┌──────────────────────────────────────┐
│                                      │
│        FOTO TEMPAT WISATA            │
│                                      │
│  📍 Tabanan, Bali                    │
├──────────────────────────────────────┤
│                                      │
│  Pura Tanah Lot                      │
│                                      │
│  Salah satu pura ikonik Bali yang    │
│  berdiri di atas batu karang di      │
│  tengah pesisir.                     │
│                                      │
│  Explore location                 → │
└──────────────────────────────────────┘
```

---

## 3. Image sebagai Elemen Utama

Bagian gambar harus menjadi elemen visual paling dominan pada card.

### Rekomendasi

- Gambar memenuhi lebar card.
- Tinggi gambar sekitar **180–210 px**.
- Gunakan foto landscape yang benar-benar mewakili destinasi.
- Gunakan `object-fit: cover`.
- Gunakan border radius pada bagian atas card, sekitar **18–20px**.
- Tambahkan gradient tipis pada bagian bawah gambar jika diperlukan.
- Location badge dapat ditempatkan sebagai overlay pada area gambar.

Contoh:

```text
┌──────────────────────────────────┐
│                                  │
│       FOTO PURA TANAH LOT        │
│                                  │
│  📍 Tabanan, Bali                │
└──────────────────────────────────┘
```

Tujuannya agar user langsung mengenali destinasi secara visual sebelum membaca teks.

---

## 4. Location Badge

Badge lokasi yang sebelumnya berada di dalam content dapat dipindahkan ke area gambar sebagai overlay.

Contoh:

```text
📍 Tabanan, Bali
```

Badge sebaiknya tetap menggunakan gaya rounded/pill agar konsisten dengan desain website.

Informasi tambahan seperti jumlah custom tidak boleh menjadi elemen utama. Bila tetap dibutuhkan, tampilkan sebagai secondary information.

Contoh:

```text
📍 Tabanan, Bali       5 Customs
```

Namun fokus utama harus tetap:

**Foto → Nama → Deskripsi → Explore**

---

## 5. Judul Destinasi

Nama destinasi harus menjadi elemen teks paling dominan setelah gambar.

Contoh:

**Pura Tanah Lot**

Jangan hanya menggunakan subtitle generik seperti:

> Sacred coastal temple area

Lebih baik subtitle diganti dengan deskripsi singkat yang benar-benar menjelaskan destinasi.

Contoh:

> Pura ikonik di tepi laut Bali yang terkenal dengan pemandangan sunset dan lokasinya di atas batu karang.

Judul menggunakan tipografi yang kuat/elegan dan konsisten dengan heading website.

---

## 6. Deskripsi Singkat

Setiap card harus memiliki deskripsi pendek yang mewakili karakter destinasi.

### Aturan

- Sekitar **2–3 baris**.
- Jangan terlalu panjang.
- Fokus pada hal yang paling menarik atau khas dari lokasi.
- Semua card sebaiknya memiliki tinggi konten yang konsisten.

### Contoh

#### Pura Tanah Lot

> Pura ikonik di tepi laut Bali yang terkenal dengan pemandangan sunset dan lokasinya di atas batu karang.

#### Pura Luhur Uluwatu

> Pura suci di atas tebing dengan panorama Samudra Hindia dan pemandangan matahari terbenam yang spektakuler.

#### Pura Besakih

> Kompleks pura terbesar dan paling sakral di Bali yang berada di lereng Gunung Agung.

---

## 7. CTA / Call to Action

CTA lama:

> View details →

Lebih cocok menggunakan wording yang berhubungan dengan eksplorasi wisata.

Rekomendasi:

- **Explore location →**
- **Discover this place →**
- **Learn more →**

Rekomendasi utama:

> **Explore location →**

CTA sebaiknya tetap sederhana dan tidak terlalu besar.

---

## 8. Seluruh Card Harus Clickable

User tidak harus mengklik hanya tulisan atau tombol.

Seluruh area card sebaiknya bisa diklik untuk menuju halaman detail destinasi.

Contoh:

```text
Card Pura Tanah Lot
        ↓
/locations/tanah-lot
```

Arrow pada bagian CTA hanya berfungsi sebagai visual cue bahwa card dapat dieksplorasi.

---

## 9. Hover Interaction

Agar card lebih hidup dan terasa modern, tambahkan animasi hover yang halus.

Saat hover:

- Gambar sedikit melakukan zoom.
- Card sedikit terangkat.
- Arrow/CTA dapat bergeser sedikit.
- Transition tetap halus dan tidak berlebihan.

Contoh CSS dasar:

```css
.card {
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
}

.card:hover img {
    transform: scale(1.04);
}
```

Pastikan gambar juga memiliki transition:

```css
.card img {
    transition: transform 0.3s ease;
}
```

Hindari animasi terlalu agresif agar desain tetap premium.

---

## 10. Ukuran Card

Karena card akan berisi gambar dan deskripsi, ukurannya perlu dibuat lebih tinggi daripada card versi lama.

Rekomendasi:

```text
Width  : 380–420px
Height : 440–480px
Image  : 190–210px
Radius : 18–22px
```

Slider tetap dapat mempertahankan konsep **3 card dalam satu tampilan desktop**.

Contoh:

```text
       ←
┌────────────┐ ┌────────────┐ ┌────────────┐
│    FOTO    │ │    FOTO    │ │    FOTO    │
│            │ │            │ │            │
├────────────┤ ├────────────┤ ├────────────┤
│ Tanah Lot  │ │ Uluwatu    │ │ Besakih    │
│ ...        │ │ ...        │ │ ...        │
│ Explore →  │ │ Explore →  │ │ Explore →  │
└────────────┘ └────────────┘ └────────────┘
                                      →
```

---

## 11. Visual Style

Identitas visual website yang sekarang sebaiknya tetap dipertahankan.

Card baru tidak perlu menggunakan warna-warna yang terlalu mencolok karena foto destinasi sudah menjadi sumber warna utama.

### Recommended Color Palette

| Elemen | Warna |
|---|---|
| Background | `#F5F0E7` / Warm Cream |
| Card | `#FFFCF8` |
| Heading | `#14283B` / Deep Navy |
| Accent | `#B78A32` / Muted Gold |
| CTA | `#15579A` / Deep Blue |

Prinsip desain:

- Cream sebagai background utama.
- White/off-white untuk card.
- Deep navy untuk heading.
- Gold sebagai aksen.
- Blue untuk CTA.
- Foto destinasi menjadi focal point.

---

## 12. Struktur Visual Final

Desain akhir yang direkomendasikan:

```text
┌────────────────────────────────────────┐
│                                        │
│                                        │
│          [ FOTO DESTINASI ]            │
│                                        │
│                         ★ 4.9          │
│                                        │
├────────────────────────────────────────┤
│                                        │
│  📍 Tabanan, Bali                      │
│                                        │
│  Pura Tanah Lot                        │
│                                        │
│  Pura ikonik di tepi laut Bali yang    │
│  menawarkan pemandangan sunset dan     │
│  suasana spiritual yang khas.         │
│                                        │
│  ────────────────────────────────────  │
│                                        │
│  Explore location                  →   │
│                                        │
└────────────────────────────────────────┘
```

Desain ini mempertahankan kesan clean dan elegan, tetapi memberikan karakter wisata melalui penggunaan foto, deskripsi, dan interaksi.

---

## 13. Prinsip Desain Utama

Card baru sebaiknya mengikuti urutan prioritas berikut:

```text
1. Image
2. Destination Name
3. Short Description
4. Location
5. CTA
6. Secondary Information
```

Jangan membuat card terasa seperti database atau dashboard.

Tujuan utamanya adalah membuat setiap card terasa seperti:

> **Preview sebuah destinasi wisata yang mengundang user untuk mengeksplorasi lebih lanjut.**

---

## 14. Rekomendasi Implementasi Slider

Layout desktop:

```text
←     [ Card ] [ Card ] [ Card ]     →
```

Pertahankan navigasi slider yang sudah ada.

Pagination/dots di bawah slider juga dapat tetap dipakai:

```text
        ● ─ ●
```

Namun card sekarang menjadi lebih tinggi karena adanya image dan deskripsi.

Untuk responsive design:

- Desktop: 3 card.
- Tablet: 2 card.
- Mobile: 1 card.
- Pastikan card tidak terlalu sempit sehingga gambar dan deskripsi tetap nyaman dibaca.

---

## 15. Hasil yang Diharapkan

Setelah redesign, slider tidak lagi terasa seperti kumpulan kartu informasi biasa.

Target visual:

```text
Informational Dashboard
        ↓
Visual Tourism Card
        ↓
Destination Preview
        ↓
User tertarik melihat detail
        ↓
Click seluruh card
        ↓
Halaman detail lokasi
```

Card harus memberikan kesan **premium, modern, clean, warm, dan travel-oriented**, sambil tetap mempertahankan identitas visual website yang sudah ada.

---

## 16. Kesimpulan Desain

Konsep utama redesign adalah:

> **Jadikan foto sebagai pusat perhatian, gunakan teks untuk memberikan konteks, dan jadikan seluruh card sebagai pintu menuju halaman detail destinasi.**

Dengan pendekatan ini, card tidak sekadar menampilkan informasi seperti nama lokasi dan jumlah customs, tetapi benar-benar berfungsi sebagai **visual introduction** untuk setiap destinasi wisata.
