# 🛒 Aplikasi Kasir (POS) Next.js + Supabase

Aplikasi Point of Sale (Kasir) modern yang dibangun menggunakan **Next.js (App Router)** dan **Supabase**. Aplikasi ini dirancang untuk membantu UMKM mengelola stok barang, transaksi penjualan, pencatatan hutang (piutang), serta laporan keuangan secara efisien dan *real-time*.

![POS Screenshot](https://i.ibb.co.com/HpTN7rDt/Screenshot-from-2025-12-24-09-33-31.png)

## ✨ Fitur Utama

* **🔐 Autentikasi Aman:** Login sistem terproteksi menggunakan Supabase Auth & Middleware.
* **📦 Manajemen Produk:** Tambah, edit, hapus produk dengan pelacakan stok otomatis.
* **🖥️ POS (Kasir) Interaktif:**
    * Pencarian produk instan & Scan Barcode.
    * Keranjang belanja dinamis.
    * Kalkulator kembalian & Quick Cash buttons.
* **💳 Metode Pembayaran Fleksibel:** Mendukung pembayaran Tunai (Cash) dan Piutang (Bon).
* **📒 Manajemen Piutang:**
    * Pencatatan customer yang berhutang.
    * Fitur pembayaran cicilan atau pelunasan.
    * Status lunas/belum lunas otomatis.
* **📊 Laporan Keuangan:**
    * Rekap omset & estimasi keuntungan (Gross Profit).
    * Filter berdasarkan tanggal.
    * **Export to Excel (.xlsx)**.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Icons:** Lucide React
* **Utilities:** `xlsx` (Excel Export), `sonner` (Toast Notifications), `zod` (Validation).

---

## 🚀 Panduan Instalasi & Setup

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda.

### 1. Prasyarat
Pastikan Anda sudah menginstall:
* [Node.js](https://nodejs.org/) (Versi 18 atau terbaru)
* Akun [Supabase](https://supabase.com/)

### 2. Clone Repository
```bash
git clone [https://github.com/username-anda/nama-repo-pos.git](https://github.com/username-anda/nama-repo-pos.git)
cd nama-repo-pos
```

### 3. Install Dependencies
```bash
npm install
```
### 4. Setup Environment Variables
Buat file `.env.local` di root folder proyek, lalu isi dengan kredensial Supabase Anda:
```bash
NEXT_PUBLIC_SUPABASE_URL=[https://project-id-anda.supabase.co](https://project-id-anda.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
### 5. Setup Database (Supabase)
Jalankan script schema-ini.SQL pada SQL Editor untuk membuat tabel dan relasi..

### 6. Setup Akun Pengguna
Karena aplikasi menggunakan RLS (Row Level Security), Anda harus membuat user untuk login.

1. Buka Supabase Dashboard > Authentication > Providers. Pastikan Email aktif.
2. Buka menu Users > Add User.
3. Buat email (contoh: admin@toko.com) dan password.

### 7. Jalankan Aplikasi
```bash
npm run dev
```

## 🤝 Kontribusi

Aplikasi ini dikembangkan untuk tujuan pembelajaran dan implementasi bisnis skala kecil. Silakan fork dan kembangkan sesuai kebutuhan Anda.

