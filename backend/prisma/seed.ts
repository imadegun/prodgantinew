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
  await prisma.polDetail.deleteMany();
  await prisma.pol.deleteMany();
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
  
  const pol1 = await prisma.pol.create({
    data: {
      po_number: 'PO-2026-001',
      client_name: 'ABC Corporation',
      total_order: 0,
      po_date: new Date('2026-01-15'),
      delivery_date: new Date('2026-02-15'),
      status: 'IN_PROGRESS',
      notes: 'First order of the year',
      created_by: manager.id,
    },
  });

  const pol2 = await prisma.pol.create({
    data: {
      po_number: 'PO-2026-002',
      client_name: 'XYZ Limited',
      total_order: 0,
      po_date: new Date('2026-01-20'),
      delivery_date: new Date('2026-02-20'),
      status: 'IN_PROGRESS',
      notes: 'Regular customer order',
      created_by: manager.id,
    },
  });

  const pol3 = await prisma.pol.create({
    data: {
      po_number: 'PO-2026-003',
      client_name: '123 Industries',
      total_order: 0,
      po_date: new Date('2026-01-25'),
      delivery_date: new Date('2026-03-01'),
      status: 'DRAFT',
      notes: 'Large order pending approval',
      created_by: manager.id,
    },
  });

  const pol4 = await prisma.pol.create({
    data: {
      po_number: 'PO-2026-004',
      client_name: 'Sample Inc',
      total_order: 0,
      po_date: new Date('2026-02-01'),
      delivery_date: new Date('2026-02-25'),
      status: 'COMPLETED',
      notes: 'Sample order for testing',
      created_by: manager.id,
    },
  });

  const pol5 = await prisma.pol.create({
    data: {
      po_number: 'PO-2026-005',
      client_name: 'Test Client',
      total_order: 0,
      po_date: new Date('2026-02-10'),
      delivery_date: new Date('2026-03-10'),
      status: 'CANCELLED',
      notes: 'Cancelled due to customer request',
      created_by: manager.id,
    },
  });

  // Update total_order for POLs
  await prisma.pol.update({
    where: { id: pol1.id },
    data: { total_order: 150 },
  });

  await prisma.pol.update({
    where: { id: pol2.id },
    data: { total_order: 250 },
  });

  await prisma.pol.update({
    where: { id: pol3.id },
    data: { total_order: 75 },
    });

  console.log('✅ POLs created (5 POLs)');

  // Create POL Details
  console.log('📦 Creating POL Details...');
  
  // POL 1 - Teapot
  const detail1 = await prisma.polDetail.create({
    data: {
      pol_id: pol1.id,
      product_code: 'TP-MAIN',
      product_name: 'Teapot (Main Body)',
      quantity: 50,
      extra_buffer: 15,
      product_type: 'PLAIN',
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      final_size: '500ml',
      notes: 'Main body for teapot',
    },
  });

  const detail2 = await prisma.polDetail.create({
    data: {
      pol_id: pol1.id,
      product_code: 'TP-LID',
      product_name: 'Teapot (Lid)',
      quantity: 50,
      extra_buffer: 15,
      product_type: 'PLAIN',
      color: 'Blue',
      texture: 'Smooth',
      material: 'Stoneware',
      size: '500ml',
      final_size: '500ml',
      notes: 'Lid for teapot',
    },
  });

  // POL 2 - Cups
  const detail3 = await prisma.polDetail.create({
    data: {
      pol_id: pol2.id,
      product_code: 'CP-MAIN',
      product_name: 'Cup (Main Body)',
      quantity: 100,
      extra_buffer: 20,
      product_type: 'DECOR',
      color: 'White',
      texture: 'Smooth',
      material: 'Porcelain',
      size: '250ml',
      final_size: '250ml',
      notes: 'Cups with decoration',
    },
  });

  // POL 3 - Bowls
  const detail4 = await prisma.polDetail.create({
    data: {
      pol_id: pol3.id,
      product_code: 'BWL-MAIN',
      product_name: 'Bowl (Main)',
      quantity: 75,
      extra_buffer: 10,
      product_type: 'HAND_BUILT',
      color: 'Red',
      texture: 'Textured',
      material: 'Earthenware',
      size: '12inch',
      final_size: '12inch',
      notes: 'Hand-built bowls',
    },
  });

  const detail5 = await prisma.polDetail.create({
    data: {
      pol_id: pol4.id,
      product_code: 'PLT-MAIN',
      product_name: 'Plate (Main)',
      quantity: 50,
      extra_buffer: 15,
      product_type: 'SLAB_TRAY',
      color: 'Green',
      texture: 'Textured',
      material: 'Stoneware',
      size: '10inch',
      final_size: '10inch',
      notes: 'Slab-built plates',
    },
  });

  console.log('✅ POL Details created (5 details)');

  // Create Production Records
  console.log('🏭 Creating Production Records...');
  
  // Forming stage for Teapot Main Body
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'THROWING',
      quantity: 50,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Initial throwing completed',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'TRIMMING',
      quantity: 48,
      reject_quantity: 2,
      remake_cycle: 0,
      notes: '2 pieces cracked during trimming',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'DRYING',
      quantity: 48,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Drying completed',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'LOAD_BISQUE',
      quantity: 48,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Loaded into bisque kiln',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'OUT_BISQUE',
      quantity: 48,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Out of bisque kiln',
      created_by: admin.id,
    },
  });

  // Firing stage
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'LOAD_HIGH_FIRING',
      quantity: 48,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Loaded into high fire kiln',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      quantity: 47,
      reject_quantity: 1,
      remake_cycle: 0,
      notes: '1 piece cracked during firing',
      created_by: admin.id,
    },
  });

  // Glazing stage
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'SANDING',
      quantity: 46,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Sanding completed',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'DIPPING',
      quantity: 46,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Blue glaze dip completed',
      created_by: admin.id,
    },
  });

  // QC stage
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail1.id,
      stage: 'QC_GOOD',
      quantity: 45,
      reject_quantity: 1,
      remake_cycle: 0,
      notes: '1 piece rejected - crack in rim',
      created_by: admin.id,
    },
  });

  // Forming stage for Teapot Lid
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail2.id,
      stage: 'THROWING',
      quantity: 50,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Lid throwing completed',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail2.id,
      stage: 'TRIMMING',
      quantity: 50,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Lid trimming completed',
      created_by: admin.id,
    },
  });

  // Forming stage for Cups
  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail3.id,
      stage: 'THROWING',
      quantity: 100,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Cup throwing completed',
      created_by: admin.id,
    },
  });

  await prisma.productionRecord.create({
    data: {
      pol_detail_id: detail3.id,
      stage: 'DECORATION',
      quantity: 100,
      reject_quantity: 0,
      remake_cycle: 0,
      notes: 'Decoration in progress',
      created_by: admin.id,
    },
  });

  console.log('✅ Production Records created (10 records)');

  // Create Decoration Tasks for Cups
  console.log('🎨 Creating Decoration Tasks...');
  
  await prisma.decorationTask.create({
    data: {
      pol_detail_id: detail3.id,
      task_name: 'Carving Pattern',
      task_description: 'Carve floral pattern on cup body',
      quantity_required: 100,
      quantity_completed: 50,
      quantity_rejected: 0,
      status: 'IN_PROGRESS',
      notes: 'Carving in progress',
      created_by: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      pol_detail_id: detail3.id,
      task_name: 'Handle Installation',
      task_description: 'Attach handles to cup body',
      quantity_required: 100,
      quantity_completed: 0,
      quantity_rejected: 0,
      status: 'PENDING',
      notes: 'Waiting for carving to complete',
      created_by: admin.id,
    },
  });

  await prisma.decorationTask.create({
    data: {
      pol_detail_id: detail3.id,
      task_name: 'Color Decoration',
      task_description: 'Apply color decoration to cups',
      quantity_required: 100,
      quantity_completed: 0,
      quantity_rejected: 0,
      status: 'PENDING',
      notes: 'Waiting for carving to complete',
      created_by: admin.id,
    },
  });

  console.log('✅ Decoration Tasks created (3 tasks)');

  // Create Discrepancy Alerts
  console.log('🚨 Creating Discrepancy Alerts...');
  
  const alert1 = await prisma.discrepancyAlert.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'TRIMMING',
      expected_quantity: 50,
      actual_quantity: 48,
      difference: -2,
      alert_type: 'QUANTITY_DISCREPANCY',
      alert_message: 'Trimming quantity (48) is less than previous stage (50)',
      priority: 'WARNING',
      status: 'OPEN',
      reported_by: admin.id,
    },
  });

  const alert2 = await prisma.discrepancyAlert.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      expected_quantity: 48,
      actual_quantity: 47,
      difference: -1,
      alert_type: 'QUANTITY_DISCREPANCY',
      alert_message: 'Firing quantity (47) is less than previous stage (48)',
      priority: 'WARNING',
      status: 'OPEN',
      reported_by: admin.id,
    },
  });

  const alert3 = await prisma.discrepancyAlert.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'QC_GOOD',
      expected_quantity: 50,
      actual_quantity: 45,
      difference: -5,
      alert_type: 'QUANTITY_DISCREPANCY',
      alert_message: 'QC Good quantity (45) is less than order quantity (50). Remake required.',
      priority: 'CRITICAL',
      status: 'OPEN',
      reported_by: admin.id,
    },
  });

  console.log('✅ Discrepancy Alerts created (3 alerts)');

  // Create Logbook Entries
  console.log('📝 Creating Logbook Entries...');
  
  await prisma.logbookEntry.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'TRIMMING',
      issue_type: 'PROCESS_ISSUE',
      description: '2 pieces cracked during trimming',
      severity: 'MEDIUM',
      resolution: 'Adjusted drying time and humidity control',
      status: 'RESOLVED',
      created_by: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'OUT_HIGH_FIRING',
      issue_type: 'QUALITY_ISSUE',
      description: '1 piece cracked in rim during firing',
      severity: 'HIGH',
      resolution: 'Adjust firing temperature profile',
      status: 'OPEN',
      created_by: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      stage: 'QC_GOOD',
      issue_type: 'QUALITY_ISSUE',
      description: '1 piece rejected - crack in rim',
      severity: 'MEDIUM',
      resolution: 'Remake as QC Good',
      status: 'RESOLVED',
      created_by: admin.id,
    },
  });

  await prisma.logbookEntry.create({
    data: {
      pol_id: pol2.id,
      pol_detail_id: detail3.id,
      stage: 'DECORATION',
      issue_type: 'PROCESS_ISSUE',
      description: 'Decoration taking longer than expected',
      severity: 'LOW',
      resolution: 'Monitor progress and adjust timeline',
      status: 'IN_PROGRESS',
      created_by: admin.id,
    },
  });

  console.log('✅ Logbook Entries created (4 entries)');

  // Create Revision Tickets
  console.log('📋 Creating Revision Tickets...');
  
  const revision1 = await prisma.revisionTicket.create({
    data: {
      pol_id: pol1.id,
      pol_detail_id: detail1.id,
      ticket_number: 'REV-2026-001',
      revision_type: 'DESIGN_CHANGE',
      issue_type: 'DESIGN',
      severity: 'MEDIUM',
      description: 'Customer requested lid design change from flat to domed shape for better heat retention',
      reason: 'Customer requested premium version with improved heat retention during product review meeting',
      impact_assessment: 'Mold modification required: 2 days, Production delay: 3 days',
      status: 'DRAFT',
      created_by: manager.id,
    },
  });

  const revision2 = await prisma.revisionTicket.create({
    data: {
      pol_id: pol3.id,
      pol_detail_id: detail4.id,
      ticket_number: 'REV-2026-002',
      revision_type: 'MATERIAL_CHANGE',
      issue_type: 'MATERIAL',
      severity: 'HIGH',
      description: 'Clay type needs to be changed from Stoneware to Porcelain for better durability',
      reason: 'Current Stoneware clay causing cracking issues in hand-built bowls',
      impact_assessment: 'Material change will improve durability by 40%',
      status: 'DRAFT',
      created_by: manager.id,
    },
  });

  console.log('✅ Revision Tickets created (2 tickets)');

  // Create Activity Logs
  console.log('📊 Creating Activity Logs...');
  await prisma.activityLog.create({
    data: {
      user_id: manager.id,
      action: 'CREATE_POL',
      entity_type: 'POL',
      entity_id: pol1.id,
      details: 'Created PO-2026-001 for ABC Corporation',
    },
  });

  await prisma.activityLog.create({
    data: {
      user_id: manager.id,
      action: 'ADD_POL_DETAIL',
      entity_type: 'POL_DETAIL',
      entity_id: detail1.id,
      details: 'Added Teapot (Main Body) to PO-2026-001',
    },
  });

  await prisma.activityLog.create({
    data: {
      user_id: admin.id,
      action: 'TRACK_PRODUCTION',
      entity_type: 'PRODUCTION_RECORD',
      entity_id: 'production_record_id_placeholder',
      details: 'Tracked THROWING stage for Teapot (Main Body)',
    },
  });

  await prisma.activityLog.create({
      data: {
      user_id: admin.id,
      action: 'CREATE_DISCREPANCY_ALERT',
      entity_type: 'DISCREPANCY_ALERT',
      entity_id: alert1.id,
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
  console.log('   - PO-2026-001: ABC Corporation (IN_PROGRESS) - 100 items');
  console.log('   - PO-2026-002: XYZ Limited (IN_PROGRESS) - 250 items');
  console.log('   - PO-2026-003: 123 Industries (DRAFT) - 75 items');
  console.log('   - PO-2026-004: Sample Inc (COMPLETED) - 50 items');
  console.log('   - PO-2026-005: Test Client (CANCELLED) - 0 items');
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
