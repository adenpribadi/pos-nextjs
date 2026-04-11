const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products and categories...');

  const categories = [
    { name: 'Makanan Berat', color: '#ef4444' }, // Red
    { name: 'Minuman', color: '#3b82f6' },      // Blue
    { name: 'Makanan Ringan', color: '#f59e0b' }, // Amber
    { name: 'Pencuci Mulut', color: '#ec4899' },  // Pink
    { name: 'Bahan Pokok', color: '#10b981' },    // Emerald
  ];

  const categoryMap = {};

  for (const cat of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: cat.name },
      update: { color: cat.color },
      create: {
        name: cat.name,
        color: cat.color,
      },
    });
    categoryMap[cat.name] = createdCategory.id;
  }

  const products = [
    // Makanan Berat
    { name: 'Nasi Goreng Spesial', price: 35000, stock: 20, sku: 'NGS-001', category: 'Makanan Berat' },
    { name: 'Ayam Bakar Madu', price: 42000, stock: 15, sku: 'ABM-002', category: 'Makanan Berat' },
    { name: 'Mie Goreng Seafood', price: 38000, stock: 25, sku: 'MGS-003', category: 'Makanan Berat' },
    
    // Minuman
    { name: 'Kopi Kenangan Mantan', price: 18000, stock: 50, sku: 'KPM-001', category: 'Minuman' },
    { name: 'Es Teh Manis', price: 5000, stock: 100, sku: 'ETM-005', category: 'Minuman' },
    { name: 'Jus Alpukat Kocok', price: 15000, stock: 30, sku: 'JAK-006', category: 'Minuman' },
    
    // Makanan Ringan
    { name: 'Kentang Goreng Cheese', price: 20000, stock: 35, sku: 'KTG-011', category: 'Makanan Ringan' },
    { name: 'Cireng Bumbu Rujak', price: 12000, stock: 40, sku: 'CBR-012', category: 'Makanan Ringan' },
    
    // Pencuci Mulut
    { name: 'Roti Bakar Coklat', price: 15000, stock: 20, sku: 'RBC-021', category: 'Pencuci Mulut' },
    { name: 'Pisang Keju Susu', price: 18000, stock: 25, sku: 'PKS-022', category: 'Pencuci Mulut' },
    
    // Bahan Pokok
    { name: 'Beras Pandan Wangi 5kg', price: 85000, stock: 10, sku: 'BPW-051', category: 'Bahan Pokok' },
    { name: 'Minyak Goreng 2L', price: 34000, stock: 15, sku: 'MG2-052', category: 'Bahan Pokok' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        price: p.price,
        stock: p.stock,
        categoryId: categoryMap[p.category],
      },
      create: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        sku: p.sku,
        categoryId: categoryMap[p.category],
        barcode: p.sku,
        trackStock: true,
      },
    });
  }

  console.log('Categories and Products seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
