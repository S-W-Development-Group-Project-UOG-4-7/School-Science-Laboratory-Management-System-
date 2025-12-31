// test-db.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing PostgreSQL connection...')
  
  try {
    // Use parameterized query to avoid backtick issues
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ PostgreSQL is accessible')
    console.log('Result:', result)
  } catch (error) {
    console.log('❌ ERROR:', error.message)
    console.log('Error code:', error.code)
    
    if (error.code === 'P1000' || error.code === 'P1001') {
      console.log('\n⚠️ DATABASE CONNECTION ISSUE!')
      console.log('Fix this before proceeding to APIs.')
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })