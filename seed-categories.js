const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: "Listrik & Air", description: "Biaya PLN, PDAM, dsb" },
    { name: "Gas & Bahan Bakar", description: "Gas elpiji, bensin operasional" },
    { name: "Gaji Karyawan", description: "Upah dan bonus pegawai" },
    { name: "Perawatan & Perbaikan", description: "Service alat, perbaikan toko" },
    { name: "Belanja Operasional", description: "Kantong plastik, ATK, kebersihan" },
    { name: "Lain-lain", description: "Pengeluaran lainnya" }
  ]

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log("Seeded expense categories successfully.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
