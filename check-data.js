const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const airCount = await prisma.airRate.count();
  const fclCount = await prisma.seaFclRate.count();
  const lclCount = await prisma.seaLclRate.count();
  
  console.log('=== Database Record Counts ===');
  console.log('AirRate:', airCount);
  console.log('SeaFclRate:', fclCount);
  console.log('SeaLclRate:', lclCount);
  console.log('Total:', airCount + fclCount + lclCount);
  
  if (airCount > 0) {
    const sample = await prisma.airRate.findFirst({
      select: { origin: true, destination: true, carrier: true }
    });
    console.log('\nSample AirRate:', sample);
  }
  
  if (fclCount > 0) {
    const sample = await prisma.seaFclRate.findFirst({
      select: { origin: true, destination: true, carrier: true }
    });
    console.log('Sample SeaFclRate:', sample);
  }
  
  // Check all distinct origins and destinations
  console.log('\n=== All Distinct Locations ===');
  
  const airOrigins = await prisma.airRate.findMany({
    distinct: ['origin'],
    select: { origin: true },
    take: 20
  });
  console.log('\nAir Origins (first 20):', airOrigins.map(x => x.origin));
  
  const fclOrigins = await prisma.seaFclRate.findMany({
    distinct: ['origin'],
    select: { origin: true },
    take: 20
  });
  console.log('\nFCL Origins (first 20):', fclOrigins.map(x => x.origin));
  
  const fclDests = await prisma.seaFclRate.findMany({
    distinct: ['destination'],
    select: { destination: true },
    take: 20
  });
  console.log('\nFCL Destinations (first 20):', fclDests.map(x => x.destination));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
