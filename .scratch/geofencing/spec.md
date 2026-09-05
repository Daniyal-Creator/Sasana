# Spec — Geofencing

**Owner:** Daniyal · **Branch prefix:** `geofencing/`

What "done" means for the geofencing area. Read this before starting a branch
here. Kosakata: `CONTEXT.md`. Latar belakang produk: `docs/prd.md` §F3.

---

## Bagian yang sudah selesai

**Logika keputusan (`lib/geo.ts`).** Approach = `radiusM + 400 m`; masuk butuh
`jarak + akurasi <= Approach`; keluar butuh `jarak - akurasi > Approach + 100`;
notice menyala sekali per Site. Diuji di `frontend/__tests__/geo.test.ts`.
Riwayat lengkapnya di `.scratch/explore-approach/` — dibaca sebagai catatan,
bukan sebagai instruksi.

**Ini tidak dibuka lagi dalam pekerjaan peta.** Gating akurasi menahan notice
menyala di Site yang salah: ponsel di jalanan rutin melapor 300–1500 m
sementara Zone 250–500 m.

---

## Yang sedang dikerjakan: peta sungguhan, full-screen

Mengganti `components/explore/ZoneMap.tsx` — SVG Bali yang digambar tangan —
dengan peta dari layanan tile pihak ketiga. Keempat view Explore jadi
full-screen dengan bottom sheet di atasnya.

### Kenapa

Peta lama menggambar seluruh Bali dalam satu kotak tetap. Zone 400 m di kotak
itu berukuran kurang dari satu piksel, jadi radiusnya dipaksa membesar dan
layarnya harus mencetak "tidak sesuai skala". Kamera tidak pernah mengikuti
pengunjung. Tidak ada jalan, tidak ada nama tempat, tidak ada zoom.

Pengunjung yang berdiri 700 m dari sebuah Site tidak bisa tahu ke arah mana ia
harus berjalan, dan tidak bisa melihat garis mana yang barusan ia lewati.

### Keputusan (Daniyal, 2026-08-20)

- **Leaflet `^1.9.4` + tile raster CARTO Voyager.** Gratis, tanpa API key, tanpa
  kartu kredit.
- **Google Maps Platform ditolak**: mewajibkan akun billing berkartu, sementara
  anggaran proyek Rp 0 (`docs/tech-spec.md` §5).
- **MapLibre + tile vektor ditolak** meski lebih dekat ke rasa Google Maps.
  Konsekuensi raster diterima secara sadar: zoom melompat per level, label buram
  di antara level, dan warna basemap tidak bisa diikat ke token SASANA. Rasa
  "peta modern" karena itu dibawa oleh chrome di atas peta — sheet, tombol
  mengambang, kartu — bukan oleh basemap-nya.
- **Guardrail desain dibekukan, hanya untuk `/explore`.**
  `docs/design-guardrails.md` tetap mengikat penuh di `/`, `/check`, dan
  `/assistant`. W1–W6 (copy), I4 (tidak ada citra sintetis budaya Bali), dan C6
  (warna tidak pernah jadi satu-satunya sinyal) **tetap berlaku** di `/explore`
  juga — ketiganya bukan soal tampilan.
- **Keempat view full-screen**, dengan bottom sheet **dua tahap** (peek, full).
  Tiga tahap gaya Google Maps ditolak: momentum dan tiga snap point adalah
  sumber bug yang tidak sebanding untuk enam Site.
- **Follow-mode.** Kamera mengikuti pengunjung, mati begitu ia menggeser peta,
  menyala lagi lewat tombol lokasi.
- **Digambar di peta: Zone, Approach, dan lingkaran akurasi.** Skalanya sekarang
  jujur, jadi alasan lama untuk menyembunyikan Approach hilang. Lingkaran
  akurasi membuat status "mencari lokasi" bisa dilihat, bukan hanya dibaca.
- **`explore.map.notToScale` dihapus.** Peta baru sesuai skala; teks itu
  sekarang berbohong ke arah sebaliknya.
- **Explore Mode berhenti tuli.** Sekarang `page.tsx` berhenti menguji Approach
  begitu pengunjung masuk mode jelajah. Diganti: pengujian tetap jalan, hasilnya
  muncul sebagai spanduk kecil, dan layar tidak pernah direbut.
- **Saat tile gagal:** area peta jadi permukaan kosong berpesan dan sheet naik
  sendiri ke tahap penuh. Tidak ada service worker, tidak ada cache tile.
- **Tidak berubah:** `lib/geo.ts`, `data/sites.ts`, `__tests__/`,
  `app/explore/[siteId]/page.tsx`.
- ADR `0003` (peta SVG stylized) dan `0005` (notice di Approach, foreground
  only) dicabut. ADR `0001`, `0002`, `0004` tetap berlaku.

### Dua batas yang tidak bisa dihilangkan keputusan apa pun

1. **Pelacakan berhenti saat layar mati atau tab berpindah ke belakang.**
   `navigator.geolocation` hanya hidup di konteks window; service worker tidak
   punya akses geolocation sama sekali. Ini batas platform web, bukan pilihan
   desain, dan tidak berubah karena ADR-0005 dicabut. Copy Screen A yang sudah
   ada sudah mengatakannya.
