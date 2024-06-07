import { createId } from '@paralleldrive/cuid2'
import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { AdapterAccountType } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name', { length: 100 }),
  email: text('email', { length: 100 }).notNull(),
  emailVerified: text('emailVerified'),
  image: text('image'),

  stripeCustomerId: text('stripe_customer_id', { length: 255 }).unique(),
  stripeSubscriptionId: text('stripe_subscription_id', {
    length: 255,
  }).unique(),
  stripePriceId: text('stripe_price_id', { length: 255 }).unique(),
  stripeCurrentPeriodEnd: integer('stripe_current_period_end', {
    mode: 'timestamp_ms',
  }),
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
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
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: integer('credentialBackedUp', {
      mode: 'boolean',
    }).notNull(),
    transports: text('transports'),
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
  id: text('id', { length: 50 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name', { length: 256 }).notNull(),
  url: text('url', { length: 256 }).notNull(),
  key: text('key', { length: 256 }).notNull(),
  createdById: text('createdById')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  uploadStatus: text('upload_status', {
    enum: ['pending', 'processing', 'success', 'failed'],
  }).default('pending'),
})

export type TFile = typeof files.$inferSelect
export type TFileInsert = typeof files.$inferInsert

export const filesRelation = relations(files, ({ one, many }) => ({
  user: one(users, { fields: [files.createdById], references: [users.id] }),
  messages: many(messages),
}))

export const messages = sqliteTable('message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  text: text('text').notNull(),
  isUserMessage: integer('isUserMessage', { mode: 'boolean' }).notNull(),
  userId: text('createdById')
    .notNull()
    .references(() => users.id),
  fileId: text('fileId', { length: 50 }).references(() => files.id, {
    onDelete: 'cascade',
  }),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export type TMessageInsert = typeof messages.$inferInsert

export const messagesRelation = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  file: one(files, { fields: [messages.fileId], references: [files.id] }),
}))
