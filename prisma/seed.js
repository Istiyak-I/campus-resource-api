require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const names = ["Computer Science", "Mathematics", "Electronics", "General"];
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log("Seeded default resource categories.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