2. **Tile diminta ke server CARTO.** Koordinat GPS tidak pernah dikirim ke mana
   pun, tapi petak peta yang dimuat menunjukkan kira-kira di mana pengunjung
   berada. Kalimat privasi Screen A karena itu dipertajam, bukan dihapus: klaim
   tentang GPS tetap utuh, dan pemuatan peta disebutkan apa adanya.

### Peringatan versi Leaflet

`npm view leaflet` per 2026-08-20: **`latest` = 1.9.4**, sementara
`2.0.0-alpha.1` ada di tag `alpha`. Dokumentasi di repositori Leaflet sudah
ditulis untuk 2.x, yang membuang gaya factory `L.map()` dan menggantinya dengan
ESM named export (`new LeafletMap(...)`). **Sintaks itu tidak jalan di 1.9.4.**
Contoh yang memakai `new LeafletMap` adalah contoh untuk versi yang belum
dirilis.

---

## Potongan kerja

Satu cabang per potongan, `geofencing/<slug>`, merge begitu potongannya selesai.
Tanpa nomor: urutannya ditentukan ketergantungan, bukan penomoran.

| Cabang | Isi | Butuh |
|---|---|---|
| `geofencing/carve-out-guardrail` | Carve-out `/explore` ditulis ke `AGENTS.md` dan `docs/design-guardrails.md` §11 | — |
| `geofencing/leaflet-basemap` | `leaflet@^1.9.4`, `components/explore/BaseMap.tsx` | — |
| `geofencing/copy-peta` | `lib/i18n.explore.ts`: buang `notToScale`, kunci baru, pertajam privasi | — |
| `geofencing/map-layers` | `components/explore/MapLayers.tsx`: Zone, Approach, akurasi, titik | basemap |
| `geofencing/map-sheet` | `components/explore/MapSheet.tsx`: sheet dua tahap | copy |
| `geofencing/approach-banner` | `components/explore/ApproachBanner.tsx` | copy |
| `geofencing/explore-full-screen` | `app/explore/page.tsx`, hapus `ZoneMap.tsx` | semuanya |

`ZoneMap.tsx` hanya boleh dihapus di potongan terakhir. Sampai saat itu
`page.tsx` masih memakainya, dan menghapusnya lebih dulu membuat `main` gagal
typecheck di antara dua merge.

## Kontrak antar-potongan

```ts
// BaseMap.tsx
interface BaseMapProps {
  center: LatLng;
  zoom: number;
  follow: boolean;
  position: LatLng | null;
  onUserPan: () => void;
  onRecenter: () => void;
  onTileError: () => void;
  children?: React.ReactNode;
}
export function useLeafletMap(): import("leaflet").Map | null;

// MapLayers.tsx
interface MapLayersProps {
  sites: Site[];
  position: LatLng | null;
  accuracyM: number | null;
  selectedSiteId: string | null;
  onSelectSite?: (siteId: string) => void;
}

// MapSheet.tsx
type SheetStage = "peek" | "full";
interface MapSheetProps {
  stage: SheetStage;
  onStageChange: (stage: SheetStage) => void;
  children: React.ReactNode;
}
export const PEEK_HEIGHT_PX = 132;   // BaseMap menaikkan atribusi sejauh ini

// ApproachBanner.tsx
interface ApproachBannerProps {
  site: Site;
  onOpen: () => void;
  onDismiss: () => void;
}
```

Kunci i18n baru: `explore.map.locate`, `explore.map.zone`,
`explore.map.approach`, `explore.map.accuracy`, `explore.map.offline.title`,
`explore.map.offline.body`, `explore.banner.approaching`, `explore.banner.open`,
`explore.banner.dismiss`, `explore.sheet.expand`, `explore.sheet.collapse`.

## Aturan lintas area

Dari **Working together** di `README.md`, mengikat di sini:

- `frontend/tailwind.config.ts` **milik geofencing** — boleh diubah, tapi token
  baru mempengaruhi area lain, jadi hanya kalau benar-benar perlu.
- `frontend/src/app/globals.css` **append only, di dalam blok `/* explore */`**.
  Tidak pernah selector global.
- `frontend/package.json` append only. Menambah `leaflet` boleh; menaikkan versi
  dependency orang lain tidak.
- Konflik `package-lock.json` diselesaikan dengan mengambil salinan `main` lalu
  `npm install` ulang, tidak pernah dengan tangan.

## Definisi selesai

`npm run typecheck` dan `npm run test:run` hijau di `frontend/`. Tidak ada tes
baru yang diminta pekerjaan ini — logika yang bisa diuji murni ada di `geo.ts`,
dan `geo.ts` tidak berubah.

Di perangkat 375px:

- peta memenuhi layar, bisa digeser dan di-zoom;
- titik pengunjung bergerak mengikuti GPS, kamera mengikutinya sampai pengunjung
  menggeser sendiri;
- Zone, Approach, dan lingkaran akurasi tergambar dengan radius meter yang benar
  dan ikut berskala saat zoom;
- menyeberang Approach memunculkan sheet berisi Custom Site itu;
- di Explore Mode, menyeberang Approach memunculkan spanduk dan **tidak**
  mengganti layar;
- mematikan jaringan menghasilkan permukaan kosong berpesan dengan sheet yang
  naik sendiri, bukan layar putih;
- atribusi OpenStreetMap dan CARTO terbaca dan tidak tertutup sheet.
