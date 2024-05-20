import { db } from '.'
import { users } from './schema'

async function runSeed() {
  console.log('⏳ Running seed...')

  const start = Date.now()

  await seedUsers()

  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

async function seedUsers() {
  await db.insert(users).values({
    id: 'ofj9ftiiu2fh818xco8fl3mx',
    name: 'Frank Auer',
    email: 'Kristofer.Swift@yahoo.com',
  })
}

runSeed().catch((err) => {
  console.error('❌ Seed failed')
  console.error(err)
  process.exit(1)
})
