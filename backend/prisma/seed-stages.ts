import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding stage categories and production stages...');

  // Define categories with their colors
  const categories = [
    { code: 'FORMING', name: 'Forming', color: '#4caf50', sortOrder: 1 },
    { code: 'DECOR', name: 'Decoration', color: '#ff9800', sortOrder: 2 },
    { code: 'DRYING', name: 'Drying', color: '#9c27b0', sortOrder: 3 },
    { code: 'FIRING', name: 'Firing', color: '#f44336', sortOrder: 4 },
    { code: 'GLAZING', name: 'Glazing', color: '#2196f3', sortOrder: 5 },
    { code: 'QC', name: 'Quality Control', color: '#607d8b', sortOrder: 6 },
  ];

  // Create categories
  for (const category of categories) {
    await prisma.stageCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
    console.log(`✅ Category: ${category.name}`);
  }

  // Define stages with their categories
  const stages = [
    // FORMING stages
    { code: 'THROWING', name: 'Throwing', categoryCode: 'FORMING', sortOrder: 1, requiresOven: false },
    { code: 'TRIMMING', name: 'Trimming', categoryCode: 'FORMING', sortOrder: 2, requiresOven: false },
    { code: 'DECORATION', name: 'Decoration', categoryCode: 'FORMING', sortOrder: 3, requiresOven: false },

    // DRYING stages
    { code: 'DRYING', name: 'Drying', categoryCode: 'DRYING', sortOrder: 1, requiresOven: false },

    // FIRING stages
    { code: 'LOAD_BISQUE', name: 'Load Bisque', categoryCode: 'FIRING', sortOrder: 1, requiresOven: true },
    { code: 'OUT_BISQUE', name: 'Out Bisque', categoryCode: 'FIRING', sortOrder: 2, requiresOven: true },
    { code: 'LOAD_HIGH_FIRING', name: 'Load High Firing', categoryCode: 'FIRING', sortOrder: 3, requiresOven: true },
    { code: 'OUT_HIGH_FIRING', name: 'Out High Firing', categoryCode: 'FIRING', sortOrder: 4, requiresOven: true },
    { code: 'LOAD_RAKU_FIRING', name: 'Load Raku Firing', categoryCode: 'FIRING', sortOrder: 5, requiresOven: true },
    { code: 'OUT_RAKU_FIRING', name: 'Out Raku Firing', categoryCode: 'FIRING', sortOrder: 6, requiresOven: true },
    { code: 'LOAD_LUSTER_FIRING', name: 'Load Luster Firing', categoryCode: 'FIRING', sortOrder: 7, requiresOven: true },
    { code: 'OUT_LUSTER_FIRING', name: 'Out Luster Firing', categoryCode: 'FIRING', sortOrder: 8, requiresOven: true },

    // GLAZING stages
    { code: 'SANDING', name: 'Sanding', categoryCode: 'GLAZING', sortOrder: 1, requiresOven: false },
    { code: 'WAXING', name: 'Waxing', categoryCode: 'GLAZING', sortOrder: 2, requiresOven: false },
    { code: 'DIPPING', name: 'Dipping', categoryCode: 'GLAZING', sortOrder: 3, requiresOven: false },
    { code: 'SPRAYING', name: 'Spraying', categoryCode: 'GLAZING', sortOrder: 4, requiresOven: false },
    { code: 'COLOR_DECORATION', name: 'Color Decoration', categoryCode: 'GLAZING', sortOrder: 5, requiresOven: false },

    // QC stages
    { code: 'QC_GOOD', name: 'Good', categoryCode: 'QC', sortOrder: 1, requiresOven: false },
    { code: 'QC_REJECT', name: 'Reject', categoryCode: 'QC', sortOrder: 2, requiresOven: false },
    { code: 'QC_RE_FIRING', name: 'Re-Firing', categoryCode: 'QC', sortOrder: 3, requiresOven: false },
    { code: 'QC_SECOND', name: 'Second', categoryCode: 'QC', sortOrder: 4, requiresOven: false },
  ];

  // Create stages
  for (const stage of stages) {
    const category = await prisma.stageCategory.findUnique({
      where: { code: stage.categoryCode },
    });

    if (category) {
      await prisma.productionStageConfig.upsert({
        where: { code: stage.code },
        update: {
          name: stage.name,
          categoryId: category.id,
          sortOrder: stage.sortOrder,
          requiresOven: stage.requiresOven,
        },
        create: {
          code: stage.code,
          name: stage.name,
          categoryId: category.id,
          sortOrder: stage.sortOrder,
          requiresOven: stage.requiresOven,
        },
      });
      console.log(`  ✅ Stage: ${stage.name} (${stage.categoryCode})`);
    }
  }

  console.log('✨ Stage seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding stages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
