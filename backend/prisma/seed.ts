import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.discrepancyAlert.deleteMany();
  await prisma.decorationTask.deleteMany();
  await prisma.productionRecord.deleteMany();
  await prisma.revisionTicket.deleteMany();
  await prisma.logbookEntry.deleteMany();
  await prisma.productPart.deleteMany();
  await prisma.pOLDetail.deleteMany();
  await prisma.pOL.deleteMany();
  await prisma.user.deleteMany();
  await prisma.oven.deleteMany();
  await prisma.defectReason.deleteMany();
  await prisma.productionStageConfig.deleteMany();
  await prisma.stageCategory.deleteMany();

  console.log('✅ Existing data cleared');

  // Create users
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const manager = await prisma.user.create({
    data: {
      id: 'user-manager-001',
      username: 'manager',
      email: 'manager@prodganti.com',
      passwordHash: hashedPassword,
      fullName: 'Madegun',
      role: 'MANAGER',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: 'user-admin-001',
      username: 'admin',
      email: 'admin@prodganti.com',
      passwordHash: hashedPassword,
      fullName: 'Eka Karyawan',
      role: 'ADMIN',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create WORKER users for production tracking
  const workerNames = [
    { username: 'worker1', fullName: 'Alvin' },
    { username: 'worker2', fullName: 'Gusti' },
    { username: 'worker3', fullName: 'Balon' },
    { username: 'worker4', fullName: 'Deksudi' },
    { username: 'worker5', fullName: 'Dedik' },
    { username: 'worker6', fullName: 'Boki' },
    { username: 'worker7', fullName: 'Lantur' },
    { username: 'worker8', fullName: 'Gading' },
    { username: 'worker9', fullName: 'Meong' },
    { username: 'worker10', fullName: 'Yogi' },
    { username: 'worker11', fullName: 'Yande' },
    { username: 'worker12', fullName: 'Dejer' },
    { username: 'worker13', fullName: 'Alon' },
    { username: 'worker14', fullName: 'Bandut' },
    { username: 'worker15', fullName: 'Osyong' },
    { username: 'worker16', fullName: 'Ketut' },
    { username: 'worker17', fullName: 'Komo' },
    { username: 'worker18', fullName: 'Wulan' },
    { username: 'worker19', fullName: 'Wardita' },
  ];

  for (let i = 0; i < workerNames.length; i++) {
    const worker = workerNames[i];
    await prisma.user.create({
      data: {
        id: `user-worker-${String(i + 1).padStart(3, '0')}`,
        username: worker.username,
        email: `${worker.username}@forming.com`,
        passwordHash: hashedPassword,
        fullName: worker.fullName,
        role: 'WORKER',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Users created (2 users + 19 workers)');

  // Create Ovens
  console.log('🔥 Creating Ovens...');
  
  const ovens = [];
  for (let i = 1; i <= 7; i++) {
    const oven = await prisma.oven.create({
      data: {
        id: `oven-${String(i).padStart(3, '0')}`,
        ovenCode: `K${i}`,
        ovenName: `Kiln ${i}`,
        status: 'ACTIVE',
        capacity: 100,
      },
    });
    ovens.push(oven);
  }
  
  console.log('✅ Ovens created (7 ovens)');

  // Create Defect Reasons
  console.log('🔍 Creating Defect Reasons...');
  
  const defectReasons = await Promise.all([
    prisma.defectReason.create({
      data: {
        id: 'defect-001',
        category: 'Defect',
        description: 'General defect during production',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-002',
        category: 'Break',
        description: 'Item broken during handling or processing',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-003',
        category: 'Glaze Color',
        description: 'Glaze color does not match specification',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-004',
        category: 'Crack',
        description: 'Cracks in the ceramic piece',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-005',
        category: 'Warping',
        description: 'Piece warped during firing',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-006',
        category: 'Size Issue',
        description: 'Size does not meet specifications',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-007',
        category: 'Surface Defect',
        description: 'Surface imperfections',
        isActive: true,
      },
    }),
    prisma.defectReason.create({
      data: {
        id: 'defect-008',
        category: 'Firing Issue',
        description: 'Problems during firing process',
        isActive: true,
      },
    }),
  ]);
  
  console.log('✅ Defect Reasons created (8 reasons)');

  // Create Stage Categories
  console.log('📊 Creating Stage Categories...');
  
  const stageCategories = await Promise.all([
    prisma.stageCategory.create({
      data: {
        id: 'cat-forming',
        code: 'FORMING',
        name: 'Forming',
        color: '#4caf50',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.stageCategory.create({
      data: {
        id: 'cat-decor',
        code: 'DECOR',
        name: 'Decoration',
        color: '#ff9800',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.stageCategory.create({
      data: {
        id: 'cat-drying',
        code: 'DRYING',
        name: 'Drying',
        color: '#9c27b0',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.stageCategory.create({
      data: {
        id: 'cat-firing',
        code: 'FIRING',
        name: 'Firing',
        color: '#f44336',
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.stageCategory.create({
      data: {
        id: 'cat-glazing',
        code: 'GLAZING',
        name: 'Glazing',
        color: '#2196f3',
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.stageCategory.create({
      data: {
        id: 'cat-qc',
        code: 'QC',
        name: 'Quality Control',
        color: '#607d8b',
        sortOrder: 6,
        isActive: true,
      },
    }),
  ]);
  
  console.log('✅ Stage Categories created (6 categories)');

  // Create Production Stage Configs
  console.log('⚙️ Creating Production Stage Configs...');
  
  const stageConfigs = await Promise.all([
    // FORMING stages
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-throwing',
        code: 'THROWING',
        name: 'Throwing',
        categoryId: 'cat-forming',
        sortOrder: 1,
        isActive: true,
        requiresOven: false,
        description: 'Initial shaping of clay on the wheel',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-trimming',
        code: 'TRIMMING',
        name: 'Trimming',
        categoryId: 'cat-forming',
        sortOrder: 2,
        isActive: true,
        requiresOven: false,
        description: 'Trimming and refining the shape',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-decoration',
        code: 'DECORATION',
        name: 'Decoration',
        categoryId: 'cat-forming',
        sortOrder: 3,
        isActive: true,
        requiresOven: false,
        description: 'Adding decorative elements',
      },
    }),
    // DRYING stages
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-drying',
        code: 'DRYING',
        name: 'Drying',
        categoryId: 'cat-drying',
        sortOrder: 1,
        isActive: true,
        requiresOven: false,
        description: 'Air drying before bisque firing',
      },
    }),
    // FIRING stages
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-load-bisque',
        code: 'LOAD_BISQUE',
        name: 'Load Bisque',
        categoryId: 'cat-firing',
        sortOrder: 1,
        isActive: true,
        requiresOven: true,
        description: 'Loading items into bisque kiln',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-out-bisque',
        code: 'OUT_BISQUE',
        name: 'Out Bisque',
        categoryId: 'cat-firing',
        sortOrder: 2,
        isActive: true,
        requiresOven: true,
        description: 'Unloading items from bisque kiln',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-load-high-firing',
        code: 'LOAD_HIGH_FIRING',
        name: 'Load High Firing',
        categoryId: 'cat-firing',
        sortOrder: 3,
        isActive: true,
        requiresOven: true,
        description: 'Loading items into high fire kiln',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-out-high-firing',
        code: 'OUT_HIGH_FIRING',
        name: 'Out High Firing',
        categoryId: 'cat-firing',
        sortOrder: 4,
        isActive: true,
        requiresOven: true,
        description: 'Unloading items from high fire kiln',
      },
    }),
    // GLAZING stages
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-sanding',
        code: 'SANDING',
        name: 'Sanding',
        categoryId: 'cat-glazing',
        sortOrder: 1,
        isActive: true,
        requiresOven: false,
        description: 'Sanding the surface before glazing',
      },
    }),
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-dipping',
        code: 'DIPPING',
        name: 'Dipping',
        categoryId: 'cat-glazing',
        sortOrder: 2,
        isActive: true,
        requiresOven: false,
        description: 'Dipping items in glaze',
      },
    }),
    // QC stages
    prisma.productionStageConfig.create({
      data: {
        id: 'stage-qc-good',
        code: 'QC_GOOD',
        name: 'QC Good',
        categoryId: 'cat-qc',
        sortOrder: 1,
        isActive: true,
        requiresOven: false,
        description: 'Quality control - passed inspection',
      },
    }),
  ]);
  
  console.log('✅ Production Stage Configs created (11 stages)');

  // Create POLs
  console.log('📋 Creating POLs...');
  
  const pol1 = await prisma.pOL.create({
    data: {
      id: 'pol-001',
      poNumber: 'PO-2026-001',
      clientName: 'ABC Corporation',
      poDate: new Date('2026-01-15'),
      deliveryDate: new Date('2026-02-15'),
      status: 'IN_PROGRESS',
      notes: 'First order of the year',
      createdBy: manager.id,
    },
  });

  const pol2 = await prisma.pOL.create({
    data: {
      id: 'pol-002',
      poNumber: 'PO-2026-002',
      clientName: 'XYZ Limited',
      poDate: new Date('2026-01-20'),
      deliveryDate: new Date('2026-02-20'),
      status: 'IN_PROGRESS',
      notes: 'Regular customer order',
      createdBy: manager.id,
    },
  });

  const pol3 = await prisma.pOL.create({
    data: {
      id: 'pol-003',
      poNumber: 'PO-2026-003',
      clientName: '123 Industries',
      poDate: new Date('2026-01-25'),
      deliveryDate: new Date('2026-03-01'),
      status: 'PENDING',
      notes: 'Large order pending approval',
      createdBy: manager.id,
    },
  });

  const pol4 = await prisma.pOL.create({
    data: {
      id: 'pol-004',
      poNumber: 'PO-2026-004',
      clientName: 'Sample Inc',
      poDate: new Date('2026-02-01'),
      deliveryDate: new Date('2026-02-25'),
      status: 'COMPLETED',
      notes: 'Sample order for testing',
      createdBy: manager.id,
    },
  });

  const pol5 = await prisma.pOL.create({
    data: {
      id: 'pol-005',
      poNumber: 'PO-2026-005',
      clientName: 'Test Client',
      poDate: new Date('2026-02-10'),
      deliveryDate: new Date('2026-03-10'),
      status: 'CANCELLED',
      notes: 'Cancelled due to customer request',
      createdBy: manager.id,
    },
  });

  console.log('✅ POLs created (5 POLs)');

  // Create POL Details
  console.log('📦 Creating POL Details...');
  
  // POL 1 - Teapot
  const detail1 = await prisma.pOLDetail.create({
    data: {
      id: 'detail-001',
      polId: pol1.id,
      productCode: 'TP-MAIN',
      productName: 'Teapot (Main Body)',
      quantity: 50,
      productType: 'PLAIN',
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      finalSize: '500ml',
      notes: 'Main body for teapot',
    },
  });

  const detail2 = await prisma.pOLDetail.create({
    data: {
      id: 'detail-002',
      polId: pol1.id,
      productCode: 'TP-LID',
      productName: 'Teapot (Lid)',
      quantity: 50,
      productType: 'PLAIN',
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      finalSize: '500ml',
      notes: 'Lid for teapot',
    },
  });

  // POL 2 - Cups
  const detail3 = await prisma.pOLDetail.create({
    data: {
      id: 'detail-003',
      polId: pol2.id,
      productCode: 'CP-MAIN',
      productName: 'Cup (Main Body)',
      quantity: 100,
      productType: 'DECOR',
      color: 'White',
      texture: 'Smooth',
      material: 'Porcelain',
      size: '250ml',
      finalSize: '250ml',
      notes: 'Cups with decoration',
    },
  });

  // POL 3 - Bowls
  const detail4 = await prisma.pOLDetail.create({
    data: {
      id: 'detail-004',
      polId: pol3.id,
      productCode: 'BWL-MAIN',
      productName: 'Bowl (Main)',
      quantity: 75,
      productType: 'HAND_BUILT',
      color: 'Red',
      texture: 'Textured',
      material: 'Earthenware',
      size: '12inch',
      finalSize: '12inch',
      notes: 'Hand-built bowls',
    },
  });

  const detail5 = await prisma.pOLDetail.create({
    data: {
      id: 'detail-005',
      polId: pol4.id,
      productCode: 'PLT-MAIN',
      productName: 'Plate (Main)',
      quantity: 50,
      productType: 'SLAB_TRAY',
      color: 'Green',
      texture: 'Textured',
      material: 'Stoneware',
      size: '10inch',
      finalSize: '10inch',
      notes: 'Slab-built plates',
    },
  });

  console.log('✅ POL Details created (5 details)');

  // Create Product Parts for Teapot
  console.log('🧩 Creating Product Parts...');
  
  // Teapot Body Parts
  await prisma.productPart.create({
    data: {
      id: 'part-001',
      polDetailId: detail1.id,
      partName: 'Body',
      partType: 'MAIN',
      throwingRequired: true,
      throwingOrder: 1,
    },
  });
  
  await prisma.productPart.create({
    data: {
      id: 'part-002',
      polDetailId: detail1.id,
      partName: 'Lid',
      partType: 'SUB',
      throwingRequired: true,
      throwingOrder: 2,
    },
  });
  
  await prisma.productPart.create({
    data: {
      id: 'part-003',
      polDetailId: detail1.id,
      partName: 'Spout',
      partType: 'SUB',
      throwingRequired: true,
      throwingOrder: 3,
    },
  });
  
  await prisma.productPart.create({
    data: {
      id: 'part-004',
      polDetailId: detail1.id,
      partName: 'Handle',
      partType: 'SUB',
      throwingRequired: true,
      throwingOrder: 4,
    },
  });
  
  // Teapot Lid Parts
  await prisma.productPart.create({
    data: {
      id: 'part-005',
      polDetailId: detail2.id,
      partName: 'Lid Body',
      partType: 'MAIN',
      throwingRequired: true,
      throwingOrder: 1,
    },
  });
  
  await prisma.productPart.create({
    data: {
      id: 'part-006',
      polDetailId: detail2.id,
      partName: 'Knob',
      partType: 'SUB',
      throwingRequired: true,
      throwingOrder: 2,
    },
  });
  
  console.log('✅ Product Parts created (6 parts)');

  // Create Production Records
  console.log('🏭 Creating Production Records...');
  
  // Forming stage for Teapot Main Body
  const productionRecord1 = await prisma.productionRecord.create({
    data: {
      id: 'record-001',
      polDetailId: detail1.id,
      stage: 'THROWING',
      quantity: 50,
      notes: 'Initial throwing completed',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-002',
      polDetailId: detail1.id,
      stage: 'TRIMMING',
      quantity: 48,
      notes: '2 pieces cracked during trimming',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-003',
      polDetailId: detail1.id,
      stage: 'DRYING',
      quantity: 48,
      notes: 'Drying completed',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-004',
      polDetailId: detail1.id,
      stage: 'LOAD_BISQUE',
      quantity: 48,
      notes: 'Loaded into bisque kiln',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-005',
      polDetailId: detail1.id,
      stage: 'OUT_BISQUE',
      quantity: 48,
      notes: 'Out of bisque kiln',
      userId: admin.id,
    },
  });

  // Firing stage
  await prisma.productionRecord.create({
    data: {
      id: 'record-006',
      polDetailId: detail1.id,
      stage: 'LOAD_HIGH_FIRING',
      quantity: 48,
      notes: 'Loaded into high fire kiln',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-007',
      polDetailId: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      quantity: 47,
      notes: '1 piece cracked during firing',
      userId: admin.id,
    },
  });

  // Glazing stage
  await prisma.productionRecord.create({
    data: {
      id: 'record-008',
      polDetailId: detail1.id,
      stage: 'SANDING',
      quantity: 46,
      notes: 'Sanding completed',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-009',
      polDetailId: detail1.id,
      stage: 'DIPPING',
      quantity: 46,
      notes: 'Blue glaze dip completed',
      userId: admin.id,
    },
  });

  // QC stage
  await prisma.productionRecord.create({
    data: {
      id: 'record-010',
      polDetailId: detail1.id,
      stage: 'QC_GOOD',
      quantity: 45,
      notes: '1 piece rejected - crack in rim',
      userId: admin.id,
    },
  });

  // Forming stage for Teapot Lid
  await prisma.productionRecord.create({
    data: {
      id: 'record-011',
      polDetailId: detail2.id,
      stage: 'THROWING',
      quantity: 50,
      notes: 'Lid throwing completed',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-012',
      polDetailId: detail2.id,
      stage: 'TRIMMING',
      quantity: 50,
      notes: 'Lid trimming completed',
      userId: admin.id,
    },
  });

  // Forming stage for Cups
  await prisma.productionRecord.create({
    data: {
      id: 'record-013',
      polDetailId: detail3.id,
      stage: 'THROWING',
      quantity: 100,
      notes: 'Cup throwing completed',
      userId: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      id: 'record-014',
      polDetailId: detail3.id,
      stage: 'DECORATION',
      quantity: 100,
      notes: 'Decoration in progress',
      userId: admin.id,
    },
  });

  console.log('✅ Production Records created (14 records)');

  // Create Decoration Tasks for Cups
  console.log('🎨 Creating Decoration Tasks...');
  
  await prisma.decorationTask.create({
    data: {
      id: 'task-001',
      polDetailId: detail3.id,
      taskName: 'Carving Pattern',
      description: 'Carve floral pattern on cup body',
      quantity: 100,
      completed: false,
      userId: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      id: 'task-002',
      polDetailId: detail3.id,
      taskName: 'Handle Installation',
      description: 'Attach handles to cup body',
      quantity: 100,
      completed: false,
      userId: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      id: 'task-003',
      polDetailId: detail3.id,
      taskName: 'Color Decoration',
      description: 'Apply color decoration to cups',
      quantity: 100,
      completed: false,
      userId: admin.id,
    },
  });

  console.log('✅ Decoration Tasks created (3 tasks)');

  // Create Discrepancy Alerts
  console.log('🚨 Creating Discrepancy Alerts...');
  
  const alert1 = await prisma.discrepancyAlert.create({
    data: {
      id: 'alert-001',
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'TRIMMING',
      expectedQuantity: 50,
      actualQuantity: 48,
      difference: -2,
      priority: 'MEDIUM',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  const alert2 = await prisma.discrepancyAlert.create({
    data: {
      id: 'alert-002',
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      expectedQuantity: 48,
      actualQuantity: 47,
      difference: -1,
      priority: 'MEDIUM',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  const alert3 = await prisma.discrepancyAlert.create({
    data: {
      id: 'alert-003',
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'QC_GOOD',
      expectedQuantity: 50,
      actualQuantity: 45,
      difference: -5,
      priority: 'HIGH',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  console.log('✅ Discrepancy Alerts created (3 alerts)');

  // Create Logbook Entries
  console.log('📝 Creating Logbook Entries...');
  
  await prisma.logbookEntry.create({
    data: {
      id: 'log-001',
      polId: pol1.id,
      polDetailId: detail1.id,
      userId: admin.id,
      entryDate: new Date(),
      status: 'RESOLVED',
      notes: '2 pieces cracked during trimming',
      issues: 'Cracking during trimming',
      actions: 'Adjusted drying time and humidity control',
    },
  });

  await prisma.logbookEntry.create({
    data: {
      id: 'log-002',
      polId: pol1.id,
      polDetailId: detail1.id,
      userId: admin.id,
      entryDate: new Date(),
      status: 'ISSUES',
      notes: '1 piece cracked in rim during firing',
      issues: 'Crack in rim during firing',
      actions: 'Adjust firing temperature profile',
    },
  });

  await prisma.logbookEntry.create({
    data: {
      id: 'log-003',
      polId: pol1.id,
      polDetailId: detail1.id,
      userId: admin.id,
      entryDate: new Date(),
      status: 'RESOLVED',
      notes: '1 piece rejected - crack in rim',
      issues: 'Crack in rim',
      actions: 'Remake as QC Good',
    },
  });

  await prisma.logbookEntry.create({
    data: {
      id: 'log-004',
      polId: pol2.id,
      polDetailId: detail3.id,
      userId: admin.id,
      entryDate: new Date(),
      status: 'ISSUES',
      notes: 'Decoration taking longer than expected',
      issues: 'Decoration delay',
      actions: 'Monitor progress and adjust timeline',
    },
  });

  console.log('✅ Logbook Entries created (4 entries)');

  // Create Revision Tickets
  console.log('📋 Creating Revision Tickets...');
  
  const revision1 = await prisma.revisionTicket.create({
    data: {
      id: 'rev-001',
      polId: pol1.id,
      polDetailId: detail1.id,
      createdBy: manager.id,
      type: 'DESIGN',
      issueType: 'DESIGN',
      severity: 'MEDIUM',
      description: 'Customer requested lid design change from flat to domed shape for better heat retention',
      proposedSolution: 'Modify mold to create domed lid shape',
      status: 'DRAFT',
    },
  });

  const revision2 = await prisma.revisionTicket.create({
    data: {
      id: 'rev-002',
      polId: pol3.id,
      polDetailId: detail4.id,
      createdBy: manager.id,
      type: 'MATERIAL',
      issueType: 'MATERIAL',
      severity: 'HIGH',
      description: 'Clay type needs to be changed from Stoneware to Porcelain for better durability',
      proposedSolution: 'Switch to Porcelain clay body',
      status: 'DRAFT',
    },
  });

  console.log('✅ Revision Tickets created (2 tickets)');

  // Create Activity Logs
  console.log('📊 Creating Activity Logs...');
  await prisma.activityLog.create({
    data: {
      id: 'activity-001',
      userId: manager.id,
      action: 'CREATE_POL',
      entityType: 'POL',
      entityId: pol1.id,
      details: 'Created PO-2026-001 for ABC Corporation',
    },
  });

  await prisma.activityLog.create({
    data: {
      id: 'activity-002',
      userId: manager.id,
      action: 'ADD_POL_DETAIL',
      entityType: 'POL_DETAIL',
      entityId: detail1.id,
      details: 'Added Teapot (Main Body) to PO-2026-001',
    },
  });

  await prisma.activityLog.create({
    data: {
      id: 'activity-003',
      userId: admin.id,
      action: 'TRACK_PRODUCTION',
      entityType: 'PRODUCTION_RECORD',
      entityId: productionRecord1.id,
      details: 'Tracked THROWING stage for Teapot (Main Body)',
    },
  });

  await prisma.activityLog.create({
    data: {
      id: 'activity-004',
      userId: admin.id,
      action: 'CREATE_DISCREPANCY_ALERT',
      entityType: 'DISCREPANCY_ALERT',
      entityId: alert1.id,
      details: 'Created alert for quantity discrepancy at TRIMMING stage',
    },
  });

  console.log('✅ Activity Logs created (4 logs)');

  console.log('');
  console.log('📊 SEED SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('👤 Users Created:');
  console.log('   - 1 Manager: manager / manager@prodganti.com');
  console.log('   - 1 Admin: admin / admin@prodganti.com');
  console.log('   - 5 Workers: worker1-5 / (for production tracking)');
  console.log('');
  console.log('🔥 Ovens Created:');
  console.log('   - K1 through K7 (7 kilns)');
  console.log('');
  console.log('🔍 Defect Reasons Created:');
  console.log('   - Defect, Break, Glaze Color, Crack, Warping, Size Issue, Surface Defect, Firing Issue (8 reasons)');
  console.log('');
  console.log('📊 Stage Categories Created:');
  console.log('   - Forming, Decoration, Drying, Firing, Glazing, Quality Control (6 categories)');
  console.log('');
  console.log('⚙️ Production Stage Configs Created:');
  console.log('   - 11 stages across all categories');
  console.log('');
  console.log('📋 POLs Created:');
  console.log('   - PO-2026-001: ABC Corporation (IN_PROGRESS)');
  console.log('   - PO-2026-002: XYZ Limited (IN_PROGRESS)');
  console.log('   - PO-2026-003: 123 Industries (PENDING)');
  console.log('   - PO-2026-004: Sample Inc (COMPLETED)');
  console.log('   - PO-2026-005: Test Client (CANCELLED)');
  console.log('');
  console.log('📦 POL Details Created:');
  console.log('   - Teapot (Main Body): 50 items (PLAIN)');
  console.log('   - Teapot (Lid): 50 items (PLAIN)');
  console.log('   - Cup (Main Body): 100 items (DECOR)');
  console.log('   - Bowl (Main): 75 items (HAND_BUILT)');
  console.log('   - Plate (Main): 50 items (SLAB_TRAY)');
  console.log('');
  console.log('🧩 Product Parts Created:');
  console.log('   - Teapot (Main Body): Body, Lid, Spout, Handle (4 parts)');
  console.log('   - Teapot (Lid): Lid Body, Knob (2 parts)');
  console.log('');
  console.log('🏭 Production Records Created:');
  console.log('   - Teapot (Main Body): 10 records through all stages');
  console.log('   - Teapot (Lid): 2 records (Throwing, Trimming)');
  console.log('   - Cup (Main Body): 2 records (Throwing, Decoration)');
  console.log('');
  console.log('🎨 Decoration Tasks Created:');
  console.log('   - Carving Pattern: 0/100 pending');
  console.log('   - Handle Installation: 0/100 pending');
  console.log('   - Color Decoration: 0/100 pending');
  console.log('');
  console.log('🚨 Discrepancy Alerts Created:');
  console.log('   - TRIMMING: 48 vs 50 (MEDIUM)');
  console.log('   - Firing: 47 vs 48 (MEDIUM)');
  console.log('   - QC Good: 45 vs 50 (HIGH)');
  console.log('');
  console.log('📝 Logbook Entries Created:');
  console.log('   - TRIMMING issue: Resolved');
  console.log('   - Firing issue: Issues');
  console.log('   - QC issue: Resolved');
  console.log('   - Decoration issue: Issues');
  console.log('');
  console.log('📋 Revision Tickets Created:');
  console.log('   - Lid design change: Draft');
  console.log('   - Clay type change: Draft');
  console.log('');
  console.log('📊 Activity Logs Created:');
  console.log('   - 4 activity logs recorded');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('🔐 Test Credentials:');
  console.log('   Manager: manager / password123');
  console.log('   Admin: admin / password123');
  console.log('');
  console.log('📊 Database Statistics:');
  console.log('   - Users: 7 (1 manager, 1 admin, 19 workers)');
  console.log('   - Ovens: 7');
  console.log('   - Defect Reasons: 8');
  console.log('   - Stage Categories: 6');
  console.log('   - Production Stage Configs: 11');
  console.log('   - Product Parts: 6');
  console.log('   - POLs: 5');
  console.log('   - POL Details: 5');
  console.log('   - Production Records: 14');
  console.log('   - Decoration Tasks: 3');
  console.log('   - Discrepancy Alerts: 3');
  console.log('   - Logbook Entries: 4');
  console.log('   - Revision Tickets: 2');
  console.log('   - Activity Logs: 4');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
