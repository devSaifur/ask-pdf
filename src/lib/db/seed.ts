import { db } from '.'
import { files, users } from './schema'
import { faker } from '@faker-js/faker'

async function runSeed() {
  console.log('⏳ Running seed...')

  const start = Date.now()

  await seedUsers()

  //   await seedFiles()

  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

async function seedUsers() {
  for (let i = 0; i < 10; i++) {
    await db.insert(users).values({
      name: faker.person.fullName(),
      email: faker.internet.email(),
    })
  }
}

async function seedFiles() {
  for (let i = 0; i < 10; i++) {
    await db.insert(files).values({
      name: faker.system.fileName(),
      createdById: 'ofj9ftiiu2fh818xco8fl3mx', // this needs to be a user id in database
      url: faker.internet.url(),
      key: faker.system.fileName(),
    })
  }
}

runSeed().catch((err) => {
  console.error('❌ Seed failed')
  console.error(err)
  process.exit(1)
})
