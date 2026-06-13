import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

async function main() {
  console.log('Seeding Shiv Furniture Works ERP database...');

  await prisma.auditLog.deleteMany();
  await prisma.stockLedger.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.manufacturingOrder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.boMOperation.deleteMany();
  await prisma.boMComponent.deleteMany();
  await prisma.boM.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { name: 'Admin User', email: 'admin@shiv.com', role: 'ADMIN' },
    { name: 'Sales User', email: 'sales@shiv.com', role: 'SALES' },
    { name: 'Purchase User', email: 'purchase@shiv.com', role: 'PURCHASE' },
    { name: 'Manufacturing User', email: 'manufacturing@shiv.com', role: 'MANUFACTURING' },
    { name: 'Inventory Manager', email: 'inventory@shiv.com', role: 'INVENTORY_MANAGER' },
    { name: 'Owner', email: 'owner@shiv.com', role: 'OWNER' },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: { ...u, password: hashedPassword },
    });
  }

  console.log('Created 6 users');
  console.log('\n=== Demo Login Credentials (password: password123) ===');
  for (const u of users) {
    console.log(`  ${u.email} / ${u.role}`);
  }
  console.log('');

  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Timber Supplies Co.',
      email: 'contact@timbersupplies.com',
      phone: '+91-9876543210',
      address: '12 Industrial Area, Mumbai',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Hardware Mart',
      email: 'sales@hardwaremart.com',
      phone: '+91-9876543211',
      address: '45 Market Road, Pune',
    },
  });

  console.log('Created 2 vendors');

  await prisma.customer.createMany({
    data: [
      {
        name: 'Rajesh Interiors',
        email: 'rajesh@interiors.com',
        phone: '+91-9123456780',
        address: '78 MG Road, Bangalore',
      },
      {
        name: 'Modern Office Solutions',
        email: 'info@modernoffice.com',
        phone: '+91-9123456781',
        address: '23 Business Park, Delhi',
      },
    ],
  });

  console.log('Created 2 customers');

  const woodenLeg = await prisma.product.create({
    data: {
      name: 'Wooden Leg',
      sku: 'WL-001',
      type: 'RAW_MATERIAL',
      salesPrice: 150,
      costPrice: 80,
      onHandQty: 200,
      procureOnDemand: true,
      procurementType: 'PURCHASE',
      defaultVendorId: vendor1.id,
    },
  });

  const woodenTop = await prisma.product.create({
    data: {
      name: 'Wooden Top',
      sku: 'WT-001',
      type: 'RAW_MATERIAL',
      salesPrice: 500,
      costPrice: 300,
      onHandQty: 50,
    },
  });

  const screws = await prisma.product.create({
    data: {
      name: 'Screws',
      sku: 'SCR-001',
      type: 'RAW_MATERIAL',
      salesPrice: 5,
      costPrice: 2,
      onHandQty: 1000,
      defaultVendorId: vendor2.id,
      procurementType: 'PURCHASE',
    },
  });

  const woodenTable = await prisma.product.create({
    data: {
      name: 'Wooden Table',
      sku: 'WTBL-001',
      type: 'FINISHED_GOOD',
      salesPrice: 5000,
      costPrice: 2500,
      onHandQty: 2,
      procurementStrategy: 'MTO',
      procureOnDemand: true,
      procurementType: 'MANUFACTURING',
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Wooden Chair',
        sku: 'WCHR-001',
        type: 'FINISHED_GOOD',
        salesPrice: 2500,
        costPrice: 1200,
        onHandQty: 100,
        procurementStrategy: 'MTS',
      },
      {
        name: 'Office Chair',
        sku: 'OCHR-001',
        type: 'FINISHED_GOOD',
        salesPrice: 4500,
        costPrice: 2200,
        onHandQty: 20,
        procurementStrategy: 'MTS',
      },
    ],
  });

  console.log('Created 6 products');

  const bom = await prisma.boM.create({
    data: {
      finishedProductId: woodenTable.id,
      components: {
        create: [
          { componentProductId: woodenLeg.id, quantityRequired: 4 },
          { componentProductId: woodenTop.id, quantityRequired: 1 },
          { componentProductId: screws.id, quantityRequired: 12 },
        ],
      },
      operations: {
        create: [
          { operationName: 'Assembly', durationMinutes: 60, workCenter: 'Assembly Line' },
          { operationName: 'Painting', durationMinutes: 30, workCenter: 'Paint Floor' },
          { operationName: 'Packing', durationMinutes: 20, workCenter: 'Packaging Unit' },
        ],
      },
    },
  });

  console.log(`Created BoM for Wooden Table (id: ${bom.id})`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
