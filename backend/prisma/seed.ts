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
  await prisma.pOLDetail.deleteMany();
  await prisma.pOL.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data cleared');

  // Create users
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      email: 'manager@prodganti.com',
      passwordHash: hashedPassword,
      fullName: 'John Manager',
      role: 'MANAGER',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@prodganti.com',
      passwordHash: hashedPassword,
      fullName: 'Jane Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Users created (2 users)');

  // Create POLs
  console.log('📋 Creating POLs...');
  
  const pol1 = await prisma.pOL.create({
    data: {
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
      poNumber: 'PO-2026-003',
      clientName: '123 Industries',
      poDate: new Date('2026-01-25'),
      deliveryDate: new Date('2026-03-01'),
      status: 'DRAFT',
      notes: 'Large order pending approval',
      createdBy: manager.id,
    },
  });

  const pol4 = await prisma.pOL.create({
    data: {
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
      polId: pol1.id,
      productCode: 'TP-MAIN',
      productName: 'Teapot (Main Body)',
      quantity: 50,
      extraBuffer: 15,
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
      polId: pol1.id,
      productCode: 'TP-LID',
      productName: 'Teapot (Lid)',
      quantity: 50,
      extraBuffer: 15,
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
      polId: pol2.id,
      productCode: 'CP-MAIN',
      productName: 'Cup (Main Body)',
      quantity: 100,
      extraBuffer: 20,
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
      polId: pol3.id,
      productCode: 'BWL-MAIN',
      productName: 'Bowl (Main)',
      quantity: 75,
      extraBuffer: 10,
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
      polId: pol4.id,
      productCode: 'PLT-MAIN',
      productName: 'Plate (Main)',
      quantity: 50,
      extraBuffer: 15,
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

  // Create Production Records
  console.log('🏭 Creating Production Records...');
  
  // Forming stage for Teapot Main Body
  const productionRecord1 = await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'THROWING',
      quantity: 50,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Initial throwing completed',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'TRIMMING',
      quantity: 48,
      rejectQuantity: 2,
      remakeCycle: 0,
      notes: '2 pieces cracked during trimming',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'DRYING',
      quantity: 48,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Drying completed',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'LOAD_BISQUE',
      quantity: 48,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Loaded into bisque kiln',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'OUT_BISQUE',
      quantity: 48,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Out of bisque kiln',
      createdBy: admin.id,
    },
  });

  // Firing stage
  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'LOAD_HIGH_FIRING',
      quantity: 48,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Loaded into high fire kiln',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      quantity: 47,
      rejectQuantity: 1,
      remakeCycle: 0,
      notes: '1 piece cracked during firing',
      createdBy: admin.id,
    },
  });

  // Glazing stage
  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'SANDING',
      quantity: 46,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Sanding completed',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'DIPPING',
      quantity: 46,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Blue glaze dip completed',
      createdBy: admin.id,
    },
  });

  // QC stage
  await prisma.productionRecord.create({
    data: {
      polDetailId: detail1.id,
      stage: 'QC_GOOD',
      quantity: 45,
      rejectQuantity: 1,
      remakeCycle: 0,
      notes: '1 piece rejected - crack in rim',
      createdBy: admin.id,
    },
  });

  // Forming stage for Teapot Lid
  await prisma.productionRecord.create({
    data: {
      polDetailId: detail2.id,
      stage: 'THROWING',
      quantity: 50,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Lid throwing completed',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail2.id,
      stage: 'TRIMMING',
      quantity: 50,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Lid trimming completed',
      createdBy: admin.id,
    },
  });

  // Forming stage for Cups
  await prisma.productionRecord.create({
    data: {
      polDetailId: detail3.id,
      stage: 'THROWING',
      quantity: 100,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Cup throwing completed',
      createdBy: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      polDetailId: detail3.id,
      stage: 'DECORATION',
      quantity: 100,
      rejectQuantity: 0,
      remakeCycle: 0,
      notes: 'Decoration in progress',
      createdBy: admin.id,
    },
  });

  console.log('✅ Production Records created (10 records)');

  // Create Decoration Tasks for Cups
  console.log('🎨 Creating Decoration Tasks...');
  
  await prisma.decorationTask.create({
    data: {
      polDetailId: detail3.id,
      taskName: 'Carving Pattern',
      taskDescription: 'Carve floral pattern on cup body',
      quantityRequired: 100,
      quantityCompleted: 50,
      quantityRejected: 0,
      status: 'IN_PROGRESS',
      notes: 'Carving in progress',
      createdBy: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      polDetailId: detail3.id,
      taskName: 'Handle Installation',
      taskDescription: 'Attach handles to cup body',
      quantityRequired: 100,
      quantityCompleted: 0,
      quantityRejected: 0,
      status: 'PENDING',
      notes: 'Waiting for carving to complete',
      createdBy: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      polDetailId: detail3.id,
      taskName: 'Color Decoration',
      taskDescription: 'Apply color decoration to cups',
      quantityRequired: 100,
      quantityCompleted: 0,
      quantityRejected: 0,
      status: 'PENDING',
      notes: 'Waiting for carving to complete',
      createdBy: admin.id,
    },
  });

  console.log('✅ Decoration Tasks created (3 tasks)');

  // Create Discrepancy Alerts
  console.log('🚨 Creating Discrepancy Alerts...');
  
  const alert1 = await prisma.discrepancyAlert.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'TRIMMING',
      expectedQuantity: 50,
      actualQuantity: 48,
      difference: -2,
      alertType: 'QUANTITY_DISCREPANCY',
      alertMessage: 'Trimming quantity (48) is less than previous stage (50)',
      priority: 'WARNING',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  const alert2 = await prisma.discrepancyAlert.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      expectedQuantity: 48,
      actualQuantity: 47,
      difference: -1,
      alertType: 'QUANTITY_DISCREPANCY',
      alertMessage: 'Firing quantity (47) is less than previous stage (48)',
      priority: 'WARNING',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  const alert3 = await prisma.discrepancyAlert.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'QC_GOOD',
      expectedQuantity: 50,
      actualQuantity: 45,
      difference: -5,
      alertType: 'QUANTITY_DISCREPANCY',
      alertMessage: 'QC Good quantity (45) is less than order quantity (50). Remake required.',
      priority: 'CRITICAL',
      status: 'OPEN',
      reportedBy: admin.id,
    },
  });

  console.log('✅ Discrepancy Alerts created (3 alerts)');

  // Create Logbook Entries
  console.log('📝 Creating Logbook Entries...');
  
  await prisma.logbookEntry.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'TRIMMING',
      issueType: 'PROCESS_ISSUE',
      description: '2 pieces cracked during trimming',
      severity: 'MEDIUM',
      resolution: 'Adjusted drying time and humidity control',
      status: 'RESOLVED',
      createdBy: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      issueType: 'QUALITY_ISSUE',
      description: '1 piece cracked in rim during firing',
      severity: 'HIGH',
      resolution: 'Adjust firing temperature profile',
      status: 'OPEN',
      createdBy: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      stage: 'QC_GOOD',
      issueType: 'QUALITY_ISSUE',
      description: '1 piece rejected - crack in rim',
      severity: 'MEDIUM',
      resolution: 'Remake as QC Good',
      status: 'RESOLVED',
      createdBy: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      polId: pol2.id,
      polDetailId: detail3.id,
      stage: 'DECORATION',
      issueType: 'PROCESS_ISSUE',
      description: 'Decoration taking longer than expected',
      severity: 'LOW',
      resolution: 'Monitor progress and adjust timeline',
      status: 'IN_PROGRESS',
      createdBy: admin.id,
    },
  });

  console.log('✅ Logbook Entries created (4 entries)');

  // Create Revision Tickets
  console.log('📋 Creating Revision Tickets...');
  
  const revision1 = await prisma.revisionTicket.create({
    data: {
      polId: pol1.id,
      polDetailId: detail1.id,
      ticketNumber: 'REV-2026-001',
      revisionType: 'DESIGN_CHANGE',
      issueType: 'DESIGN',
      severity: 'MEDIUM',
      description: 'Customer requested lid design change from flat to domed shape for better heat retention',
      reason: 'Customer requested premium version with improved heat retention during product review meeting',
      impactAssessment: 'Mold modification required: 2 days, Production delay: 3 days',
      status: 'DRAFT',
      createdBy: manager.id,
    },
  });

  const revision2 = await prisma.revisionTicket.create({
    data: {
      polId: pol3.id,
      polDetailId: detail4.id,
      ticketNumber: 'REV-2026-002',
      revisionType: 'MATERIAL_CHANGE',
      issueType: 'MATERIAL',
      severity: 'HIGH',
      description: 'Clay type needs to be changed from Stoneware to Porcelain for better durability',
      reason: 'Current Stoneware clay causing cracking issues in hand-built bowls',
      impactAssessment: 'Material change will improve durability by 40%',
      status: 'DRAFT',
      createdBy: manager.id,
    },
  });

  console.log('✅ Revision Tickets created (2 tickets)');

  // Create Activity Logs
  console.log('📊 Creating Activity Logs...');
  await prisma.activityLog.create({
    data: {
      userId: manager.id,
      action: 'CREATE_POL',
      entityType: 'POL',
      entityId: pol1.id,
      details: 'Created PO-2026-001 for ABC Corporation',
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: manager.id,
      action: 'ADD_POL_DETAIL',
      entityType: 'POL_DETAIL',
      entityId: detail1.id,
      details: 'Added Teapot (Main Body) to PO-2026-001',
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: 'TRACK_PRODUCTION',
      entityType: 'PRODUCTION_RECORD',
      entityId: productionRecord1.id,
      details: 'Tracked THROWING stage for Teapot (Main Body)',
    },
  });

  await prisma.activityLog.create({
      data: {
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
  console.log('');
  console.log('📋 POLs Created:');
  console.log('   - PO-2026-001: ABC Corporation (IN_PROGRESS)');
  console.log('   - PO-2026-002: XYZ Limited (IN_PROGRESS)');
  console.log('   - PO-2026-003: 123 Industries (DRAFT)');
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
  console.log('🏭 Production Records Created:');
  console.log('   - Teapot (Main Body): 10 records through all stages');
  console.log('   - Teapot (Lid): 2 records (Throwing, Trimming)');
  console.log('   - Cup (Main Body): 2 records (Throwing, Decoration)');
  console.log('');
  console.log('🎨 Decoration Tasks Created:');
  console.log('   - Carving Pattern: 50/100 completed (IN_PROGRESS)');
  console.log('   - Handle Installation: 0/100 pending (PENDING)');
  console.log('   - Color Decoration: 0/100 pending (PENDING)');
  console.log('');
  console.log('🚨 Discrepancy Alerts Created:');
  console.log('   - TRIMMING: 48 vs 50 (WARNING)');
  console.log('   - Firing: 47 vs 48 (WARNING)');
  console.log('   - QC Good: 45 vs 50 (CRITICAL)');
  console.log('');
  console.log('📝 Logbook Entries Created:');
  console.log('   - TRIMMING issue: Resolved');
  console.log('   - Firing issue: Open');
  console.log('   - QC issue: Resolved');
  console.log('   - Decoration issue: In Progress');
  console.log('');
  console.log('📋 Revision Tickets Created:');
  console.log('   - Lid design change: Draft');
  console.log('   - Clay type change: Draft');
  console.log('');
  console.log('📊 Activity Logs Created:');
  console.log('   - 4 activity logs recorded');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seed completed successfully!');
  console.log('');
  console.log('🔐 Test Credentials:');
  console.log('   Manager: manager / password123');
  console.log('   Admin: admin / password123');
  console.log('');
  console.log('📊 Database Statistics:');
  console.log('   - Users: 2');
  console.log('   - POLs: 5');
  console.log('   - POL Details: 5');
  console.log('   - Production Records: 12');
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
