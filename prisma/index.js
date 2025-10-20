// prisma/index.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'], // opsional: log query
    });
  }
  prisma = global.prisma;
}

// 👇 Tutup koneksi saat proses dihentikan
process.on('beforeExit', async () => {
  console.log('Prisma: Disconnecting...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('Prisma: Got SIGINT. Disconnecting...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Prisma: Got SIGTERM. Disconnecting...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;