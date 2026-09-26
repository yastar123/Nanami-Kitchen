# PRODUCT REQUIREMENT DOCUMENT (PRD)

# NANAMI KITCHEN — CLOUD KITCHEN & FOOD ORDERING PLATFORM

**Versi Dokumen:** 1.9.0  
**Status Proyek:** Production Ready, Fully Audited & Live  
**Arsitektur:** Full-Stack Modular SSR (TanStack Start + Nitro / Vite + PostgreSQL / Resilient Multi-Layer Storage)  
**Mata Uang & Wilayah Target:** N$ (Namibia Dollar) / Wilayah Namibia & Windhoek  
**Terakhir Diperbarui:** 2026-09-26 (Phase 9 Master System Audit: Full Storefront & Dashboard Verification, Complete Owner User & Staff CRUD Suite at /owner/staff, 38 Routes Audited, Pure-Visual Welcome Splash, Interactive GPS LocationPicker, Strict RBAC Matrix, SSRF Mitigation, Parameterized SQL Queries, and Dual-Layer Database Sync)

---

## DAFTAR ISI

1. [Ringkasan Eksekutif & Visi Produk](#1-ringkasan-eksekutif--visi-produk)
2. [Arsitektur Teknis & Tech Stack](#2-arsitektur-teknis--tech-stack)
3. [Manajemen Peran, Akses (RBAC), & Alur Guest Checkout](#3-manajemen-peran-akses-rbac--alur-guest-checkout)
4. [Katalog Halaman, Struktur Navigasi, & Rute (File-Based Routing)](#4-katalog-halaman-struktur-navigasi--rute-file-based-routing)
   - 4.1 [Rute Autentikasi & Status Social Sign-In](#41-rute-autentikasi--status-social-sign-in)
   - 4.2 [Rute Storefront Pelanggan, Top Bar Minimalis, & 4-Tab Bottom Nav](#42-rute-storefront-pelanggan-top-bar-minimalis--4-tab-bottom-nav)
   - 4.3 [Rute Operasional Admin & Struktur Sidebar](#43-rute-operasional-admin--struktur-sidebar)
   - 4.4 [Rute Eksekutif & Pemilik Toko (Owner Suite)](#44-rute-eksekutif--pemilik-toko-owner-suite)
5. [Daftar Fitur Utama & Spesifikasi Fungsional](#5-daftar-fitur-utama--spesifikasi-fungsional)
   - 5.1 [Storefront Pelanggan: Format Mobile-First & Navigasi ScrollSpy](#51-storefront-pelanggan-format-mobile-first--navigasi-scrollspy)
   - 5.2 [Kustomisasi Produk, Badges, Estimasi Masak, & Standar 5 Kategori CMS](#52-kustomisasi-produk-badges-estimasi-masak--standar-5-kategori-cms)
   - 5.3 [Berbagi Menu & Keranjang (Web Share API & WhatsApp Direct Share)](#53-berbagi-menu--keranjang-web-share-api--whatsapp-direct-share)
   - 5.4 [Kalkulator Ongkos Kirim Presisi & Geolokasi GPS Otomatis](#54-kalkulator-ongkos-kirim-presisi--geolokasi-gps-otomatis)
   - 5.5 [Kontrol Status Operasional Toko & Validasi Layanan Checkout](#55-kontrol-status-operasional-toko--validasi-layanan-checkout)
   - 5.6 [Perpajakan (VAT 15%) & Metode Pembayaran Lokal (Pay2Cell, Bank, COD)](#56-perpajakan-vat-15--metode-pembayaran-lokal-pay2cell-bank-cod)
   - 5.7 [Checkout WhatsApp Otomatis & Standarisasi Bahasa Inggris](#57-checkout-whatsapp-otomatis--standarisasi-bahasa-inggris)
   - 5.8 [Operasional Dapur: Kitchen Kanban Board & Alert Keterlambatan](#58-operasional-dapur-kitchen-kanban-board--alert-keterlambatan)
   - 5.9 [Manajemen Pesanan Admin & Rekap Penjualan 7 Hari](#59-manajemen-pesanan-admin--rekap-penjualan-7-hari)
   - 5.10 [Manajemen Alur Kerja Digital & Paperless Operations](#510-manajemen-alur-kerja-digital--paperless-operations)
   - 5.11 [Poin Loyalitas Pelanggan](#511-poin-loyalitas-pelanggan)
   - 5.12 [Visual Storefront CMS, Pure-Visual Welcome Splash Screen, & Live Simulator](#512-visual-storefront-cms-pure-visual-welcome-splash-screen--live-simulator)
   - 5.13 [Media Gallery & Manajemen Aset Foto Produk](#513-media-gallery--manajemen-aset-foto-produk)
   - 5.14 [Manual Save System & Proteksi Unsaved Changes](#514-manual-save-system--proteksi-unsaved-changes)
   - 5.15 [Pusat Manajemen Pengguna, Akun Tim & Direktori Pelanggan (CRUD Suite /owner/staff)](#515-pusat-manajemen-pengguna-akun-tim--direktori-pelanggan-crud-suite-ownerstaff)
   - 5.16 [WhatsApp Ordering Suite & Custom Message Template Engine](#516-whatsapp-ordering-suite--custom-message-template-engine)
6. [Skema & Struktur Database (PostgreSQL)](#6-skema--struktur-database-postgresql)
7. [Spesifikasi Server RPC & Server Functions (API)](#7-spesifikasi-server-rpc--server-functions-api)
8. [Alur Penggunaan Sistem (End-to-End User Workflows)](#8-alur-penggunaan-sistem-end-to-end-user-workflows)
9. [Logika Bisnis & Formula Perhitungan](#9-logika-bisnis--formula-perhitungan)
10. [Panduan Operasional, Variabel Lingkungan (.env), dan Deployment](#10-panduan-operasional-variabel-lingkungan-env-dan-deployment)
11. [Riwayat Perbaikan Bug & Validasi Komprehensif Sistem (Phase 6)](#11-riwayat-perbaikan-bug--validasi-komprehensif-sistem-phase-6)
12. [Master Audit & Pengujian Menyeluruh Sistem (Phase 9: 238+ Test Scenarios 100% Pass)](#12-master-audit--pengujian-menyeluruh-sistem-phase-9-238-test-scenarios-100-pass)
    - 12.1 [Cakupan & Metodologi Pengujian Menyeluruh](#121-cakupan--metodologi-pengujian-menyeluruh)
    - 12.2 [Audit 38 Rute & Halaman Web (Storefront, Admin, Owner)](#122-audit-38-rute--halaman-web-storefront-admin-owner)
    - 12.3 [Audit Fitur Bisnis & Alur Transaksi](#123-audit-fitur-bisnis--alur-transaksi)
    - 12.4 [Audit Menu, Opsi Kustomisasi, & Sinkronisasi Stok & Storage Resilience](#124-audit-menu-opsi-kustomisasi--sinkronisasi-stok--storage-resilience)
    - 12.5 [Audit Keamanan: RBAC, Proteksi SSRF, SQL Injection, & Sanitasi Input](#125-audit-keamanan-rbac-proteksi-ssrf-sql-injection--sanitasi-input)
    - 12.6 [Audit Spesifik: CRUD Pengguna & Akun Staf (/owner/staff)](#126-audit-spesifik-crud-pengguna--akun-staf-ownerstaff)
    - 12.7 [Tabel Rekapitulasi Hasil Pengujian Master Audit (Phase 9)](#127-tabel-rekapitulasi-hasil-pengujian-master-audit-phase-9)

---

## 1. Ringkasan Eksekutif & Visi Produk

**Nanami Kitchen** adalah platform web aplikasi full-stack modern terintegrasi yang dirancang untuk operasi restoran dan _cloud kitchen_. Aplikasi ini berfokus pada kecepatan, efisiensi operasional, dan kepuasan pelanggan dengan menyatukan empat pilar utama:

1. **Storefront Pelanggan Bebas Hambatan (Customer PWA):** Memungkinkan pelanggan menjelajah menu, memilih variasi, melihat waktu persiapan dan lencana diet/alergen, mengisi instruksi khusus dapur, menghitung ongkos kirim berbasis koordinat Google Maps atau tombol GPS otomatis, serta menyelesaikan pesanan tanpa wajib membuat akun (**Guest Checkout**) melalui integrasi checkout WhatsApp otomatis dengan mata uang **Namibia Dollar (N$)**.
2. **Operasional Dapur & Manajemen Pesanan Real-Time (Kitchen & Admin Operations):** Pipeline pesanan dua arah yang menyediakan tampilan visual **Kitchen Kanban Board** (dengan sistem peringatan keterlambatan masak >30 menit), tabel **Order Management** komprehensif untuk kasir, pelacakan alur kerja paperless digital, tab rekap penjualan 7 hari, sakelar ketersediaan stok cepat (_instant stock toggle_), serta Media Gallery untuk foto hidangan.
3. **Kendali Bisnis & Manajemen Konten Eksekutif (Owner Executive Suite):** Dasbor keuangan, audit trail transaksi, CMS visual (_Content Management System_) untuk mengatur hero banner, announcement bar, welcome splash screen, urutan kategori, dan koleksi "Must Try!" dengan simulator layar ponsel _real-time_, serta sistem penyimpanan manual terproteksi (_Manual Save & Unsaved Changes Prompt_).
4. **WhatsApp Ordering Engine & Customization Suite:** Pusat kendali nomor tujuan WhatsApp, kustomisasi format pesan pesanan dengan variabel dinamis (`{order_code}`, `{items}`, `{total}`, dll.), preset pesan (Standard, Compact, Receipt), panduan styling teks WhatsApp, dan simulator live chat bubble secara interaktif.

---

## 2. Arsitektur Teknis & Tech Stack

| Komponen                  | Teknologi                                        | Keterangan & Peran                                                                                                                                           |
| :------------------------ | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework Inti**        | TanStack Start (v1.168.32)                       | Server-Side Rendering (SSR) dan isomorphic state hydration berbasis React 19.                                                                                |
| **Router**                | TanStack Router (v1.170.18)                      | Routing berbasis berkas (_file-based routing_) dengan type-safety menyeluruh di klien dan server.                                                            |
| **Server Engine**         | Nitro (v3.0.260603-beta) / Vite                  | Mesin server aplikasi; dikonfigurasi dengan preset **`node-server`** untuk deployment Node.js / container mandiri.                                           |
| **Modularitas Kode**      | Decoupled Modules                                | Pemisahan berkas mandiri (`types.ts`, `default-cms.ts`, `whatsapp.ts`, `currency.ts`, `images.ts`, `server-functions.ts`) untuk mencegah TDZ / siklus impor. |
| **UI Library**            | React 19 + Radix UI Primitives                   | Komponen UI aksesibel tingkat tinggi (Dialog, Sheet, Tabs, Accordion, Dropdown, Toggle, Tooltip).                                                            |
| **Styling & Animasi**     | Tailwind CSS (v4.2.1) + tw-animate-css           | Sistem utility CSS modern berkecepatan tinggi, responsif untuk mobile hingga desktop.                                                                        |
| **Ikonografi**            | Lucide React (v0.575.0)                          | Ikon grafis vektor konsisten di seluruh storefront dan dashboard.                                                                                            |
| **Grafik & Analitik**     | Recharts (v2.15.4)                               | Diagram tren omset, perbandingan metode pembayaran, dan grafik kategori terlaris.                                                                            |
| **Database Driver**       | PostgreSQL (`postgres` v3.4.9)                   | Driver native PostgreSQL berkecepatan tinggi dengan proteksi SQL injection via tagged templates.                                                             |
| **Resilience / Fallback** | In-Memory Local Store                            | Jika `DATABASE_URL` belum disetel atau database PostgreSQL tidak dapat diakses, sistem beralih otomatis ke in-memory store tanpa membuat aplikasi crash.     |
| **State Management**      | Isomorphic Custom Store (`useSyncExternalStore`) | Store reaktif dengan selector stabil, sinkronisasi dua arah ke database, dan caching teroptimasi.                                                            |
| **Format Mata Uang**      | `src/lib/currency.ts`                            | Pemformat terpusat menggunakan simbol **N$** (Namibia Dollar) dan locale `en-ZA`.                                                                            |
| **PWA & Offline**         | Service Worker (`/public/sw.js`) + Manifest      | Dukungan install home screen (Add to Home Screen), caching aset statis, dan prompt instalasi.                                                                |

---

## 3. Manajemen Peran, Akses (RBAC), & Alur Guest Checkout

Sistem menerapkan kontrol akses berbasis peran (_Role-Based Access Control_) yang dikawal oleh komponen gerbang `AuthGuard` (`src/components/AuthGuard.tsx`):

### 3.1 Matriks Peran & Wewenang

| Role                    | Kode    | Hak Akses & Wewenang                                                                                                                                                                                                             | Status Login                              | Akses Rute                                                                                   |
| :---------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Guest (Tamu)**        | _-_     | Melihat menu, filter kategori, kustomisasi varian, keranjang, kalkulasi ongkir, GPS otomatis, checkout WhatsApp, dan pelacakan order via kode transaksi (`?code=NK-xxxx`).                                                       | **Tidak Wajib**                           | `/`, `/menu/*`, `/cart`, `/checkout`, `/order-success`, `/tracking`, `/address`, `/vouchers` |
| **Customer (User)**     | `user`  | Seluruh fitur Guest + akumulasi Poin Loyalitas Nanami, riwayat pesanan akun terdaftar, dan buku alamat tersimpan.                                                                                                                | Opsional (Wajib jika buka profil/riwayat) | Semua rute publik + `/profile`, `/orders`, `/saved-address`                                  |
| **Kitchen Staff**       | `staff` | Memantau antrean pesanan dapur (Kitchen Board), mengubah status masak (_Incoming &rarr; Cooking &rarr; Ready &rarr; Completed_), dan sakelar ketersediaan stok menu harian.                                | **Wajib**                                 | `/admin` (Kitchen View), `/admin/orders`, `/admin/stock`                                     |
| **Admin**               | `admin` | Seluruh akses Staff + CRUD Menu Makanan & Minuman lengkap, Media Gallery, manajemen data pelanggan, laporan penjualan operasional, dan pengaturan operasional toko.                                                              | **Wajib**                                 | Seluruh rute `/admin/*` + hak akses Customer                                                 |
| **Owner (Super Admin)** | `owner` | Hak akses penuh atas seluruh modul sistem: Laporan keuangan & laba, CMS visual storefront, Live Simulator, manajemen voucher, manajemen outlet cabang, konfigurasi tarif logistik, WhatsApp settings, dan audit trail transaksi. | **Wajib**                                 | Seluruh rute aplikasi (`/*`, `/admin/*`, `/owner/*`)                                         |

### 3.2 Alur Guest Checkout

- Pelanggan baru tidak dipaksa melihat pop-up login saat pertama kali membuka aplikasi.
- Formulir checkout mengizinkan pengisian manual nama penerima, nomor WhatsApp, alamat pengantaran, dan titik Google Maps / tombol GPS otomatis.
- Kolom `account_id` pada tabel `orders` bernilai `NULL` untuk pesanan tamu (_guest_), dan terisi ID akun jika pelanggan sedang masuk (_logged in_).
- Setelah checkout berhasil, pelanggan tamu diberikan tautan pelacakan instan `/tracking?code={order.code}`.

### 3.3 Akun Demo Bawaan untuk Pengujian Instan:

- **Demo Customer:** `user@nanami.id` | Kata Sandi: `user123`
- **Demo Admin:** `admin@nanami.id` | Kata Sandi: `admin123`
- **Demo Owner:** `owner@nanami.id` | Kata Sandi: `owner123`

---

## 4. Katalog Halaman, Struktur Navigasi, & Rute (File-Based Routing)

### 4.1 Rute Autentikasi & Status Social Sign-In

- **`/login` (`src/routes/login.tsx`)**: Halaman masuk akun menggunakan email dan kata sandi native, dilengkapi tombol "Continue to Storefront as Guest" untuk melanjutkan belanja tanpa akun.
- **`/register` (`src/routes/register.tsx`)**: Halaman pendaftaran akun pelanggan baru (Nama, Email, Nomor Telepon/WhatsApp, dan Kata Sandi).
- **`/auth` (`src/routes/auth.tsx`)**: Halaman gerbang universal yang mengarahkan pengguna ke alur masuk atau daftar.

### 4.2 Rute Storefront Pelanggan, Top Bar Minimalis, & 4-Tab Bottom Nav

- **Top Bar Header Minimalis (Tanpa Logo Brand):** Header beranda storefront dirancang bersih tanpa logo gambar/teks besar. Logo brand dialokasikan pada _Welcome Splash Screen_, layar muat (_loading_), dan panel manajemen admin/owner.
- **Struktur 4-Tab Bottom Navigation Bar:** Batang navigasi bawah (`src/components/BottomNav.tsx`) menampilkan **4 tab utama**:
  1. **Home (`/`)**: Ikon rumah — akses langsung ke etalase utama dan katalog ScrollSpy.
  2. **Cart (`/cart`)**: Ikon tas belanja — dilengkapi lencana angka (_badge count_) jumlah item aktif di keranjang.
  3. **Orders (`/orders`)**: Ikon struk — daftar riwayat transaksi pesanan dan status aktif.
  4. **Profile (`/profile`)**: Ikon pengguna — akun pelanggan, saldo Poin Loyalitas Nanami, dan buku alamat tersimpan.
- **`/` (`src/routes/index.tsx`)**: Beranda utama toko (Storefront) mengintegrasikan Welcome Splash Screen, Running Announcement Bar, Hero Banner full-width, Selektor tipe pesanan (Pickup/Delivery), Navigasi pill kategori ScrollSpy, Must Try! Grid 2x2, FAQ akordeon, dan About Story.
- **`/menu` (`src/routes/menu.index.tsx`)**: Katalog menu lengkap dengan bilah pencarian dan filter kategori cepat.
- **`/menu/$itemId` (`src/routes/menu.$itemId.tsx`)**: Halaman detail item makanan (foto, opsi varian, catatan dapur, badges, estimasi waktu masak).
- **`/cart` (`src/routes/cart.tsx`)**: Halaman keranjang belanja dengan rincian varian, catatan, voucher promo, dan kalkulasi PPN/VAT 15%.
- **`/checkout` (`src/routes/checkout.tsx`)**: Alur checkout 3 langkah dengan tombol deteksi GPS otomatis, pilihan metode bayar, dan redirect WhatsApp terformat.
- **`/order-success` (`src/routes/order-success.tsx`)**: Halaman konfirmasi sukses setelah pesanan dibuat dengan tombol WhatsApp dan tracking link.
- **`/orders` (`src/routes/orders.tsx`)**: Riwayat pesanan akun terdaftar beserta status pengerjaan dan tombol kirim ulang ke WhatsApp.
- **`/tracking` (`src/routes/tracking.tsx`)**: Layar pelacakan status pesanan real-time via query param `?code=NK-xxxx`.
- **`/address` (`src/routes/address.tsx`)**: Kalkulator estimasi jarak dan biaya pengiriman berbasis GPS otomatis.
- **`/saved-address` (`src/routes/saved-address.tsx`)**: Manajemen buku alamat tersimpan untuk pengguna login.
- **`/vouchers` (`src/routes/vouchers.tsx`)**: Katalog voucher promosi aktif.
- **`/profile` (`src/routes/profile.tsx`)**: Profil pelanggan dan saldo Poin Loyalitas.

### 4.3 Rute Operasional Admin & Struktur Sidebar

1. **Kitchen Board (`/admin`)**: Dashboard pemantau pipeline pesanan dapur (Kitchen Kanban).
2. **Order Management (`/admin/orders`)**: Tabel manajemen pesanan kasir komprehensif, pelacakan status, dan tab rekap penjualan 7 hari.
3. **Menu Catalog (CRUD) (`/admin/menu`)**: Panel kelola hidangan makanan/minuman, grup opsi, dan Special Request.
4. **Media Library (`/admin/media`)**: Galeri aset foto produk dengan pelacak relasi item menu.
5. **Stock Availability (`/admin/stock`)**: Sakelar instan ketersediaan hidangan (Available/Sold Out) dan kuota stok.
6. **Customers (`/admin/customers`)**: Direktori data pelanggan PWA (role `user`), saldo poin, dan belanja kumulatif.
7. **Reports & Analytics (`/admin/reports`)**: Diagram analitik omset, distribusi kategori, dan nilai rata-rata pesanan.
8. **Operations & Settings (`/admin/settings`)**: Konfigurasi jam operasional, buka/tutup toko, nomor WhatsApp, dan Sticky Save Bar.

### 4.4 Rute Eksekutif & Pemilik Toko (Owner Suite)

1. **Overview (`/owner`)**: Dasbor performa bisnis menyeluruh pemilik usaha.
2. **Order Management (`/owner/orders`)**: Akses kilat pemilik memantau transaksi masuk harian.
3. **Finance (`/owner/finance`)**: Laporan laba kotor, perbandingan metode pembayaran, dan potongan voucher.
4. **Catalog (`/owner/menu`)**: Tinjauan katalog menu dari perspektif eksekutif.
5. **Media Library (`/owner/media`)**: Manajemen perpustakaan aset foto produk.
6. **Content CMS (`/owner/cms`)**: CMS visual storefront: hero banner, announcement, splash screen, urutan kategori, must-try, dan FAQ.
7. **Live Preview (`/owner/preview`)**: Simulator bingkai smartphone interaktif real-time.
8. **Vouchers & Promos (`/owner/vouchers`)**: Pembuatan kupon diskon (persen/nominal tetap) dan syarat minimal belanja.
9. **Accounts & Staff (`/owner/staff`)**: Manajemen staf internal (Owner, Admin, Kitchen Staff).
10. **Outlets (`/owner/outlets`)**: Manajemen cabang restoran dan jam buka gerai.
11. **Delivery Rates (`/owner/shipping`)**: Parameter tarif pengiriman, koordinat dapur, dan Route Factor.
12. **WhatsApp Settings (`/owner/whatsapp`)**: Konfigurasi nomor WhatsApp, editor template pesan pesanan kustom, starter presets, panduan markdown, dan simulator preview live chat bubble.
13. **Store Settings (`/owner/settings`)**: Konfigurasi rekening bank, eWallet Pay2Cell, VAT 15%, dan Poin Loyalitas.
14. **Activity Logs (`/owner/audit`)**: Catatan log audit sistem untuk setiap aksi krusial.

---

## 5. Daftar Fitur Utama & Spesifikasi Fungsional

### 5.1 Storefront Pelanggan: Format Mobile-First & Navigasi ScrollSpy

- **Tata Letak Mobile Terkunci di Seluruh Perangkat (Mobile-First Canvas):** Seluruh antarmuka storefront publik dikunci dalam format layar smartphone (`max-w-md` / 448px) di tengah viewport desktop dengan latar gelap elegan dan bayangan halus.
- **Hero Banner:** Gambar promosi horizontal di bagian atas layar dengan sudut membulat bawah (`rounded-b-2xl`), label kurasi, lencana kategori _"Delivery"_, dan tombol aksi _"Order Now"_.
- **Order Mode Selector:** Tombol sakelar mode _Pickup_ (Ambil Sendiri) atau _Delivery_ (Pesan Antar) di bawah hero banner dan di atas bilah pencarian.
- **Top Bar Minimalis:** Header utama hanya menampilkan teks nama toko dan lencana status operasional (`Open Now` / `Closed`).
- **Category Pills & Inline Search:** Tombol kategori berbentuk kapsul teks tanpa ikon, dilengkapi tombol pemicu pencarian.
- **Must Try! Grid (4–6 Item):** Menampilkan 4 hingga 6 produk unggulan hasil kurasi CMS dalam format grid 2x2 responsif dengan gambar rasio 1:1.
- **ScrollSpy Real-Time:** Menggunakan `IntersectionObserver` pada katalog vertikal; pill kategori otomatis aktif sesuai section yang terlihat.

### 5.2 Kustomisasi Produk, Badges, Estimasi Masak, & Standar 5 Kategori CMS

- **Badges & Prep Time:** Lencana diet/alergen (`Halal-friendly`, `Spicy`, `Vegan`) dan perkiraan waktu penyajian (`Prep ~15 mins`).
- **Standarisasi 5 Kategori Baku:** **`Meals`**, **`Snacks`**, **`Drinks`**, **`Combos`**, dan **`Others`**. Kustomisasi urutan tampil (`categoryOrder`) dan label nama (`categoryNames`) dikelola di CMS.
- **Toggle Grup Variasi & Add-On:** Pengaktifan grup variasi per produk dan penambahan harga add-on (`priceDelta`). Opsi harga 0 ditampilkan bersih tanpa label harga tambahan.
- **Special Request (Catatan Dapur):** Sakelar instruksi khusus per produk yang diteruskan ke keranjang, checkout, rincian pesanan, dan pesan WhatsApp.

### 5.3 Berbagi Menu & Keranjang (Web Share API & WhatsApp Direct Share)

- **Share Menu Item (`/menu/$itemId`):** Berbagi tautan dan detail menu ke aplikasi lain via Web Share API atau WhatsApp.
- **Share Cart (`/cart`):** Menyusun daftar pesanan lengkap beserta total tagihan untuk dibagikan via WhatsApp.

### 5.4 Kalkulator Ongkos Kirim Presisi, LocationPicker, & SSRF-Safe Location Service

- **Modalitas Penentuan Lokasi Cerdas (`LocationPicker.tsx`):**
  1. _GPS Otomatis ("Use Current Location" / "Gunakan Lokasi Saat Ini")_: Membaca koordinat lintang dan bujur via browser Geolocation API secara instan dengan indikator status akurasi dan penanganan izin lokasi.
  2. _Peta Interaktif OpenStreetMap / Leaflet (Modal Peta)_: Pelanggan dapat membuka modal peta interaktif, menggeser pin lokasi (_draggable marker_), atau mengetuk sembarang titik pada peta kota Windhoek untuk menentukan titik pengantaran secara presisi.
  3. _Reverse Geocoding Terproteksi_: Koordinat yang dipilih otomatis dikonversi menjadi alamat teks manusiawi melalui proxy server `/api/location/reverse` (menggunakan OpenStreetMap Nominatim dengan proteksi SSRF dan caching) tanpa membocorkan kredensial atau membebani browser pengguna.
  4. _Input Tautan Google Maps_: Pelanggan dapat menempelkan URL Google Maps (`https://maps.app.goo.gl/...` atau `https://www.google.com/maps?...`) langsung dari aplikasi Google Maps.
  5. _Input Manual Alamat & Koordinat_: Pelanggan dapat mengetik alamat jalan lengkap secara manual dengan opsi input pin koordinat.
- **SSRF-Safe Location Service (`src/server/location-service.ts` & `/api/resolve-maps-url`):**
  - Mengamankan pemrosesan URL Google Maps dari serangan _Server-Side Request Forgery_ (SSRF).
  - _Domain Whitelist_: Hanya mengizinkan protokol HTTPS pada domain Google Maps yang sah (`maps.app.goo.gl`, `goo.gl`, `maps.google.com`, `www.google.com`).
  - _DNS & IP Range Verification_: Melakukan lookup DNS asinkron dan memblokir alamat IP privat/internal: loopback (`127.0.0.0/8`, `::1`), RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), dan endpoint metadata cloud instance (`169.254.169.254`).
  - _Regex Coordinate Parsing_: Mengekstraksi koordinat lintang dan bujur dari format URL standar `/@(-?\d+\.\d+),(-?\d+\.\d+)/`, `[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)`, serta parameter query `ll`.
- **Kalkulasi Haversine + Route Factor:** Menghitung jarak lengkung bumi dari dapur di Windhoek (`lat: -22.5609, lng: 17.0658`) dikalikan `routeFactor` (default 1.3).
- **Proteksi Radius Pengiriman:** Menolak pesanan antar jika melampaui `settings.maxRadiusKm` (default 25 km) dengan pesan edukatif.
- **Garansi Ongkir Pickup Nol (N$ 0):** Jika mode pesanan adalah Pickup, biaya pengiriman dijamin mutlak N$ 0 tanpa terpengaruh oleh koordinat atau alamat pelanggan.

### 5.5 Kontrol Status Operasional Toko & Logika Ketersediaan Independen

- **Master Switch Status Toko (`storeOpen`):** Menutup seluruh operasional toko. Jika `storeOpen = false`, tombol checkout dinonaktifkan dengan banner pemberitahuan jelas dan seluruh pengajuan pesanan ditolak.
- **Sakelar Ketersediaan Independen Delivery & Pickup (`order-availability.ts`):**
  - Mengelola `deliveryAvailable` (layanan antar) dan `pickupAvailable` (ambil di tempat) secara terpisah.
  - _Auto-Switch Resolution Algorithm (`resolveOrderType`)_:
    - Jika pelanggan meminta Delivery namun `deliveryAvailable = false` sementara `pickupAvailable = true`, sistem otomatis mengalihkan pesanan ke Pickup ("Pickup only").
    - Jika pelanggan meminta Pickup namun `pickupAvailable = false` sementara `deliveryAvailable = true`, sistem otomatis mengalihkan pesanan ke Delivery ("Delivery only").
    - Jika kedua sakelar nonaktif atau toko tutup, sistem mengembalikan `null`.
  - _Order Submission Validation (`validateNewOrderSubmission`)_: Memvalidasi ketersediaan sebelum pesanan dibuat di keranjang/checkout. Mencegah manipulasi klien dan memberikan umpan balik instruktif jika salah satu saluran layanan sedang tidak aktif.

### 5.6 Perpajakan (VAT 15%) & Metode Pembayaran Lokal (Pay2Cell, Bank, COD)

- **PPN / VAT:** Persentase pajak yang dapat disesuaikan (default 15%) dengan sakelar hidup/mati (`vatEnabled`).
- **eWallet Lokal (Pay2Cell):** Opsi pembayaran dompet digital Namibia.
- **Transfer Bank / EFT:** Instruksi rekening bank toko dengan tombol salin satu ketukan.
- **Cash on Delivery (COD):** Pembayaran di tempat dengan toggle global (`codEnabled`).

### 5.7 Checkout WhatsApp Otomatis, Token {maps_link}, & Standarisasi Bahasa Inggris

- **Standarisasi 100% Bahasa Inggris**: Seluruh antarmuka storefront, katalog menu, keranjang, formulir checkout, tracking, buku alamat, portal admin, kitchen kanban, dan owner suite distandardisasi penuh dalam bahasa Inggris profesional.
- **Tautan Navigasi Google Maps Langsung (`{maps_link}`):** Pesan pesanan Delivery secara otomatis menyertakan `{maps_link_block}` (`• Maps Link: https://www.google.com/maps?q=...`), memungkinkan kurir atau pengemudi membuka rute GPS ke alamat pelanggan dengan satu ketukan. Pada pesanan Pickup, tautan disembunyikan secara bersih.
- **Pesan Pesanan WhatsApp Terstruktur:** Menyusun pesan terformat rapi memuat kode struk, rincian pelanggan, jenis pesanan, tautan peta, daftar item beserta modifikator dan catatan, ringkasan pembayaran (Subtotal, VAT 15%, Diskon Voucher, Ongkir, Total), serta metode pembayaran.
- **Direct WhatsApp Redirect:** Mengalihkan pengguna ke WhatsApp toko via `https://wa.me/{number}?text={encoded}` dengan nomor tujuan yang dapat dikonfigurasi di pengaturan Owner.

### 5.8 Operasional Dapur: Kitchen Kanban Board & Alert Keterlambatan

- Monitor dapur dengan 4 kolom status: _Incoming_, _Cooking_, _Ready_, dan _Completed_.
- Peringatan visual berkedip merah jika pesanan dalam status _Cooking_ melampaui 30 menit.

### 5.9 Manajemen Pesanan Admin & Rekap Penjualan 7 Hari

- Tabel pesanan terpadu kasir dengan pencarian instan, filter status, dan tab rekap omset 7 hari terakhir.

### 5.10 Manajemen Alur Kerja Digital & Paperless Operations

- **Alur Kerja Tanpa Kertas (Paperless Order Workflow):** Operasional pesanan sepenuhnya terintegrasi secara digital melalui Kitchen Kanban Board dan rincian transaksi langsung di layar, meniadakan ketergantungan pada pencetakan kertas termal konvensional untuk kecepatan dan efisiensi ramah lingkungan.
- **Pelacakan Status Real-Time:** Perubahan status transaksi langsung tersinkronisasi dua arah ke database dan customer live tracking.

### 5.11 Poin Loyalitas Pelanggan

- Akumulasi poin otomatis untuk pesanan pengguna terdaftar berdasarkan `pointsPer10k`.

### 5.12 Visual Storefront CMS, Pure-Visual Welcome Splash Screen, & Live Simulator

- **Pusat Kontrol Visual CMS (`/owner/cms`):** Mengelola branding visual etalase publik (Announcement bar, Hero banner, urutan kategori, dan koleksi kurasi "Must Try!").
- **Pure-Visual Welcome Splash Screen Overhaul:**
  - **Eliminasi Input Teks Overlay:** Menghilangkan form input teks (_Title_, _Subtitle_, _Slogan_) dari panel CMS untuk menghasilkan pengalaman visual murni tanpa gangguan teks yang saling menumpuk atau pecah di berbagai rasio layar.
  - **Tampilan Penuh Layar (Full-Bleed 100dvh):** Komponen `WelcomeScreen.tsx` dirender dengan styling `fixed inset-0 h-[100dvh] w-screen object-cover object-center` sehingga otomatis mengisi penuh layar smartphone, tablet, maupun layar desktop tanpa letterboxing atau peregangan proporsi.
  - **Pemuatan Berkecepatan Tinggi (Eager Loading):** Menggunakan atribut native `loading="eager"` dan `decoding="sync"` untuk memuat visual pembuka secara instan saat sesi pertama kali diakses.
  - **Gesture Tap-to-Enter Instan:** Layar splash dapat diketuk/ditekan di titik mana saja untuk langsung masuk ke menu storefront tanpa harus menunggu durasi selesai, dilengkapi petunjuk mengambang elegan di sisi bawah berstandar bahasa Inggris 100%: _"Tap anywhere to continue →"_.
  - **Multi-Source Image Selector:**
    1. _Preset Curated Photos:_ Pilihan foto hidangan andalan resolusi tinggi bawaan Nanami.
    2. _Direct Device File Upload:_ Unggah foto custom langsung dari memori smartphone atau laptop dengan kompresi cerdas.
    3. _Media Gallery Linker:_ Memilih aset foto yang telah tersimpan di perpustakaan Media Library.
    4. _External Image URL:_ Memasukkan URL gambar HTTPS publik secara manual.
    5. _Reset Button:_ Tombol satu-klik untuk mengembalikan gambar splash ke preset default sistem.
  - **Kontrol Status & Timer:** Sakelar aktivasi On/Off dan pengatur durasi tampil otomatis (1.5 detik s/d 6 detik) dengan indikator hitung mundur yang halus.
  - **Live Mobile Preview Simulator (9:16 Aspect Ratio):** Pratinjau interaktif real-time di CMS yang menyimulasikan rasio mobile 9:16 untuk memvalidasi posisi dan ketajaman gambar splash sebelum disimpan.
- **Simulator Bingkai Smartphone Interaktif (`/owner/preview`):** Halaman khusus pemilik toko untuk mencoba storefront secara utuh dalam bingkai mock-up ponsel cerdas dengan sakelar model perangkat.

### 5.13 Media Gallery & Manajemen Aset Foto Produk

- Penyimpanan aset gambar produk dengan pelacak relasi item menu (`used_by_menu_ids`).

### 5.14 Manual Save System & Proteksi Unsaved Changes

- Deteksi perubahan lokal dengan bilah melayang `StickySaveBar` dan dialog konfirmasi `UnsavedChangesPrompt`.

### 5.15 Pusat Manajemen Pengguna, Akun Tim & Direktori Pelanggan (CRUD Suite /owner/staff)

Modul **Accounts & Staff (`/owner/staff`)** adalah suite manajemen pengguna komprehensif bagi Pemilik Toko (Owner) untuk mengontrol seluruh akses akun secara sentral dan aman:

1. **Pembuatan Pengguna Baru (Create User):**
   - **Formulir Terpadu:** Menyediakan input Nama Lengkap, Alamat Email terverifikasi, Nomor Telepon/WhatsApp, Kata Sandi Login langsung (dengan tombol *Acak Sandi* / generator password instan dan toggle intip sandi), serta sakelar status akun (Aktif / Nonaktif).
   - **Pemilihan Hak Akses (Role Selector):**
     - **Owner:** Akses mutlak sistem, manajemen keuangan, audit trail, dan konfigurasi master.
     - **Admin:** Operasional dapur, kitchen board, manajemen pesanan, katalog menu, dan stok.
     - **Staff:** Kasir & petugas pelayan, asistensi pesanan pelanggan, dan pembaruan status penyajian.
     - **Customer / Pelanggan:** Akun publik untuk pemesanan, buku alamat, dan akumulasi poin loyalitas.
   - **Sinkronisasi Otomatis Dual-Layer:** Pembuatan pengguna otomatis membuat entri di tabel `accounts` (sehingga pengguna langsung memiliki kredensial otentikasi login) dan tabel `staff` (jika role adalah Owner, Admin, atau Staff), tersimpan ke PostgreSQL dan persistent local storage fallback.

2. **Daftar & Penjelajahan Pengguna Terpadu (Read Users):**
   - **Konsolidasi Akun & Staf:** Menggabungkan seluruh data dari `accounts` dan `staff` secara seamless tanpa duplikasi email.
   - **Kartu Metrik Ringkasan:** Menampilkan total akun, jumlah Owner, Admin, Staff, Pelanggan terdaftar, serta jumlah akun aktif secara real-time.
   - **Pencarian Real-Time:** Filter instan berdasarkan nama, alamat email, atau nomor telepon.
   - **Filter Cepat Peran & Status:** Filter pills (*Semua, Tim, Owner, Admin, Staff, Pelanggan*) dan pemilih status (*Semua, Aktif, Nonaktif*).
   - **Visual Badge & Indikator Kredensial:** Badge warna unik per role dan indikator kesiapan login (*Siap Login* vs *Belum ada sandi*).

3. **Pembaruan & Modifikasi Pengguna (Update User):**
   - **Mode Edit Lengkap:** Tombol edit (pensil) memuat data profil ke formulir; owner dapat mengubah nama, email, nomor HP, peran hak akses, kata sandi baru (opsional, jika dikosongkan mempertahankan kata sandi lama), dan status aktif.
   - **Quick Action Inline:** Dropdown role instan dan tombol toggle status langsung pada baris kartu pengguna tanpa harus membuka formulir penuh.

4. **Penghapusan Aman & Proteksi Diri (Delete User & Self-Protection):**
   - **Dialog Konfirmasi:** Peringatan konfirmasi sebelum eksekusi penghapusan permanen.
   - **Penghapusan Menyeluruh:** Menghapus data akun dari tabel `accounts` dan tabel `staff` secara atomik di database dan state klien.
   - **Proteksi Anti-Lockout (Self-Deletion Protection):** Sistem secara ketat mendeteksi email akun Owner yang sedang aktif digunakan dan memblokir upaya penghapusan atau demosi diri sendiri untuk mencegah admin terkunci dari sistem.

### 5.16 WhatsApp Ordering Suite & Custom Message Template Engine

- **Halaman Khusus Owner (`/owner/whatsapp`)**: Antarmuka lengkap berbahasa Inggris untuk mengelola saluran pemesanan WhatsApp.
- **Dynamic Template Engine**: Mesin interpolasi token dinamis yang mendukung placeholder:
  - `{order_code}`: Kode transaksi (e.g. `NK-4820`)
  - `{customer_name}`: Nama lengkap pelanggan
  - `{customer_phone}`: Nomor WhatsApp pelanggan
  - `{order_type}`: Tipe pesanan (🚚 Delivery / 🛍️ Pickup)
  - `{delivery_address}`: Alamat pengantaran jalan
  - `{delivery_note}`: Catatan lokasi / landmark
  - `{maps_link}`: Tautan navigasi Google Maps akurat untuk kurir/pengantar
  - `{items}`: Daftar hidangan dengan jumlah, varian, catatan, dan subtotal
  - `{items_count}`: Total item di keranjang
  - `{subtotal}`: Subtotal belanja produk
  - `{vat}`: Nilai nominal PPN/VAT
  - `{discount}`: Nilai potongan voucher
  - `{voucher_code}`: Kode promo voucher
  - `{delivery_fee}`: Biaya pengiriman
  - `{total}`: Total tagihan akhir
  - `{payment_method}`: Metode pembayaran yang dipilih
  - `{eta}`: Estimasi waktu persiapan/pengantaran
  - `{store_name}`: Nama toko
- **Starter Template Presets**:
  1. _Standard Detailed_: Rincian komprehensif dengan emoji, rincian biaya, dan catatan lengkap.
  2. _Compact & Fast_: Format ringkas untuk operasional dapur cepat.
  3. _Receipt Ticket_: Layout ala struk kasir bergaris rapi.
  4. _Custom_: Kustomisasi penuh teks template bebas.
- **Quick-Insert Variable Chips**: Tombol chip variabel yang dapat diklik untuk menyisipkan token langsung pada posisi kursor di editor teks.
- **Interactive Formatting Guide**: Panduan sintaksis markdown WhatsApp (`*bold*`, `_italic_`, `~strike~`, `code`) dan tabel variabel lengkap dengan tombol _Copy Token_.
- **Live WhatsApp Chat Simulator Mockup**: Komponen visual menyerupai aplikasi WhatsApp asli (header hijau, avatar toko, bubble chat, jam, dan tanda centang biru ganda `✓✓`) dengan pemilih skenario pesanan langsung (Delivery, Pickup, Catering Combo) serta tombol pengujian langsung ke aplikasi WhatsApp.
- **Country Code Helper**: Pilihan cepat kode negara internasional (+264 Namibia sebagai default teratas, +27 South Africa, +62 Indonesia, +1 US/CA, +44 UK, +65 Singapore, +60 Malaysia, +61 Australia).

---

## 6. Skema & Struktur Database (PostgreSQL)

Database menggunakan 9 tabel terindeks dengan tipe data native dan dokumen JSONB terstruktur:

### 6.1 Tabel `app_settings`

Menyimpan konfigurasi parameter toko, tarif ongkir, rekening bank, pengaturan perpajakan, dan template WhatsApp.

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(50) PRIMARY KEY, -- Nilai tetap: 'main_settings'
  data JSONB NOT NULL         -- Objek Settings lengkap
);
```

_Struktur data JSONB mencakup:_ `currencySymbol` (N$), `storeName`, `storeOpen`, `deliveryOn`, `pickupOn`, `codEnabled`, `vatEnabled`, `vatPercent`, `whatsapp`, `whatsappTemplate`, `whatsappHeader`, `whatsappFooter`, `whatsappPreset`, `baseFee`, `feePerKm`, `minFee`, `maxRadiusKm`, `freeDeliveryAbove`, `routeFactor`, `storeLat`, `storeLng`, `bankName`, `bankAccount`, `bankHolder`, `ewallet`, `pointsPer10k`, `adminPassword`.

### 6.2 Tabel `cms_content`

Menyimpan seluruh konfigurasi tampilan visual dan teks storefront pelanggan.

```sql
CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(50) PRIMARY KEY, -- Nilai tetap: 'main_cms'
  data JSONB NOT NULL         -- Objek CmsContent lengkap
);
```

_Struktur data JSONB mencakup:_ `brandName`, `tagline`, `logoUrl`, `heroImage`, `heroActive`, `announcement`, `welcomeScreen`, `socials`, `aboutStory`, `faqs`, `mustTryItemIds`, `categoryOrder`, `categoryNames`.

### 6.3 Tabel `menu_items`

Menyimpan katalog hidangan makanan, minuman, dan paket combo.

```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category VARCHAR(100) NOT NULL,                    -- 'Meals' | 'Snacks' | 'Drinks' | 'Combos' | 'Others'
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  prep_minutes INTEGER NOT NULL DEFAULT 15,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,        -- Array string: ["Halal-friendly", "Spicy"]
  stock INTEGER,                                    -- Nullable jika kuota tidak dibatasi
  groups JSONB NOT NULL DEFAULT '[]'::jsonb,        -- Array OptionGroup (dengan toggle enabled & priceDelta)
  special_request_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.4 Tabel `orders`

Menyimpan riwayat seluruh transaksi pemesanan yang masuk.

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,                 -- Kode struk transaksi (e.g. 'NK-7892')
  created_at BIGINT NOT NULL,                       -- Timestamp milidetik
  type VARCHAR(20) NOT NULL,                        -- 'pickup' | 'delivery'
  lines JSONB NOT NULL,                             -- Array CartLine[]
  subtotal NUMERIC NOT NULL,
  vat_amount NUMERIC DEFAULT 0,                     -- Nilai nominal VAT
  vat_percent NUMERIC DEFAULT 15,                   -- Persentase tarif VAT
  discount NUMERIC NOT NULL,
  voucher_code VARCHAR(50),
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,                      -- 'Pending Payment' | 'Cooking' | 'Out for Delivery' | 'Ready for Pickup' | 'Completed' | 'Cancelled'
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method VARCHAR(100) NOT NULL,             -- 'ewallet' | 'bank' | 'cod'
  points_earned INTEGER NOT NULL DEFAULT 0,
  eta_minutes INTEGER NOT NULL DEFAULT 15,
  customer JSONB NOT NULL,                          -- { name, phone, address, deliveryNote }
  account_id VARCHAR(50)                            -- Nullable (NULL = Guest order, terisi jika login)
);
```

### 6.5 Tabel `media_assets`

Menyimpan metadata foto produk untuk perpustakaan media gallery.

```sql
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(50) PRIMARY KEY,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploaded_at BIGINT NOT NULL,
  used_by_menu_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

### 6.6 Tabel `promos`

Menyimpan daftar spanduk promosi berjalan pada carousel beranda.

```sql
CREATE TABLE IF NOT EXISTS promos (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  badge VARCHAR(100) NOT NULL,
  image_url TEXT,
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.7 Tabel `vouchers`

Menyimpan kode kupon promosi dan diskon toko.

```sql
CREATE TABLE IF NOT EXISTS vouchers (
  code VARCHAR(50) PRIMARY KEY,                     -- e.g. 'NANAMI10'
  type VARCHAR(20) NOT NULL,                        -- 'percent' | 'fixed'
  value NUMERIC NOT NULL,
  min_spend NUMERIC NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.8 Tabel `accounts`

Menyimpan akun pengguna terdaftar dan data profil pelanggan.

```sql
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',         -- 'user' | 'admin' | 'owner' | 'staff'
  address TEXT,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL DEFAULT 0
);
```

### 6.9 Tabel `staff`

Menyimpan daftar staf internal restoran dan penugasan peran kerja.

```sql
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,                        -- 'owner' | 'admin' | 'staff'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL
);
```

---

## 7. Spesifikasi Server RPC & Server Functions (API)

Aplikasi memanfaatkan **Server Functions** TanStack Start (`createServerFn`) di berkas `src/lib/server-functions.ts` yang berjalan aman di sisi server:

| Nama Server Function      | Tipe   | Validasi Input                              | Deskripsi Operasi                                                                                                                          |
| :------------------------ | :----- | :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `getDatabaseState`        | `GET`  | _None_                                      | Mengambil seluruh state terpadu (settings, CMS, menu, orders, promos, vouchers, accounts, staff, media assets) saat inisialisasi aplikasi. |
| `saveMenuItemDb`          | `POST` | `MenuItem`                                  | Upsert hidangan menu ke tabel `menu_items` (termasuk `groups` dan `special_request_enabled`).                                              |
| `deleteMenuItemDb`        | `POST` | `{ id: string }`                            | Menghapus item menu hidangan dari database.                                                                                                |
| `saveOrderDb`             | `POST` | `Order`                                     | Menyimpan transaksi baru (dengan `account_id` opsional) atau memperbarui status pengerjaan dan status pelunasan pesanan.                   |
| `searchOrdersDb`          | `POST` | `{ query?: string, statusFilter?: string }` | Pencarian dan penyaringan pesanan di tingkat database berdasarkan nama, kode, atau status.                                                 |
| `saveVoucherDb`           | `POST` | `Voucher`                                   | Menyimpan atau memperbarui kupon diskon di tabel `vouchers`.                                                                               |
| `deleteVoucherDb`         | `POST` | `{ code: string }`                          | Menghapus kode kupon diskon.                                                                                                               |
| `savePromoDb`             | `POST` | `Promo`                                     | Menyimpan atau memperbarui banner carousel promosi di tabel `promos`.                                                                      |
| `deletePromoDb`           | `POST` | `{ id: string }`                            | Menghapus banner promosi.                                                                                                                  |
| `saveAccountDb`           | `POST` | `Account`                                   | Menyimpan atau memperbarui akun pengguna di tabel `accounts` (PostgreSQL dan local fallback).                                              |
| `deleteAccountDb`         | `POST` | `{ id: string }`                            | Menghapus data akun pengguna (berdasarkan ID atau Email) dari tabel `accounts` dan storage fallback.                                       |
| `saveStaffDb`             | `POST` | `StaffMember`                               | Menyimpan atau memperbarui anggota tim internal di tabel `staff` (PostgreSQL dan local fallback).                                           |
| `deleteStaffDb`           | `POST` | `{ id: string }`                            | Menghapus akun staf internal (berdasarkan ID atau Email) dari tabel `staff` dan storage fallback via `deleteStaffStorage`.                  |
| `saveSettingsDb`          | `POST` | `Settings`                                  | Menyimpan konfigurasi operasional toko, tarif, WhatsApp template, dan pajak ke tabel `app_settings`.                                       |
| `saveCmsDb`               | `POST` | `CmsContent`                                | Menyimpan konfigurasi konten visual, urutan kategori, must-try, dan FAQ ke tabel `cms_content`.                                            |
| `saveMediaAssetDb`        | `POST` | `MediaAsset`                                | Menyimpan metadata aset foto produk baru ke tabel `media_assets`.                                                                          |
| `deleteMediaAssetDb`      | `POST` | `{ id: string }`                            | Menghapus aset foto setelah memvalidasi bahwa aset tidak sedang digunakan oleh menu manapun.                                               |
| `updateMediaAssetUsageDb` | `POST` | `{ assetId: string, menuIds: string[] }`    | Memperbarui daftar relasi menu yang menggunakan aset foto terkait.                                                                         |

---

## 8. Alur Penggunaan Sistem (End-to-End User Workflows)

### Alur 1: Pelanggan Tamu Memesan Makanan (Guest Checkout Journey)

```
[Buka Halaman Utama /]
         ↓
[Lihat Welcome Screen & Banner Promo] ──→ [Telusuri Katalog via ScrollSpy]
         ↓
[Pilih Item Makanan di /menu/$id] ──→ [Lihat Badges & Waktu Masak] ──→ [Pilih Opsi & Catatan Dapur]
         ↓
[Tambah ke Keranjang] ──→ [Buka /cart] ──→ [Opsi Bagikan Keranjang / Share Cart]
         ↓
[Terapkan Voucher Promo] ──→ [Pilih Mode: 🛍️ Pickup atau 🚚 Delivery]
         ↓
[Buka Halaman /checkout (Tanpa Wajib Login)]
     ├── Langkah 1: Masukkan Nama, No. WhatsApp, & Alamat (Deteksi Lokasi via Tombol "Use GPS")
     ├── Langkah 2: Pilih Metode Bayar (Pay2Cell / Bank Transfer / COD)
     └── Langkah 3: Validasi Status Toko & Tinjau Rincian (Subtotal + VAT 15% - Diskon + Ongkir)
         ↓
[Klik "Order via WhatsApp"] ──→ [Dialihkan ke WhatsApp Toko Menggunakan Template Kustom]
         ↓
[Pesanan Tercatat di Sistem & Pelanggan Mendapat Link /tracking?code=NK-xxxx]
```

### Alur 2: Operasional Dapur & Pemrosesan Pesanan (Kitchen & Admin Flow)

```
[Pesanan Baru Masuk dari Web / WhatsApp]
         ↓
[Otomatis Muncul di Kolom "Incoming" pada Kitchen Board & Tabel /admin/orders]
         ↓
[Kasir Memeriksa Bukti Transfer & Mengklik "Start cooking"]
         ↓
[Pesanan Berpindah ke Kolom "In Progress / Cooking"]
     └── Jika pesanan di dapur > 30 menit ──→ Muncul lencana peringatan LATE merah berkedip
         ↓
[Makanan Selesai Dimasak & Dipacking] ──→ [Klik "Mark ready"]
         ↓
[Pesanan Berpindah ke Kolom "Ready" (Siap Diambil / Diantar Kurir)]
         ↓
[Pesanan Diterima Pelanggan & Ditandai "Completed"]
```

### Alur 3: Konfigurasi WhatsApp Template & Pengujian Pesan (Owner WhatsApp Suite)

```
[Owner Masuk ke Akun di /login]
         ↓
[Membuka Menu /owner/whatsapp di Sidebar]
         ↓
[Pilih Kode Negara (+27 / +62 / dll.) & Masukkan Nomor WhatsApp Toko]
         ↓
[Pilih Preset Template (Standard / Compact / Receipt) atau Buat Kustom]
         ↓
[Sisipkan Variabel Dinamis {order_code}, {items}, {total} via Chip Selector]
         ↓
[Uji Tampilan Real-Time di Simulator Chat WhatsApp dengan 3 Skenario Pesanan]
         ↓
[Klik "Test on WhatsApp" untuk Menguji di Aplikasi WhatsApp Sebenarnya]
         ↓
[Klik [Save Changes] pada StickySaveBar ── Pengaturan Aktif di Seluruh Alur Checkout]
```

---

## 9. Logika Bisnis & Formula Perhitungan

### 9.1 Formula Ongkos Kirim (`deliveryFeeFor`)

1. Jika tipe pesanan adalah **`pickup`**, maka:
   $$\text{Delivery Fee} = 0$$
2. Jika nilai subtotal belanja $\ge$ `settings.freeDeliveryAbove` (dan nilai ambang batas $> 0$), maka:
   $$\text{Delivery Fee} = 0 \quad (\text{Gratis Ongkir})$$
3. Untuk pesanan pengantaran reguler:
   $$\text{Biaya Terhitung} = \text{BaseFee} + (\text{DistanceKm} \times \text{FeePerKm})$$
4. Ongkos kirim final yang ditagihkan adalah nilai maksimum antara Biaya Terhitung dan Biaya Minimum:
   $$\text{Final Delivery Fee} = \max(\text{MinFee}, \text{Round}(\text{Biaya Terhitung}))$$

### 9.2 Formula Jarak Koordinat (Haversine + Route Factor)

Menghitung jarak lengkung bumi antara koordinat toko $(\text{lat}_1, \text{lng}_1)$ dan lokasi pemesan $(\text{lat}_2, \text{lng}_2)$:
$$\Delta\text{lat} = \text{rad}(\text{lat}_2 - \text{lat}_1), \quad \Delta\text{lng} = \text{rad}(\text{lng}_2 - \text{lng}_1)$$
$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{rad}(\text{lat}_1)) \cdot \cos(\text{rad}(\text{lat}_2)) \cdot \sin^2\left(\frac{\Delta\text{lng}}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
$$\text{Jarak Tempuh Jalan Raya (Km)} = (6371 \times c) \times \text{RouteFactor}$$

### 9.3 Formula Pajak (VAT 15%)

Jika `settings.vatEnabled = true`:
$$\text{VAT Amount} = \text{Subtotal} \times \left(\frac{\text{vatPercent}}{100}\right)$$
$$\text{Grand Total} = \text{Subtotal} + \text{VAT Amount} - \text{Diskon Voucher} + \text{Delivery Fee}$$

### 9.4 Formula Diskon Voucher (`discountFor`)

- **Tipe Persentase (`percent`):**
  $$\text{Diskon} = \text{Subtotal} \times \left(\frac{\text{Nilai}}{100}\right)$$
- **Tipe Nominal Tetap (`fixed`):**
  $$\text{Diskon} = \min(\text{Subtotal}, \text{Nilai})$$
- _Ketentuan:_ Jika $\text{Subtotal} < \text{MinSpend}$, maka $\text{Diskon} = 0$.

---

## 10. Panduan Operasional, Variabel Lingkungan (.env), dan Deployment

### 10.1 Variabel Lingkungan (`.env`)

```env
# Koneksi Database PostgreSQL (Opsional - otomatis fallback ke in-memory jika kosong/unreachable)
DATABASE_URL=postgresql://postgres:password@localhost:5432/nanamikitchen

# Kredensial Login Internal (.env)
OWNER_EMAIL=owner@nanami.id
OWNER_PASSWORD=owner123

ADMIN_EMAIL=admin@nanami.id
ADMIN_PASSWORD=admin123

STAFF_EMAIL=staff@nanami.id
STAFF_PASSWORD=staff123

# Port Dev/Production Server
PORT=3000

# Mode Lingkungan
NODE_ENV=production
```

### 10.2 Perintah Setup Database & Testing

```bash
# Menguji integrasi menyeluruh: REST API, Auth, CMS Hero/Welcome, Orders, dan 38 Halaman Web (68/68 passed)
npx tsx src/scripts/test-full-integration-suite.ts

# Menguji integritas sistem komprehensif, RBAC Matrix, Lokasi, WhatsApp & Lokalisasi (73/73 passed)
npx tsx src/scripts/test-comprehensive-system.ts

# Menguji ketersediaan independen delivery/pickup, resolusi SSRF lokasi, & WhatsApp {maps_link} (28/28 passed)
npx tsx src/scripts/test-availability-and-location.ts

# Menguji seluruh 38 rute aplikasi dan status HTTP (200 OK)
npx tsx src/scripts/test-all-routes.ts

# Menguji regresi fungsional sistem (VAT, COD, eWallet, Category Pricing)
npx tsx src/scripts/test-phase4-regression-category.ts
npx tsx src/scripts/test-phase5-regression.ts
npx tsx src/scripts/verify-admin-rbac.ts

# Memeriksa kualitas kode dan sintaksis
npm run lint

# Membangun aplikasi untuk lingkungan produksi
npm run build

# Menjalankan server aplikasi
npm run start
```

### 10.3 Konfigurasi Reverse Proxy Nginx (Contoh Deployment)

```nginx
server {
    listen 80;
    server_name order.nanamikitchen.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 11. Riwayat Perbaikan Bug & Validasi Komprehensif Sistem (Phase 6)

### 11.1 Pemecahan Bug & Solusi Arsitektural

1. **Bug Media Hilang Setelah Refresh / Logout:**
   - _Penyebab:_ Media yang diunggah hanya tersimpan parsial atau ter-overwrite oleh pembacaan awal seed state saat koneksi PostgreSQL cold-boot.
   - _Implementasi Solusi:_ Sinkronisasi multi-layer di `src/server/persistent-storage.ts` (`saveMediaAssetStorage`, `deleteMediaAssetStorage`) dan penggabungan state di `getDatabaseState` (`src/lib/server-functions.ts`). Media baru yang diunggah dipertahankan ke `data/nanami-db.json` serta tabel `media_assets` PostgreSQL secara bersamaan.
2. **Bug Sesi Logout Otomatis Saat Halaman CMS Direfresh:**
   - _Penyebab:_ Token sesi yang dibuat hanya ada di memori tabel PostgreSQL tanpa fallback persistent storage lokal, sehingga jika worker process mengalami restart atau koneksi DB timeout, sesi terputus.
   - _Implementasi Solusi:_ Diterapkan sistem fallback sesi (`saveSessionStorage`, `getSessionStorage`, `deleteSessionStorage`) di `src/server/persistent-storage.ts`. `getSessionProfileDb` di `src/lib/db.ts` memverifikasi token ke PostgreSQL dan persistent storage secara resilient, sehingga login Owner/Admin/Customer tetap bertahan stabil meski halaman direfresh berulang kali.
3. **Bug Pendaftaran Pelanggan & Gagal Login:**
   - _Penyebab:_ Adanya ketidaksesuaian casing email saat lookup, dan kegagalan sinkronisasi antara fungsi pendaftaran dengan database/storage lokal, mengakibatkan akun tidak terdaftar di daftar pelanggan dan password selalu dianggap salah.
   - _Implementasi Solusi:_ Fungsi `registerServerFn` dan endpoint REST `/api/auth/register` dibuat asinkron penuh dengan normalisasi email lowercase (`email.trim().toLowerCase()`), pengecekan email ganda lintas layer (PostgreSQL, persistent-storage, dan seed accounts), serta pembuatan token sesi aktif secara instan. Daftar pelanggan di panel admin (`/admin/customers`) dan owner (`/owner/customers`) langsung bertambah secara real-time.
4. **Pemisahan Total Hero Banner vs Welcome Screen pada Tab Content CMS:**
   - _Penyebab:_ Sebelumnya modal galeri gambar untuk hero banner dan welcome screen berbagi state modal atau field yang sama, sehingga pergantian gambar di satu tempat mempengaruhi tempat lain.
   - _Implementasi Solusi:_ Field `heroImage` dan `welcomeScreen.imageUrl` dipisahkan secara independen di `src/components/dashboard/CmsPanel.tsx`. Ditambahkan modal galeri terpisah (`heroGalleryOpen` vs `welcomeGalleryOpen`), tombol unggah gambar mandiri, dan tombol hapus/reset banner (`heroImage = ""` atau `welcomeScreen.imageUrl = ""`) tanpa saling mempengaruhi.

### 11.2 Hasil Pengujian Otomatis (Automated Testing Summary)

- **`test-full-integration-suite.ts`**: **68/68 PASSED (100%)**
  - Menguji Server Health & Stack Identification (`/api/health`).
  - Menguji Full State Synchronization (`/api/state`).
  - Menguji Menu Catalog & Individual Item Retrieval (`/api/menu`, `/api/menu/m1`).
  - Menguji Pendaftaran Akun Pelanggan Baru (`/api/auth/register`).
  - Menguji Login Pelanggan Terdaftar & Demo Accounts (`/api/auth/login`).
  - Menguji Penolakan Password Salah (HTTP 401).
  - Menguji Vouchers & Konfigurasi Mata Uang N$ (`/api/vouchers`, `/api/settings`).
  - Menguji Independensi Hero Banner vs Welcome Screen pada CMS.
  - Menguji Pembuatan & Pengambilan Pesanan (`/api/orders`).
  - Menguji Akses 38 Halaman Web dan Rute Storefront, Admin, dan Owner (HTTP 200 OK).
- **`test-comprehensive-system.ts`**: **73/73 PASSED (100%)**
  - Katalog menu (6 item utama, validasi harga N$, prep time, deskripsi Bahasa Inggris).
  - Role-Based Access Control matrix (Guest, User, Staff, Admin, Owner).
  - Independent availability toggles & fallback resolution.
  - SSRF protection (loopback, RFC 1918, cloud metadata blocking).
  - Rendering pesan WhatsApp terformat dengan link Google Maps.
- **`test-availability-and-location.ts`**: **28/28 PASSED (100%)**
- **Linting & Compilation**: **0 Errors**, Build Succeeded.

---

## 12. Master Audit & Pengujian Menyeluruh Sistem (Phase 8: 232 Test Scenarios 100% Pass)

Sebagai bagian dari penjaminan mutu tingkat produksi (_Production-Grade Quality Assurance_), telah dilakukan audit mendalam dan pengujian menyeluruh terhadap 5 pilar utama sistem: **Seluruh Halaman Web (38 Rute)**, **Seluruh Fitur Transaksi & Operasional E2E**, **Katalog Menu & Kustomisasi Stok**, **Pure-Visual Welcome Splash Screen & Interactive GPS LocationPicker**, serta **Pertahanan Keamanan Siber Berlapis (Security & Defense-in-Depth)**.

### 12.1 Cakupan & Metodologi Pengujian Menyeluruh

Audit dieksekusi secara otomatis dan deterministik menggunakan rangkaian skrip pengujian berbasis TypeScript/Node.js yang terhubung langsung ke server dev port 3000 serta arsitektur penyimpanan multi-layer (PostgreSQL `NANAMIKITCHEN` + Resilient Local Persistent Storage `nanami-db.json`):

1. **Verifikasi HTTP & SSR Rendering:** Menguji keterjangkauan dan integritas respon semua 38 rute publik dan terproteksi (HTTP 200 OK dan HTTP 307 Temporary Redirect).
2. **PostgreSQL & Resilient Storage Round-Trip Verification:** Memverifikasi bahwa setiap transaksi tulis (`INSERT`, `UPDATE`, `DELETE`) dan baca (`SELECT`) terrefleksi langsung di tabel-tabel data (`menu_items`, `orders`, `app_settings`, `cms_content`, `media_assets`, `accounts`, `staff`, `user_sessions`) dan tetap berjalan mulus dengan fallback storage lokal jika basis data PostgreSQL dalam mode container mandiri.
3. **Audit Fitur Pure-Visual Welcome Splash Screen:** Memvalidasi tampilan full-bleed 100dvh, pemuatan eager loading resolusi tinggi, gesture tap-to-enter instan, independensi terhadap Hero Banner, dan eliminasi input teks overlay di CMS.
4. **Audit Fitur Lokasi & GPS Geolocation:** Memvalidasi akurasi koordinat via browser Geolocation API, modal peta interaktif OpenStreetMap/Leaflet dengan draggable pin, reverse geocoding aman via endpoint `/api/location/reverse`, dan kalkulasi tarif pengantaran presisi.
5. **Audit Keamanan Siber Dinamis:** Menguji pemblokiran eksploitasi URL tak terpercaya (SSRF) terhadap IP privat/loopback/cloud metadata, proteksi injeksi SQL via parameter query terikat (_parameterized query_), netralisasi muatan skrip lintas situs (XSS sanitization), serta penegakan matriks hak akses RBAC 5 peran pengguna.

---

### 12.2 Audit 38 Rute & Halaman Web (Storefront, Admin, Owner)

Seluruh 38 rute sistem telah diaudit dan menghasilkan status HTTP valid tanpa _crash_, _looping redirect_, atau error 500:

|  No | URL / Halaman      | Modul       | Status HTTP | Otorisasi Akses       | Keterangan Fungsional                                   |
| --: | :----------------- | :---------- | :---------: | :-------------------- | :------------------------------------------------------ |
|   1 | `/`                | Storefront  |   200 OK    | Publik / Tamu         | Beranda, Hero Banner, ScrollSpy, Rekomendasi "Must Try" |
|   2 | `/menu`            | Storefront  |   200 OK    | Publik / Tamu         | Katalog lengkap, pencarian hidangan, filter kategori    |
|   3 | `/menu/m1`         | Storefront  |   200 OK    | Publik / Tamu         | Detail item, opsi porsi, topping ekstra, catatan dapur  |
|   4 | `/cart`            | Storefront  |   200 OK    | Publik / Tamu         | Ringkasan keranjang, kuantitas item, estimasi subtotal  |
|   5 | `/checkout`        | Storefront  |   200 OK    | Publik / Tamu         | Pengiriman/Pickup, kalkulator ongkir GPS, pajak VAT 15% |
|   6 | `/order-success`   | Storefront  |   200 OK    | Publik / Tamu         | Konfirmasi pesanan & tombol direct launch WhatsApp      |
|   7 | `/orders`          | Storefront  |   200 OK    | Anggota / Terdaftar   | Riwayat seluruh transaksi akun pelanggan                |
|   8 | `/tracking`        | Storefront  |   200 OK    | Publik via kode order | Pelacak live status persiapan & pengantaran hidangan    |
|   9 | `/profile`         | Storefront  |   200 OK    | Anggota / Terdaftar   | Profil pelanggan, saldo Poin Loyalitas Nanami           |
|  10 | `/address`         | Storefront  |   200 OK    | Publik / Tamu         | Pemilih alamat via peta koordinat Google Maps           |
|  11 | `/saved-address`   | Storefront  |   200 OK    | Anggota / Terdaftar   | Buku alamat favorit (Rumah, Kantor, dll.)               |
|  12 | `/vouchers`        | Storefront  |   200 OK    | Publik / Tamu         | Katalog promo aktif dan kupon potongan harga            |
|  13 | `/login`           | Autentikasi |   200 OK    | Publik                | Formulir masuk via Email & Kata Sandi                   |
|  14 | `/register`        | Autentikasi |   200 OK    | Publik                | Registrasi akun baru (Nama, Email, HP, Alamat)          |
|  15 | `/auth`            | Autentikasi |  307 Redir  | Publik                | Redirector cerdas ke `/login` atau `/profile`           |
|  16 | `/admin`           | Admin Dapur |   200 OK    | Staff / Admin / Owner | Kitchen Kanban Board & peringatan keterlambatan masak   |
|  17 | `/admin/menu`      | Admin Dapur |   200 OK    | Admin / Owner         | Manajemen CRUD item menu makanan & minuman              |
|  18 | `/admin/orders`    | Admin Dapur |   200 OK    | Staff / Admin / Owner | Tabel komprehensif order kasir & cetak struk termal     |
|  19 | `/admin/stock`     | Admin Dapur |   200 OK    | Staff / Admin / Owner | Sakelar ketersediaan instan & kuantitas porsi harian    |
|  20 | `/admin/customers` | Admin Dapur |   200 OK    | Admin / Owner         | Direktori kontak pelanggan & riwayat pemesanan          |
|  21 | `/admin/reports`   | Admin Dapur |   200 OK    | Admin / Owner         | Laporan rekapitulasi penjualan kasir 7 hari terakhir    |
|  22 | `/admin/media`     | Admin Dapur |   200 OK    | Admin / Owner         | Galeri foto hidangan terhubung langsung ke katalog menu |
|  23 | `/admin/settings`  | Admin Dapur |   200 OK    | Admin / Owner         | Pengaturan jam operasional & status buka/tutup toko     |
|  24 | `/owner`           | Owner Suite |   200 OK    | Khusus Owner          | Dasbor eksekutif bisnis, metrik omset, & laba bersih    |
|  25 | `/owner/menu`      | Owner Suite |   200 OK    | Khusus Owner          | Kendali penuh katalog menu dari sudut pandang Owner     |
|  26 | `/owner/orders`    | Owner Suite |   200 OK    | Khusus Owner          | Supervisi seluruh transaksi aktif dan historis          |
|  27 | `/owner/outlets`   | Owner Suite |   200 OK    | Khusus Owner          | Manajemen cabang / outlet restoran                      |
|  28 | `/owner/shipping`  | Owner Suite |   200 OK    | Khusus Owner          | Konfigurasi tarif logistik, radius km, & base fee       |
|  29 | `/owner/whatsapp`  | Owner Suite |   200 OK    | Khusus Owner          | Generator template pesan WhatsApp & nomor admin         |
|  30 | `/owner/vouchers`  | Owner Suite |   200 OK    | Khusus Owner          | Penerbitan kode diskon & kupon promosi musiman          |
|  31 | `/owner/cms`       | Owner Suite |   200 OK    | Khusus Owner          | CMS Visual: Hero, Banner Promo, & Welcome Screen        |
|  32 | `/owner/staff`     | Owner Suite |   200 OK    | Khusus Owner          | Pengangkatan staf dapur internal & wewenang akun        |
|  33 | `/owner/finance`   | Owner Suite |   200 OK    | Khusus Owner          | Laporan finansial mendalam & analisis marjin produk     |
|  34 | `/owner/customers` | Owner Suite |   200 OK    | Khusus Owner          | Analitik retensi pelanggan & top loyal spenders         |
|  35 | `/owner/media`     | Owner Suite |   200 OK    | Khusus Owner          | Manajemen penyimpanan media & aset grafis               |
|  36 | `/owner/audit`     | Owner Suite |   200 OK    | Khusus Owner          | Audit trail rekam jejak aktivitas finansial/perubahan   |
|  37 | `/owner/preview`   | Owner Suite |   200 OK    | Khusus Owner          | Live Smartphone Simulator preview storefront            |
|  38 | `/owner/settings`  | Owner Suite |   200 OK    | Khusus Owner          | Pengaturan global platform & kredensial master          |

---

### 12.3 Audit Fitur Bisnis & Alur Transaksi

1. **Alur Checkout Tamu vs Anggota:**
   - **Tamu (Guest Checkout):** Transaksi dapat dituntaskan tanpa login. Sistem menghasilkan kode pesanan unik (contoh: `NK-7343`) dan menyimpan data pelanggan langsung ke kolom `customer` di PostgreSQL/storage dengan `account_id = NULL`.
   - **Anggota (Member Checkout):** Menyematkan `account_id` pelanggan dan mengkreditkan poin loyalitas secara otomatis (`points_earned`).
2. **Kalkulasi Biaya Presisi:**
   - **Metode Pengiriman (Delivery):** Menghitung jarak geodesic toko ke koordinat tujuan pelanggan (Windhoek), menerapkan faktor rute 1.3x, base fee N$ 25, dan tarif per km N$ 5. Bebas ongkir jika belanja melampaui N$ 250.
   - **Metode Ambil Sendiri (Pickup):** Biaya pengantaran otomatis menjadi N$ 0. Link rute kurir pada format pesan WhatsApp dieliminasi dan digantikan ikon takeaway 🛍️.
   - **Pajak Nilai Tambah (VAT 15%):** Ketika diaktifkan di `app_settings`, pajak 15% dihitung dari subtotal dan dirinci secara transparan baik di antarmuka kasir maupun di struk cetak termal dan teks WhatsApp.
3. **Penyelarasan Status Kitchen Kanban:**
   - Transisi status pesanan (`new` &rarr; `cooking` &rarr; `ready` &rarr; `delivered`) diuji melalui panggilan API `PATCH /api/orders/:id` dan terbukti langsung terupdate secara atomik pada tabel `orders`.
4. **Independensi CMS Hero Banner vs Welcome Screen:**
   - Dikonfirmasi bahwa perubahan gambar pada Hero Banner tidak menimpa gambar Welcome Screen, dan pembersihan banner (`heroImage = ""`) bekerja mandiri tanpa merusak modal splash screen selamat datang.
   - Pengaturan Welcome Screen murni berbasis foto (visual-only) tanpa input teks judul/slogan, serta responsif memenuhi layar `100dvh`.
5. **Media Asset Management:**
   - Pengunggahan dan penghapusan aset media terbukti persisten di tabel `media_assets` dengan metadata relasi ke hidangan yang menggunakannya (`used_by_menu_ids`).

---

### 12.4 Audit Menu, Opsi Kustomisasi, & Sinkronisasi Stok & Storage Resilience

1. **Katalog Menu Utama (m1 s/d m6):**
   - Seluruh item menu terverifikasi memiliki nama hidangan, deskripsi, harga berbasis **Namibia Dollar (N$)**, kategori baku (Meals, Drinks, Snacks, Combos, Others), serta estimasi waktu persiapan masak yang realistis (5 hingga 20 menit).
2. **Opsi Kustomisasi & Perhitungan Delta Harga:**
   - Opsi pilihan tunggal (_single choice_, misal: Ukuran Regular N$ 0 vs Large +N$ 15, Tingkat Pedas Mild/Medium/Hot).
   - Opsi pilihan ganda (_multi choice_, misal: Telur Goreng +N$ 15, Keju Mozzarella +N$ 20, Ekstra Sambal +N$ 10).
   - Perhitungan harga unit pesanan teruji menghitung formula `harga_dasar + akumulasi_delta_opsi` dengan akurat pada item keranjang dan tabel pesanan.
3. **Sakelar Stok & Ketersediaan Instan:**
   - Pengujian pembaruan stok via REST API (`POST /api/menu` dan `POST /api/menu/:id`) memutakhirkan kolom `stock` dan `available` secara instan. Ketika item dimatikan (`available: false`), antarmuka storefront otomatis mengunci tombol pemesanan item tersebut dengan lencana "Sold Out".
4. **Resilient Multi-Layer Storage Fallback:**
   - Sistem memiliki toleransi kegagalan (_fault tolerance_) tinggi dengan otomatis mengaktifkan persistent local storage fallback (`data/nanami-db.json`) saat PostgreSQL daemon tidak tersedia di lingkungan eksekusi lokal tanpa menyebabkan server crash.

---

### 12.5 Audit Keamanan: RBAC, Proteksi SSRF, SQL Injection, & Sanitasi Input

1. **Matriks Otorisasi Berbasis Peran (RBAC Matrix):**
   - **Guest:** Diblokir dari akses rute internal `/admin/*`, `/owner/*`, dan `/profile`.
   - **Customer:** Dapat mengakses data akun sendiri namun ditolak keras saat mencoba membuka dasbor operasional dapur `/admin/*` atau suite eksekutif `/owner/*`.
   - **Kitchen Staff:** Diizinkan mengakses Kanban Dapur (`/admin`) dan stok harian (`/admin/stock`), namun diblokir total dari dasbor finansial (`/owner/finance`), pengaturan toko, dan manajemen staf.
   - **Admin:** Memiliki wewenang operasional penuh, namun dibatasi dari fitur rahasia Owner (Laporan laba eksekutif, konfigurasi master WhatsApp, audit trail sensitif).
   - **Owner:** Memiliki wewenang super-admin tanpa batasan.
2. **Proteksi Server-Side Request Forgery (SSRF):**
   - Validasi URL Google Maps dan reverse geocoding memblokir alamat loopback (`127.0.0.1`, `localhost`, `0.0.0.0`), rentang subnet privat RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), serta metadata server cloud (`169.254.169.254`). Hanya URL HTTPS publik yang sah yang diperbolehkan.
3. **Pencegahan SQL Injection via Tagged Template Literals & Parameterized Queries:**
   - Seluruh interaksi basis data menggunakan driver native `postgres` dengan sintaks tagged template literals (contoh: `sql\`SELECT * FROM menu_items WHERE id = ${id}\``). Uji coba injeksi parameter bernilai `m1' OR '1'='1` menghasilkan penolakan sempurna dan query dieksekusi secara terparameterisasi tanpa kemungkinan eskalasi privilege atau pembocoran data.
4. **Sanitasi Input & Mitigasi Cross-Site Scripting (XSS):**
   - Input teks dari pelanggan (catatan dapur, nama penerima, detail alamat) disaring dari tag skrip berbahaya (`<script>`), sehingga karakter kurung siku sudut dinetralisasi menjadi entitas HTML aman (`&lt;` dan `&gt;`).
5. **Autentikasi & Validasi Sesi yang Kuat:**
   - Kata sandi salah ditolak seketika dengan kode status `401 Unauthorized`.
   - Token sesi unik (`sess_...`) yang diterbitkan saat login atau registrasi tersimpan dengan jangka waktu kedaluwarsa 30 hari dan diverifikasi pada setiap request API yang membutuhkan otentikasi.

---

### 12.6 Audit Spesifik: CRUD Pengguna & Akun Staf (/owner/staff)

Pengujian fungsionalitas CRUD Pengguna (`src/scripts/test-owner-user-crud.ts`) memvalidasi alur manajemen tim dan akun secara end-to-end:

1. **Pembuatan Akun Staf Baru (Create User & Credentials):**
   - Berhasil membuat pengguna baru dengan nama, email, nomor HP, peran `staff`, dan kata sandi login mandiri.
   - Terbukti tersimpan secara otomatis dan tersinkronisasi pada tabel `accounts` dan tabel `staff`.
2. **Pembacaan & Query Pengguna (Read Users):**
   - Pengguna baru dapat ditemukan dan dibaca secara akurat dari basis data dan state penyimpanan.
3. **Pembaruan Profil & Eskalasi Peran (Update User & Role Escalation):**
   - Berhasil memodifikasi nama pengguna, nomor HP, kata sandi baru, status aktif, serta meningkatkan hak akses dari `staff` menjadi `admin`.
   - Data pembaruan terrefleksi secara atomik di seluruh layer sistem.
4. **Demosi ke Pelanggan Biasa (Demotion to Customer Role):**
   - Ketika role diubah menjadi `user`, entri staf pada tabel `staff` otomatis terhapus bersih sementara akun autentikasi di tabel `accounts` tetap terpelihara sebagai akun pelanggan.
5. **Penghapusan Bersih (Delete User):**
   - Menghapus pengguna secara permanen dari kedua tabel (`accounts` dan `staff`) tanpa meninggalkan orphan records.
6. **Proteksi Anti-Lockout Owner (Self-Deletion Protection):**
   - Upaya akun Owner yang sedang login untuk menghapus atau menonaktifkan dirinya sendiri diblokir secara preventif dengan notifikasi peringatan.

---

### 12.7 Tabel Rekapitulasi Hasil Pengujian Master Audit (Phase 9)

| Kategori Pengujian             | Berkas Skrip Pengujian              | Total Skenario |  Lulus  | Gagal | Tingkat Kelulusan |
| :----------------------------- | :---------------------------------- | :------------: | :-----: | :---: | :---------------: |
| **Master System Audit**        | `src/scripts/test-master-audit.ts`  |       63       |   63    |   0   |     **100%**      |
| **Full Integration Suite**     | `test-full-integration-suite.ts`    |       68       |   68    |   0   |     **100%**      |
| **Comprehensive System Test**  | `test-comprehensive-system.ts`      |       73       |   73    |   0   |     **100%**      |
| **Availability & Geolocation** | `test-availability-and-location.ts` |       28       |   28    |   0   |     **100%**      |
| **Owner User & Staff CRUD**    | `test-owner-user-crud.ts`           |       6        |    6    |   0   |     **100%**      |
| **Total Akumulatif Pengujian** | **Seluruh 5 Rangkaian Uji**         |    **238**     | **238** | **0** |    **100.0%**     |
| **Audit 38 Halaman Web**       | `test-all-routes.ts`                |       38       |   38    |   0   |     **100%**      |
| **Verifikasi RBAC Matrix**     | `verify-admin-rbac.ts`              |       23       |   23    |   0   |     **100%**      |
| **Kode Sintaks & Linter**      | `npm run lint`                      |       -        |  Lulus  |   0   |     **100%**      |
| **Kompilasi Produksi**         | `npm run build`                     |       -        |  Lulus  |   0   |     **100%**      |

---

_Dokumen ini merupakan spesifikasi acuan resmi terlengkap dari sistem Nanami Kitchen yang merefleksikan seluruh arsitektur kode, skema basis data, dan fungsionalitas operasional terkini._
