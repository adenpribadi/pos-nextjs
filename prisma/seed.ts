import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Memulai proses seeding...')
  console.log('Menghapus data lama (Database Reset)...')

  // Hapus data dari bawah (child) ke atas (parent) untuk menghindari error Foreign Key
  await prisma.review.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.supplyShipment.deleteMany()
  await prisma.inventoryTransaction.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.promo.deleteMany()
  await prisma.user.deleteMany()
  await prisma.storeSettings.deleteMany()

  console.log('✔ Data lama berhasil dihapus.')

  console.log('Membuat Store Settings default...')
  await prisma.storeSettings.create({
    data: {
      id: 'singleton',
      storeName: 'Warung Bintang',
      address: 'PMI2 - Jl. Selayar Raya Blok N10',
      phone: '082216941828',
      taxEnabled: false,
      taxRate: 0,
      currency: 'IDR',
      bankName: 'BCA',
      bankAccountNumber: '6942048109',
      bankAccountName: 'ADEN PRIBADI'
    }
  })

  console.log('Membuat user Administrator...')
  const adminPassword = await bcrypt.hash('085779529346', 10)

  await prisma.user.create({
    data: {
      name: 'Aden Pribadi',
      email: 'aden.pribadi@gmail.com',
      phone: '082216941828',
      password: adminPassword,
      role: 'ADMIN',
    }
  })

  console.log('Membuat user Kasir...')
  const cashierPassword = await bcrypt.hash('KingDirotSMI', 10)

  await prisma.user.create({
    data: {
      name: 'Eri',
      email: 'vzveda@gmail.com',
      phone: '083107943504',
      password: cashierPassword,
      role: 'CASHIER',
    }
  })

  console.log('==================================')
  console.log('Membuat Kategori dan Produk default...')

  const categories = [
    { name: 'Minyak Sachet', color: '#ef4444' },
    { name: 'Minyak Kemasan', color: '#f97316' },
    { name: 'Mie Instan', color: '#f59e0b' },
    { name: 'Bumbu & Penyedap', color: '#eab308' },
    { name: 'Bahan Pokok', color: '#84cc16' },
    { name: 'Kopi & Teh (Sachet)', color: '#22c55e' },
    { name: 'Susu (Sachet & Bubuk)', color: '#10b981' },
    { name: 'Minuman Kemasan', color: '#14b8a6' },
    { name: 'Minuman Seduh / Cup', color: '#06b6d4' },
    { name: 'Jajanan', color: '#0ea5e9' },
    { name: 'Rokok', color: '#3b82f6' },
    { name: 'Obat & Kesehatan', color: '#6366f1' },
    { name: 'Sabun & Pembersih', color: '#8b5cf6' },
    { name: 'Perawatan Tubuh', color: '#a855f7' },
    { name: 'Popok', color: '#d946ef' },
    { name: 'Mainan', color: '#ec4899' }
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: cat.name,
        color: cat.color,
      },
    });
    categoryMap[cat.name] = createdCategory.id;
  }

  const products = [
    // Minyak Sachet
    { name: 'Minyak Kita Sachet', price: 15000, costPrice: 13500, stock: 20, category: 'Minyak Sachet' },
    { name: 'Minyak Resto Sachet', price: 14500, costPrice: 13000, stock: 20, category: 'Minyak Sachet' },

    // Minyak Kemasan
    { name: 'Minyak Bimoli 1L', price: 22000, costPrice: 19500, stock: 12, category: 'Minyak Kemasan' },
    { name: 'Minyak Filma 2L', price: 42000, costPrice: 38000, stock: 8, category: 'Minyak Kemasan' },

    // Mie Instan
    { name: 'Indomie Kuah', price: 3500, costPrice: 2900, stock: 40, category: 'Mie Instan' },
    { name: 'Mie Sedaap Kuah', price: 3400, costPrice: 2800, stock: 40, category: 'Mie Instan' },
    { name: 'Supermie Kuah', price: 3300, costPrice: 2750, stock: 30, category: 'Mie Instan' },
    { name: 'Sarimi Kuah', price: 3000, costPrice: 2500, stock: 30, category: 'Mie Instan' },
    { name: 'Indomie Goreng', price: 3800, costPrice: 3100, stock: 50, category: 'Mie Instan' },
    { name: 'Mie Sakura', price: 2500, costPrice: 2000, stock: 30, category: 'Mie Instan' },

    // Sabun & Pembersih
    { name: 'Kilau Nipis', price: 2000, costPrice: 1500, stock: 25, category: 'Sabun & Pembersih' },
    { name: 'Mama Lemon', price: 2000, costPrice: 1500, stock: 25, category: 'Sabun & Pembersih' },
    { name: 'Sunlight', price: 2500, costPrice: 1900, stock: 30, category: 'Sabun & Pembersih' },
    { name: 'Ekonomi Colek', price: 2000, costPrice: 1500, stock: 20, category: 'Sabun & Pembersih' },
    { name: 'Soklin Lantai', price: 1500, costPrice: 1100, stock: 40, category: 'Sabun & Pembersih' },
    { name: 'Wipol', price: 2000, costPrice: 1500, stock: 30, category: 'Sabun & Pembersih' },

    // Perawatan Tubuh
    { name: 'Lifebuoy Batang', price: 4000, costPrice: 3200, stock: 30, category: 'Perawatan Tubuh' },
    { name: 'Nuvo Batang', price: 3500, costPrice: 2800, stock: 30, category: 'Perawatan Tubuh' },
    { name: 'Lux Cair', price: 6000, costPrice: 4800, stock: 20, category: 'Perawatan Tubuh' },
    { name: 'Giv Cair', price: 5500, costPrice: 4400, stock: 20, category: 'Perawatan Tubuh' },
    { name: 'Pantene Rambut Rontok', price: 1500, costPrice: 1100, stock: 50, category: 'Perawatan Tubuh' },
    { name: 'Clear Ketombe', price: 1500, costPrice: 1100, stock: 50, category: 'Perawatan Tubuh' },
    { name: 'Sunsilk Kuning', price: 1000, costPrice: 800, stock: 50, category: 'Perawatan Tubuh' },
    { name: 'Sunsilk Hitam', price: 1000, costPrice: 800, stock: 50, category: 'Perawatan Tubuh' },
    { name: 'Lifebuoy Merah', price: 1000, costPrice: 800, stock: 50, category: 'Perawatan Tubuh' },
    { name: 'Zinc', price: 1000, costPrice: 800, stock: 50, category: 'Perawatan Tubuh' },

    // Bumbu & Penyedap
    { name: 'Royco Sapi', price: 500, costPrice: 400, stock: 100, category: 'Bumbu & Penyedap' },
    { name: 'Royco Ayam', price: 500, costPrice: 400, stock: 100, category: 'Bumbu & Penyedap' },
    { name: 'Masako Sapi', price: 500, costPrice: 400, stock: 100, category: 'Bumbu & Penyedap' },
    { name: 'Masako Ayam', price: 500, costPrice: 400, stock: 100, category: 'Bumbu & Penyedap' },
    { name: 'Sasa', price: 1000, costPrice: 800, stock: 50, category: 'Bumbu & Penyedap' },
    { name: 'Ajinomoto', price: 1000, costPrice: 800, stock: 50, category: 'Bumbu & Penyedap' },
    { name: 'Kaldu Jamur', price: 2000, costPrice: 1600, stock: 40, category: 'Bumbu & Penyedap' },
    { name: 'Bumbu Racik Sayur Sop', price: 2000, costPrice: 1600, stock: 30, category: 'Bumbu & Penyedap' },
    { name: 'Bumbu Racik Sayur Asem', price: 2000, costPrice: 1600, stock: 30, category: 'Bumbu & Penyedap' },
    { name: 'Bumbu Racik Nasi Goreng', price: 2000, costPrice: 1600, stock: 30, category: 'Bumbu & Penyedap' },
    { name: 'Bumbu Racik Ayam Goreng', price: 2000, costPrice: 1600, stock: 30, category: 'Bumbu & Penyedap' },
    { name: 'Kecap Bango Sachet', price: 2000, costPrice: 1600, stock: 40, category: 'Bumbu & Penyedap' },
    { name: 'Kecap ABC Sachet', price: 2000, costPrice: 1600, stock: 40, category: 'Bumbu & Penyedap' },
    { name: 'Kecap Sedaap Sachet', price: 2000, costPrice: 1600, stock: 40, category: 'Bumbu & Penyedap' },
    { name: 'Saos ABC Sachet', price: 2000, costPrice: 1600, stock: 40, category: 'Bumbu & Penyedap' },

    // Kopi & Teh (Sachet)
    { name: 'Kopi Kapal Api Sachet', price: 2000, costPrice: 1600, stock: 60, category: 'Kopi & Teh (Sachet)' },
    { name: 'Kopi Luwak White Koffie Sachet', price: 2500, costPrice: 2000, stock: 40, category: 'Kopi & Teh (Sachet)' },
    { name: 'Kopi Torabika Duo Sachet', price: 2000, costPrice: 1600, stock: 40, category: 'Kopi & Teh (Sachet)' },
    { name: 'Kopi Good Day Sachet', price: 2500, costPrice: 2000, stock: 40, category: 'Kopi & Teh (Sachet)' },
    { name: 'Teh Sosro Celup', price: 6000, costPrice: 5000, stock: 24, category: 'Kopi & Teh (Sachet)' },

    // Susu (Sachet & Bubuk)
    { name: 'Susu Bendera Sachet', price: 1500, costPrice: 1200, stock: 40, category: 'Susu (Sachet & Bubuk)' },
    { name: 'Susu Indomilk Sachet', price: 1500, costPrice: 1200, stock: 40, category: 'Susu (Sachet & Bubuk)' },
    { name: 'Susu Dancow Bubuk', price: 3500, costPrice: 3000, stock: 30, category: 'Susu (Sachet & Bubuk)' },

    // Obat & Kesehatan
    { name: 'Bodrex Sakit Kepala', price: 1000, costPrice: 800, stock: 50, category: 'Obat & Kesehatan' },
    { name: 'Bodrex Flu', price: 1000, costPrice: 800, stock: 50, category: 'Obat & Kesehatan' },
    { name: 'Panadol Biru', price: 2000, costPrice: 1600, stock: 30, category: 'Obat & Kesehatan' },
    { name: 'Panadol Merah', price: 2500, costPrice: 2000, stock: 30, category: 'Obat & Kesehatan' },
    { name: 'Mixagrip Flu & Batuk', price: 2500, costPrice: 2000, stock: 30, category: 'Obat & Kesehatan' },
    { name: 'Minyak Kayu Putih', price: 15000, costPrice: 13000, stock: 15, category: 'Obat & Kesehatan' },
    { name: 'Promag', price: 8500, costPrice: 7200, stock: 20, category: 'Obat & Kesehatan' },
    { name: 'Tolak Angin Anak', price: 3000, costPrice: 2500, stock: 40, category: 'Obat & Kesehatan' },
    { name: 'Tolak Angin Dewasa', price: 4000, costPrice: 3300, stock: 40, category: 'Obat & Kesehatan' },
    { name: 'Adem Sari', price: 2500, costPrice: 2000, stock: 30, category: 'Obat & Kesehatan' },
    { name: 'Hansaplast', price: 1500, costPrice: 1000, stock: 50, category: 'Obat & Kesehatan' },
    { name: 'Betadine', price: 8000, costPrice: 6500, stock: 10, category: 'Obat & Kesehatan' },
    { name: 'Kapas Kecantikan', price: 7000, costPrice: 5500, stock: 10, category: 'Obat & Kesehatan' },
    { name: 'Tisu', price: 6000, costPrice: 4800, stock: 15, category: 'Obat & Kesehatan' },
    { name: 'Koyo', price: 7500, costPrice: 6000, stock: 30, category: 'Obat & Kesehatan' },

    // Rokok
    { name: 'Gudang Garam', price: 26000, costPrice: 24500, stock: 20, category: 'Rokok' },
    { name: 'Sampoerna Mild', price: 32000, costPrice: 30000, stock: 20, category: 'Rokok' },
    { name: 'Djarum Super', price: 25000, costPrice: 23500, stock: 20, category: 'Rokok' },
    { name: 'Magnum Filter', price: 24000, costPrice: 22200, stock: 20, category: 'Rokok' },
    { name: 'Gajah Baru', price: 18000, costPrice: 16500, stock: 20, category: 'Rokok' },
    { name: 'Juara', price: 15000, costPrice: 13500, stock: 20, category: 'Rokok' },

    // Minuman Kemasan
    { name: 'Aqua 600ml', price: 3500, costPrice: 2500, stock: 48, category: 'Minuman Kemasan' },
    { name: 'Floridina', price: 3000, costPrice: 2400, stock: 24, category: 'Minuman Kemasan' },
    { name: 'Yakult', price: 2500, costPrice: 2000, stock: 50, category: 'Minuman Kemasan' },
    { name: 'Susu Kotak', price: 6000, costPrice: 5000, stock: 24, category: 'Minuman Kemasan' },
    { name: 'Ale-Ale', price: 1500, costPrice: 1100, stock: 36, category: 'Minuman Kemasan' },

    // Bahan Pokok
    { name: 'Terigu Curah 1kg', price: 12000, costPrice: 10500, stock: 15, category: 'Bahan Pokok' },
    { name: 'Gula Renceng', price: 1500, costPrice: 1200, stock: 50, category: 'Bahan Pokok' },
    { name: 'Gula Pasir Curah 1kg', price: 17000, costPrice: 15500, stock: 10, category: 'Bahan Pokok' },
    { name: 'Gula Merah Curah 1kg', price: 22000, costPrice: 19500, stock: 10, category: 'Bahan Pokok' },
    { name: 'Kacang Hijau 250g', price: 8000, costPrice: 7000, stock: 15, category: 'Bahan Pokok' },
    { name: 'Kacang Merah 250g', price: 9000, costPrice: 8000, stock: 15, category: 'Bahan Pokok' },
    { name: 'Kemiri 100g', price: 6000, costPrice: 5000, stock: 15, category: 'Bahan Pokok' },

    // Minuman Seduh / Cup
    { name: 'Pop Ice Cookies', price: 2500, costPrice: 1800, stock: 30, category: 'Minuman Seduh / Cup' },
    { name: 'Pop Ice Taro', price: 2500, costPrice: 1800, stock: 30, category: 'Minuman Seduh / Cup' },
    { name: 'Pop Ice Vanilla', price: 2500, costPrice: 1800, stock: 30, category: 'Minuman Seduh / Cup' },
    { name: 'Marimas Mangga', price: 500, costPrice: 350, stock: 100, category: 'Minuman Seduh / Cup' },
    { name: 'Nutrisari Jeruk Peras', price: 1500, costPrice: 1100, stock: 50, category: 'Minuman Seduh / Cup' },
    { name: 'Es Teh Manis', price: 3000, costPrice: 1000, stock: 100, category: 'Minuman Seduh / Cup' },
    { name: 'Es Teh Tawar', price: 1500, costPrice: 500, stock: 100, category: 'Minuman Seduh / Cup' },
    { name: 'Kopi Hitam Cup', price: 3000, costPrice: 1500, stock: 100, category: 'Minuman Seduh / Cup' },
    { name: 'Kopi Good Day Cup', price: 4000, costPrice: 2000, stock: 100, category: 'Minuman Seduh / Cup' },

    // Popok
    { name: 'Popok Renceng', price: 2500, costPrice: 2000, stock: 30, category: 'Popok' },

    // Jajanan
    { name: 'Chiki Taro', price: 2000, costPrice: 1500, stock: 30, category: 'Jajanan' },
    { name: 'Chiki Balls', price: 2000, costPrice: 1500, stock: 30, category: 'Jajanan' },
    { name: 'Beng-Beng', price: 2500, costPrice: 2000, stock: 40, category: 'Jajanan' },
    { name: 'Gery Saluut', price: 1500, costPrice: 1200, stock: 30, category: 'Jajanan' },

    // Mainan
    { name: 'Mainan Kunci', price: 3000, costPrice: 2000, stock: 20, category: 'Mainan' },
    { name: 'Mainan Balon Tiup', price: 1000, costPrice: 600, stock: 50, category: 'Mainan' },
    { name: 'Mobil-mobilan Plastik', price: 5000, costPrice: 3500, stock: 15, category: 'Mainan' }
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Generate unique SKU & Barcode dynamically
    const catCode = p.category.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const prodCode = p.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const numCode = String(i + 1).padStart(3, '0');
    const generatedSku = `${catCode}-${prodCode}-${numCode}`;

    // Tentukan nama file gambar berdasarkan nama produk (contoh: minyak_kita_sachet.png)
    const imageFilename = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '.png';
    const imageUrl = `/uploads/products/${imageFilename}`;

    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        sku: generatedSku,
        categoryId: categoryMap[p.category],
        barcode: generatedSku,
        image: imageUrl,
        trackStock: true,
      },
    });
  }

  console.log('==================================')
  console.log('✨ SEEDING SELESAI DENGAN SUKSES ✨')
  console.log('==================================')
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
