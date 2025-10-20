// Educational Hierarchy Seed Data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEducationalData() {
  console.log('🌱 Seeding educational hierarchy data...');

  // 1. Education Levels
  const educationLevels = await prisma.educationLevel.createMany({
    data: [
      { name: 'TK', slug: 'tk', order: 1 },
      { name: 'SD', slug: 'sd', order: 2 },
      { name: 'SMP', slug: 'smp', order: 3 },
      { name: 'SMA', slug: 'sma', order: 4 },
    ],
    skipDuplicates: true
  });

  // 2. Get created education levels
  const tk = await prisma.educationLevel.findUnique({ where: { slug: 'tk' } });
  const sd = await prisma.educationLevel.findUnique({ where: { slug: 'sd' } });
  const smp = await prisma.educationLevel.findUnique({ where: { slug: 'smp' } });
  const sma = await prisma.educationLevel.findUnique({ where: { slug: 'sma' } });

  // 3. Grades for each level
  const grades = [
    // TK
    { name: 'A', displayName: 'TK A', educationLevelId: tk.id, order: 1 },
    { name: 'B', displayName: 'TK B', educationLevelId: tk.id, order: 2 },

    // SD
    { name: '1', displayName: 'Kelas 1', educationLevelId: sd.id, order: 1 },
    { name: '2', displayName: 'Kelas 2', educationLevelId: sd.id, order: 2 },
    { name: '3', displayName: 'Kelas 3', educationLevelId: sd.id, order: 3 },
    { name: '4', displayName: 'Kelas 4', educationLevelId: sd.id, order: 4 },
    { name: '5', displayName: 'Kelas 5', educationLevelId: sd.id, order: 5 },
    { name: '6', displayName: 'Kelas 6', educationLevelId: sd.id, order: 6 },

    // SMP
    { name: '7', displayName: 'Kelas 7', educationLevelId: smp.id, order: 1 },
    { name: '8', displayName: 'Kelas 8', educationLevelId: smp.id, order: 2 },
    { name: '9', displayName: 'Kelas 9', educationLevelId: smp.id, order: 3 },

    // SMA
    { name: '10', displayName: 'Kelas 10', educationLevelId: sma.id, order: 1 },
    { name: '11', displayName: 'Kelas 11', educationLevelId: sma.id, order: 2 },
    { name: '12', displayName: 'Kelas 12', educationLevelId: sma.id, order: 3 },
  ];

  await prisma.grade.createMany({
    data: grades,
    skipDuplicates: true
  });

  // 4. Subjects
  const subjects = [
    // TK
    { name: 'Calistung', slug: 'calistung', applicableLevels: ['TK'] },
    { name: 'Motorik', slug: 'motorik', applicableLevels: ['TK'] },
    { name: 'Bahasa', slug: 'bahasa-tk', applicableLevels: ['TK'] },
    { name: 'Agama', slug: 'agama-tk', applicableLevels: ['TK'] },

    // SD
    { name: 'Matematika', slug: 'matematika', applicableLevels: ['SD', 'SMP', 'SMA'] },
    { name: 'Bahasa Indonesia', slug: 'bahasa-indonesia', applicableLevels: ['SD', 'SMP', 'SMA'] },
    { name: 'IPA', slug: 'ipa', applicableLevels: ['SD', 'SMP'] },
    { name: 'IPS', slug: 'ips', applicableLevels: ['SD', 'SMP'] },
    { name: 'PKN', slug: 'pkn', applicableLevels: ['SD', 'SMP', 'SMA'] },
    { name: 'Seni Budaya', slug: 'seni-budaya', applicableLevels: ['SD', 'SMP', 'SMA'] },
    { name: 'PJOK', slug: 'pjok', applicableLevels: ['SD', 'SMP', 'SMA'] },
    { name: 'Bahasa Daerah', slug: 'bahasa-daerah', applicableLevels: ['SD'] },

    // SMP Additional
    { name: 'Bahasa Inggris', slug: 'bahasa-inggris', applicableLevels: ['SMP', 'SMA'] },
    { name: 'Prakarya', slug: 'prakarya', applicableLevels: ['SMP'] },

    // SMA Specific
    { name: 'Fisika', slug: 'fisika', applicableLevels: ['SMA'] },
    { name: 'Kimia', slug: 'kimia', applicableLevels: ['SMA'] },
    { name: 'Biologi', slug: 'biologi', applicableLevels: ['SMA'] },
    { name: 'Sejarah', slug: 'sejarah', applicableLevels: ['SMA'] },
    { name: 'Geografi', slug: 'geografi', applicableLevels: ['SMA'] },
    { name: 'Ekonomi', slug: 'ekonomi', applicableLevels: ['SMA'] },
    { name: 'Sosiologi', slug: 'sosiologi', applicableLevels: ['SMA'] },
  ];

  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true
  });

  console.log('✅ Educational hierarchy data seeded successfully!');
  console.log(`Created ${educationLevels.count} education levels`);
  console.log(`Created ${grades.length} grades`);
  console.log(`Created ${subjects.length} subjects`);
}

module.exports = { seedEducationalData };

// Run if called directly
if (require.main === module) {
  seedEducationalData()
    .catch((e) => {
      console.error('❌ Error seeding educational data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}