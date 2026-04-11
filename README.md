# ERPPOS - Modern Point of Sale & Inventory System

ERPPOS adalah solusi Point of Sale (POS) dan manajemen inventori modern yang dibangun dengan teknologi web terkini. Aplikasi ini dirancang untuk memberikan pengalaman pengelolaan bisnis yang mulus, mulai dari kasir, pemantauan stok, hingga kolaborasi dengan supplier.

![Dashboard Preview](https://raw.githubusercontent.com/adenpribadi/pos-nextjs/main/public/preview.png)

## 🚀 Fitur Unggulan

### 1. **Smart POS Interface**
Antarmuka kasir yang cepat, responsif, dan mudah digunakan. Mendukung pencarian produk instan, manajemen keranjang belanja, dan pencetakan struk digital.

### 2. **Supply Shipment Workflow**
Alur kerja pengadaan barang yang profesional antara Supplier dan Admin.
- Supplier mengajukan pengiriman pasokan (*Supply Shipment*).
- Admin melakukan validasi fisik dan menyetujui kiriman.
- Stok produk bertambah secara otomatis dan tercatat dalam log audit inventori.

### 3. **Premium Storefront**
Katalog produk publik yang dirancang dengan estetika *Glassmorphism*. 
- Navigasi kategori yang responsif (Sidebar/Mobile Drawer).
- Fitur pencarian dan filter kategori secara real-time.
- Pengalaman belanja yang premium bagi pelanggan.

### 4. **Inventory & Stock Audit**
Manajemen stok yang komprehensif dengan pencatatan setiap mutasi barang melalui *Inventory Transactions*. Admin dapat memantau riwayat stok masuk dan keluar secara mendetail.

### 5. **Analitycs Dashboard**
Visualisasi performa bisnis melalui grafik tren pendapatan harian dan indikator KPI (Key Performance Indicators) seperti total pendapatan, total produk, dan jumlah pelanggan.

### 6. **Role-Based Access Control (RBAC)**
Manajemen hak akses yang ketat berdasarkan peran pengguna:
- **Admin/Manager**: Akses penuh ke seluruh sistem dan pengaturan.
- **Cashier**: Akses ke menu POS dan manajemen pelanggan.
- **Supplier**: Akses khusus untuk mengajukan Supply Shipment.
- **Customer**: Akses ke portal katalog produk.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Base UI (@base-ui/react)](https://base-ui.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/adenpribadi/pos-nextjs.git
   cd pos-nextjs
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Buat file `.env` di root direktori dan sesuaikan:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/pos_db"
   NEXTAUTH_SECRET="your_secret_key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Sinkronisasi Database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Jalankan Aplikasi**:
   ```bash
   npm run dev
   ```

## 🤝 Kontribusi

Kontribusi selalu terbuka! Silakan lakukan *fork* pada repositori ini dan kirimkan *pull request* untuk fitur-fitur baru atau perbaikan bug.

---

Dikembangkan dengan ❤️ oleh **Aden Pribadi**
