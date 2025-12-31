// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  try {
    // First, check if we can connect to database
    console.log('Checking database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected')
    
    // Clear existing users first (skip other tables for now)
    console.log('Clearing existing users...')
    await prisma.user.deleteMany()
    console.log('✅ Users cleared')
    
    // Create users
    console.log('Creating users...')
    
    const users = await prisma.user.createMany({
      data: [
        {
          email: 'principal@school.lk',
          password: 'principal123',
          name: 'Principal Silva',
          role: 'principal',
          phone: '+94 71 224 5670'
        },
        {
          email: 'admin@school.lk',
          password: 'admin123',
          name: 'System Administrator',
          role: 'admin'
        },
        {
          email: 'teacher1@school.lk',
          password: 'teacher123',
          name: 'Mr. Perera',
          role: 'teacher'
        },
        {
          email: 'teacher2@school.lk',
          password: 'teacher123',
          name: 'Mrs. Fernando',
          role: 'teacher'
        },
        {
          email: 'labassist1@school.lk',
          password: 'labassist123',
          name: 'Lab Assistant Kumar',
          role: 'lab-assistant'
        },
        {
          email: 'student1@school.lk',
          password: 'student123',
          name: 'Student Amal',
          role: 'student'
        }
      ]
    })

    console.log(`✅ Created ${users.count} users`)
    console.log('🌱 Seed completed successfully!')
    
  } catch (error: any) {
    console.error('❌ Seed error:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'P2021') {
      console.log('⚠️  Table does not exist! Run these commands:')
      console.log('1. npx prisma db push')
      console.log('2. npx tsx prisma/seed.ts')
    } else if (error.code === 'P1001') {
      console.log('⚠️  Cannot connect to database. Make sure PostgreSQL is running:')
      console.log('   net start postgresql')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()