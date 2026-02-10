import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro 14"',
        price: new Prisma.Decimal(2499.99),
        unit: 'USD',
      },
      {
        name: 'iPhone 15',
        price: new Prisma.Decimal(999.99),
        unit: 'USD',
      },
      {
        name: 'AirPods Pro',
        price: new Prisma.Decimal(5990000),
        unit: 'VND',
      },
    ],
    skipDuplicates: true, // tránh insert trùng khi seed lại
  });
}

main()
  .then(() => {
    console.log('✅ Product seed data inserted');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
