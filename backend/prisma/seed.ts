import { PrismaClient, ComponentCategory, RuleType, ValueType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed script...');

  // 1. Clear Existing Data
  console.log('🧹 Clearing old records...');
  await prisma.pricingRule.deleteMany({});
  await prisma.configurationPart.deleteMany({});
  await prisma.cycleConfiguration.deleteMany({});
  await prisma.priceHistory.deleteMany({});
  await prisma.part.deleteMany({});
  await prisma.component.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  console.log('👤 Creating initial users...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@herocycle.com',
      name: 'Admin Compiler',
      password: 'password123', // In production, this would be hashed
      role: 'admin',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'aditya@herocycle.com',
      name: 'Aditya Trader',
      password: 'password123',
      role: 'user',
    },
  });

  // 3. Create Pricing Rules (for the engine compiler)
  console.log('🧮 Seeding business pricing rules...');
  await prisma.pricingRule.createMany({
    data: [
      {
        name: 'Monsoon Seasonal Discount',
        description: 'Special seasonal price deduction for Mountain Bikes during heavy rainfall seasons.',
        ruleType: RuleType.DISCOUNT,
        valueType: ValueType.PERCENTAGE,
        value: 12.0,
        conditions: { minQuantity: 2, cycleType: 'Mountain' },
        priority: 10,
        isActive: true,
      },
      {
        name: 'Lightweight Alloy Frame Markup',
        description: 'Standard adjustment for customized lightweight alloy structural parts.',
        ruleType: RuleType.MARKUP,
        valueType: ValueType.FIXED,
        value: 45.0,
        conditions: { frameMaterial: 'Alloy' },
        priority: 5,
        isActive: true,
      },
      {
        name: 'Export Logistical Compliance Surcharge',
        description: 'Cross-border logistical compliance and standard transport duties.',
        ruleType: RuleType.TAX,
        valueType: ValueType.PERCENTAGE,
        value: 8.5,
        conditions: { shippingZone: 'International' },
        priority: 2,
        isActive: true,
      },
    ],
  });

  // 4. Create Components
  console.log('⚙️ Seeding components...');
  const compFrame = await prisma.component.create({
    data: {
      name: 'Cycle Frame Structure',
      slug: 'cycle-frame-structure',
      description: 'The central structural skeletal system of the cycle.',
      category: ComponentCategory.FRAME,
    },
  });

  const compBrakes = await prisma.component.create({
    data: {
      name: 'Brake Safety System',
      slug: 'brake-safety-system',
      description: 'Hydraulic and mechanical calipers controlling bike speed.',
      category: ComponentCategory.BRAKE_SYSTEM,
    },
  });

  const compGears = await prisma.component.create({
    data: {
      name: 'Gear Transmission Drivetrain',
      slug: 'gear-transmission-drivetrain',
      description: 'Cassettes, derailleurs, and shifters for mechanical torque.',
      category: ComponentCategory.GEAR_SYSTEM,
    },
  });

  const compWheels = await prisma.component.create({
    data: {
      name: 'Aero Wheelset and Rims',
      slug: 'aero-wheelset-and-rims',
      description: 'Rims, hubs, and spokes configured for speed and support.',
      category: ComponentCategory.WHEELSET,
    },
  });

  // 5. Create Parts and their Price History logs
  console.log('🔩 Seeding cycle parts & historical prices...');
  
  // -- Frames --
  const partAlloyFrame = await prisma.part.create({
    data: {
      name: 'Cruiser Alloy Frame AF-10',
      slug: 'cruiser-alloy-frame-af-10',
      componentId: compFrame.id,
      basePrice: 180.00,
      compatibility: { allowedSizes: ['M', 'L'], material: 'Alloy' },
    },
  });

  const partCarbonFrame = await prisma.part.create({
    data: {
      name: 'Racing Carbon Fiber Frame CF-90',
      slug: 'racing-carbon-fiber-frame-cf-90',
      componentId: compFrame.id,
      basePrice: 420.00,
      compatibility: { allowedSizes: ['S', 'M', 'L'], material: 'Carbon' },
    },
  });

  // -- Brakes --
  const partHydraulicBrakes = await prisma.part.create({
    data: {
      name: 'Shimano Hydraulic Disc Brakes BR-M6100',
      slug: 'shimano-hydraulic-disc-brakes-br-m6100',
      componentId: compBrakes.id,
      basePrice: 95.00,
      compatibility: { discBrakeCompatibleOnly: true },
    },
  });

  const partRimBrakes = await prisma.part.create({
    data: {
      name: 'Promax Rim Caliper Brakes RC-48',
      slug: 'promax-rim-caliper-brakes-rc-48',
      componentId: compBrakes.id,
      basePrice: 35.00,
      compatibility: { standardForkOnly: true },
    },
  });

  // -- Gears --
  const partSramGears = await prisma.part.create({
    data: {
      name: 'SRAM Eagle 12-Speed Drivetrain',
      slug: 'sram-eagle-12-speed-drivetrain',
      componentId: compGears.id,
      basePrice: 210.00,
      compatibility: { dynamicDrivetrainRequired: true },
    },
  });

  // -- Wheelsets --
  const partAlloyWheels = await prisma.part.create({
    data: {
      name: 'Double-Wall Alloy Cruiser Rims 26"',
      slug: 'double-wall-alloy-cruiser-rims-26',
      componentId: compWheels.id,
      basePrice: 80.00,
      compatibility: { tireWidthMax: '2.4 inches' },
    },
  });

  // Create Historical Prices (showing escalation logs over the last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  console.log('📈 Constructing historical pricing records...');
  // Carbon Frame pricing trend
  await prisma.priceHistory.createMany({
    data: [
      {
        partId: partCarbonFrame.id,
        price: 380.00,
        validFrom: sixMonthsAgo,
        validUntil: threeMonthsAgo,
      },
      {
        partId: partCarbonFrame.id,
        price: 400.00,
        validFrom: threeMonthsAgo,
        validUntil: new Date(),
      },
      {
        partId: partCarbonFrame.id,
        price: 420.00,
        validFrom: new Date(),
        validUntil: null,
      },
    ],
  });

  // Hydraulic Brakes pricing trend
  await prisma.priceHistory.createMany({
    data: [
      {
        partId: partHydraulicBrakes.id,
        price: 85.00,
        validFrom: sixMonthsAgo,
        validUntil: threeMonthsAgo,
      },
      {
        partId: partHydraulicBrakes.id,
        price: 90.00,
        validFrom: threeMonthsAgo,
        validUntil: new Date(),
      },
      {
        partId: partHydraulicBrakes.id,
        price: 95.00,
        validFrom: new Date(),
        validUntil: null,
      },
    ],
  });

  // SRAM gears pricing trend
  await prisma.priceHistory.createMany({
    data: [
      {
        partId: partSramGears.id,
        price: 195.00,
        validFrom: sixMonthsAgo,
        validUntil: new Date(),
      },
      {
        partId: partSramGears.id,
        price: 210.00,
        validFrom: new Date(),
        validUntil: null,
      },
    ],
  });

  // 6. Create Cycle Configurations
  console.log('🚲 Customizing initial cycle build configurations...');
  const mountainRigConfig = await prisma.cycleConfiguration.create({
    data: {
      name: 'Aditya Premium Mountain Rig',
      userId: normalUser.id,
      totalPrice: 725.00, // Total matches the transaction locked part rates below
    },
  });

  // Hook up config parts
  await prisma.configurationPart.createMany({
    data: [
      {
        configurationId: mountainRigConfig.id,
        partId: partCarbonFrame.id,
        quantity: 1,
        priceAtConfiguration: 420.00, // Locked in purchase price
      },
      {
        configurationId: mountainRigConfig.id,
        partId: partHydraulicBrakes.id,
        quantity: 1,
        priceAtConfiguration: 95.00,
      },
      {
        configurationId: mountainRigConfig.id,
        partId: partSramGears.id,
        quantity: 1,
        priceAtConfiguration: 210.00,
      },
    ],
  });

  console.log('✨ Seed database operations completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error details:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
