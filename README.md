# 🌸 MoneyFlow

Planner keuangan pribadi yang menggantikan spreadsheet Excel-mu. Cukup ketik "Beli makan 25rb pakai DANA", sisanya dihitung otomatis.

## Fitur yang sudah jadi

- **Auth**: Register, Login, Logout, multi-user, data terpisah per akun
- **Quick Capture**: catat transaksi dalam hitungan detik dari Dashboard
- **Favorite Transactions**: template transaksi sering dipakai, sekali tap langsung tercatat
- **Dashboard**: saldo total, saldo bebas, ringkasan hari ini, reminder rutin, target berjalan, transaksi terbaru
- **Dompet**: multi-dompet custom, transfer antar dompet, penyesuaian saldo (Adjust Balance)
- **Kategori**: custom kategori pemasukan & pengeluaran
- **Tabungan Tetap**: terpisah dari saldo bebas, rincian manual (mis. per bank/amplop), Pinjaman Tabungan saat uang diambil, pengembalian manual (tidak otomatis potong dari pendapatan baru)
- **Target Menabung**: progress manual, tanpa auto-transfer
- **Pengeluaran Rutin**: reminder saja, tidak otomatis membuat transaksi
- **Wishlist**: progress & status
- **Riwayat Transaksi**: search judul, filter dompet/kategori/jenis, dikelompokkan per tanggal
- **Catatan Harian**: catatan tanpa transaksi, muncul di timeline
- **Statistik**: filter harian/mingguan/bulanan/tahunan, total, selisih, kategori & transaksi terbesar, rata-rata, grafik tren, perbandingan periode sebelumnya
- **Export**: CSV, Excel (XLSX), PDF
- **7 Tema** (Sakura Pink, Baby Blue, Lavender, Peach, Matcha, Beige, Midnight) + Light/Dark mode
- **Mobile-first & responsive**: bottom nav di mobile, sidebar di desktop

## Teknologi

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Drizzle ORM** + **MySQL** (bukan Prisma — lihat catatan di bawah)
- **NextAuth v5** (Credentials provider, JWT session)
- **Tailwind CSS v4**
- **Recharts** untuk grafik statistik

> **Kenapa Drizzle, bukan Prisma?** Spesifikasi awal menyebut Prisma ORM sebagai contoh. Drizzle dipilih sebagai gantinya karena arsitekturnya lebih ringan (tanpa binary engine terpisah yang perlu diunduh), murni TypeScript, dan tetap type-safe end-to-end — sejalan dengan prinsip "teknologi modern yang ringan" di brief. Kalau kamu tetap ingin Prisma, skema di `src/db/schema.ts` bisa dikonversi manual.

## Menjalankan secara lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Siapkan database MySQL online

Gunakan salah satu layanan MySQL gratis/berbayar, misalnya:
- PlanetScale (planetscale.com)
- Railway (railway.app)
- Aiven (aiven.io)
- TiDB Cloud (tidbcloud.com, kompatibel MySQL)

Salin `.env.example` menjadi `.env.local`, lalu isi:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="mysql://user:password@host:3306/moneyflow"
AUTH_SECRET="hasil-dari-openssl-rand-base64-32"
```

### 3. Push skema ke database

```bash
npm run db:push
```

Ini akan membuat 18 tabel (users, wallets, transactions, savings_accounts, dst) langsung dari `src/db/schema.ts`.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000 — kamu akan diarahkan ke halaman Register.

## Deploy ke Vercel

1. Push project ini ke GitHub
2. Import repo di vercel.com/new
3. Tambahkan environment variables `DATABASE_URL` dan `AUTH_SECRET` di Vercel Project Settings
4. Deploy — Vercel otomatis menjalankan `next build`

Setelah deploy, jalankan `npm run db:push` sekali dari lokal (dengan `DATABASE_URL` production) untuk membuat tabel di database production.

## Struktur project

```
src/
  app/
    (app)/            -> halaman setelah login (dashboard, transactions, wallets, dst)
    login/ register/  -> halaman auth (publik)
    api/              -> export & NextAuth route handler
  components/         -> komponen UI yang dipakai lintas halaman
  db/
    schema.ts         -> skema Drizzle (18 tabel)
    index.ts          -> koneksi MySQL
  lib/
    actions.ts               -> semua Server Actions (create/update transaksi, dompet, tabungan, dll)
    balance.ts                -> logika perhitungan saldo bebas, tabungan, pinjaman
    auth.ts / auth.config.ts  -> NextAuth
```

## Yang belum lengkap / bisa dikembangkan lagi

- Draft transaksi (kolom `isDraft` sudah ada di skema, tampilan UI draft belum dibuat)
- Lampiran foto pada transaksi (kolom `photoUrl` sudah ada, upload UI belum)
- Tag transaksi (kolom `tagsCsv` sudah ada, input/filter tag di UI belum lengkap)
- Undo transaksi sepenuhnya otomatis (saat ini beri tahu pengguna untuk hapus manual dari daftar)
- Bottom sheet khusus mobile untuk beberapa form (saat ini form inline, sudah responsive tapi belum bottom-sheet)

Semua item di atas fondasinya sudah ada di database, jadi tinggal ditambahkan UI-nya.
