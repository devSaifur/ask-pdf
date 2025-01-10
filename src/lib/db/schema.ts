import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { AdapterAccountType } from 'next-auth/adapters'

import { generateId } from '~/lib/id'

export const users = sqliteTable('user', {
  id: text()
    .primaryKey()
    .$default(() => generateId()),
  name: text({ length: 100 }),
  email: text({ length: 100 }).notNull(),
  emailVerified: text(),
  image: text(),

  stripeCustomerId: text({ length: 255 }).unique(),
  stripeSubscriptionId: text({
    length: 255,
  }).unique(),
  stripePriceId: text({ length: 255 }).unique(),
  stripeCurrentPeriodEnd: integer({
    mode: 'timestamp_ms',
  }),
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const sessions = sqliteTable('session', {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer({ mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: integer({ mode: 'timestamp_ms' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
)

export const authenticators = sqliteTable(
  'authenticator',
  {
    credentialID: text().notNull().unique(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text().notNull(),
    credentialPublicKey: text().notNull(),
    counter: integer().notNull(),
    credentialDeviceType: text().notNull(),
    credentialBackedUp: integer({
      mode: 'boolean',
    }).notNull(),
    transports: text(),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
)

export const usersRelation = relations(users, ({ many }) => ({
  files: many(files),
  messages: many(messages),
}))

export const files = sqliteTable('file', {
  id: text({ length: 50 })
    .primaryKey()
    .$default(() => generateId()),
  name: text({ length: 256 }).notNull(),
  url: text({ length: 256 }).notNull(),
  key: text({ length: 256 }).notNull(),
  createdById: text()
    .notNull()
    .references(() => users.id),
  createdAt: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  uploadStatus: text({
    enum: ['pending', 'processing', 'success', 'failed'],
  })
    .default('pending')
    .notNull(),
})

export type TFile = typeof files.$inferSelect
export type TFileInsert = typeof files.$inferInsert

export const filesRelation = relations(files, ({ one, many }) => ({
  user: one(users, { fields: [files.createdById], references: [users.id] }),
  messages: many(messages),
}))

export const messages = sqliteTable('message', {
  id: text('id')
    .primaryKey()
    .$default(() => generateId()),
  text: text().notNull(),
  isUserMessage: integer({ mode: 'boolean' }).notNull(),
  userId: text()
    .notNull()
    .references(() => users.id),
  fileId: text({ length: 50 }).references(() => files.id, {
    onDelete: 'cascade',
  }),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})

export type TMessageInsert = typeof messages.$inferInsert

export const messagesRelation = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  file: one(files, { fields: [messages.fileId], references: [files.id] }),
}))
