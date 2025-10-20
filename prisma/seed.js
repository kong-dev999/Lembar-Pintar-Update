/*const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SUPER_ADMIN_EMAIL & SUPER_ADMIN_PASSWORD harus diisi di .env");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "SUPER_ADMIN",
      password: hashedPassword,
      updatedAt: new Date(),
    },
    create: {
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      name: "Super Admin",
      emailVerified: new Date(),
      userCode: `SA-${randomUUID().slice(0, 8).toUpperCase()}`,
    },
  });

  console.info("✅ Super Admin siap:", user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });*/
//----------------------------------------------------------------------------
/*import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Create Users
    const user1 = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        password: await bcrypt.hash("password123", 10),
        role: "ADMIN",
        emailVerified: new Date(),
      }
    });

    const user2 = await prisma.user.create({
      data: {
        name: "Creator User",
        email: "creator@test.com",
        password: await bcrypt.hash("password123", 10),
        role: "USER",
        emailVerified: new Date(),
      }
    });

    console.log("✅ Created users:", user1.email, user2.email);

    // 2. Create Workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: "Test Workspace",
        slug: "test-workspace",
        creatorId: user1.id,
      }
    });

    console.log("✅ Created workspace:", workspace.name);

    // 3. Create Member
    const member1 = await prisma.member.create({
      data: {
        workspaceId: workspace.id,
        userId: user1.id,
        email: user1.email,
        inviter: user1.email,
        joinedAt: new Date(),
        status: "ACCEPTED",
        teamRole: "OWNER",
      }
    });

    const member2 = await prisma.member.create({
      data: {
        workspaceId: workspace.id,
        userId: user2.id,
        email: user2.email,
        inviter: user1.email,
        joinedAt: new Date(),
        status: "ACCEPTED",
        teamRole: "MEMBER",
      }
    });

    console.log("✅ Created members");

    // 4. Create a simple design
    const design = await prisma.design.create({
      data: {
        title: "Sample Design",
        description: "A sample design for testing",
        polotnoJson: {
          pages: [
            {
              id: "page1",
              background: "#ffffff",
              objects: [
                {
                  type: "text",
                  text: "Hello World",
                  fontSize: 48,
                  fill: "#000000",
                  x: 100,
                  y: 100
                }
              ]
            }
          ]
        },
        thumbnailUrl: "https://via.placeholder.com/300x200",
        workspaceId: workspace.id,
        ownerId: user1.id,
        status: "DRAFT",
        visibility: "PRIVATE"
      }
    });

    console.log("✅ Created design:", design.title);

    console.log("✅ Seed completed successfully!");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });*/
//---------------------------------------------------------------------------------------
// prisma/seed.js
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 memulai seeding...');

  // 1. buat super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'super@example.com';
  const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || 'super123';
  const hashedSuperPass = await bcrypt.hash(superAdminPass, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: superAdminEmail,
      password: hashedSuperPass,
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
      emailVerified: new Date(),
      userCode: `SA-${randomUUID().slice(0, 8).toUpperCase()}`,
    },
  });

  console.info('✅ Super Admin:', superAdmin.email);

  // 2. buat admin
  const adminEmail = 'admin@example.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedAdminPass = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      password: hashedAdminPass,
      role: 'ADMIN',
      name: 'Admin User',
      emailVerified: new Date(),
      userCode: `AD-${randomUUID().slice(0, 8).toUpperCase()}`,
    },
  });

  console.info('✅ Admin:', admin.email);

  console.log('✅ seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });