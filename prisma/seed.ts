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
    { name: 'Makanan Berat', color: '#ef4444' }, // Red
    { name: 'Minuman', color: '#3b82f6' },      // Blue
    { name: 'Makanan Ringan', color: '#f59e0b' }, // Amber
    { name: 'Pencuci Mulut', color: '#ec4899' },  // Pink
    { name: 'Bahan Pokok', color: '#10b981' },    // Emerald
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
    // Makanan Berat
    { name: 'Nasi Goreng Spesial', price: 35000, costPrice: 20000, stock: 20, sku: 'NGS-001', category: 'Makanan Berat' },
    { name: 'Ayam Bakar Madu', price: 42000, costPrice: 25000, stock: 15, sku: 'ABM-002', category: 'Makanan Berat' },
    { name: 'Mie Goreng Seafood', price: 38000, costPrice: 22000, stock: 25, sku: 'MGS-003', category: 'Makanan Berat' },
    
    // Minuman
    { name: 'Kopi Kenangan Mantan', price: 18000, costPrice: 8000, stock: 50, sku: 'KPM-001', category: 'Minuman' },
    { name: 'Es Teh Manis', price: 5000, costPrice: 1500, stock: 100, sku: 'ETM-005', category: 'Minuman' },
    { name: 'Jus Alpukat Kocok', price: 15000, costPrice: 7000, stock: 30, sku: 'JAK-006', category: 'Minuman' },
    
    // Makanan Ringan
    { name: 'Kentang Goreng Cheese', price: 20000, costPrice: 10000, stock: 35, sku: 'KTG-011', category: 'Makanan Ringan' },
    { name: 'Cireng Bumbu Rujak', price: 12000, costPrice: 5000, stock: 40, sku: 'CBR-012', category: 'Makanan Ringan' },
    
    // Pencuci Mulut
    { name: 'Roti Bakar Coklat', price: 15000, costPrice: 8000, stock: 20, sku: 'RBC-021', category: 'Pencuci Mulut' },
    { name: 'Pisang Keju Susu', price: 18000, costPrice: 9000, stock: 25, sku: 'PKS-022', category: 'Pencuci Mulut' },
    
    // Bahan Pokok
    { name: 'Beras Pandan Wangi 5kg', price: 85000, costPrice: 75000, stock: 10, sku: 'BPW-051', category: 'Bahan Pokok' },
    { name: 'Minyak Goreng 2L', price: 34000, costPrice: 28000, stock: 15, sku: 'MG2-052', category: 'Bahan Pokok' },
  ];

  // Membaca gambar yang tersedia di folder public/uploads/products
  const fs = require('fs');
  const path = require('path');
  const imagesDir = path.join(process.cwd(), 'public/uploads/products');
  let availableImages: string[] = [];
  
  try {
    if (fs.existsSync(imagesDir)) {
      availableImages = fs.readdirSync(imagesDir).filter((f: string) => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));
    }
  } catch (error) {
    console.log('Tidak dapat membaca folder gambar:', error);
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Mencari gambar yang nama filenya sama dengan nama produk
    const matchingImage = availableImages.find(img => img.startsWith(p.name));
    const imageUrl = matchingImage ? `/uploads/products/${matchingImage}` : null;

    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        sku: p.sku,
        categoryId: categoryMap[p.category],
        barcode: p.sku,
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
