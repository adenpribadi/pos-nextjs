const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');

  const category = await prisma.category.upsert({
    where: { name: 'Makanan Ringan' },
    update: {},
    create: {
      name: 'Makanan Ringan',
      color: '#ff5733',
    },
  });

  const products = [
    { name: 'Kopi Kenangan Mantan', price: 18000, stock: 50, sku: 'KPM-001' },
    { name: 'Roti Bakar Coklat', price: 15000, stock: 20, sku: 'RBC-021' },
    { name: 'Kentang Goreng', price: 20000, stock: 35, sku: 'KTG-011' },
    { name: 'Es Teh Manis', price: 5000, stock: 100, sku: 'ETM-005' },
    { name: 'Nasi Goreng Spesial', price: 35000, stock: 15, sku: 'NGS-032' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        sku: p.sku,
        categoryId: category.id,
        barcode: p.sku,
      },
    });
  }

  console.log('Products seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
