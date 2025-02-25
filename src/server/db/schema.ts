import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => name);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const failedJobs = createTable(
  "failed_job",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    jobId: varchar("job_id", { length: 255 }).notNull(),
    jobName: varchar("job_name", { length: 255 }).notNull(),
    s3Key: varchar("s3_key", { length: 255 }).notNull(),
    downloadApproved: boolean("download_approved").default(false),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (fj) => ({
    jobIdIdx: index("job_id_idx").on(fj.jobId),
  }),
);

export const approvals = createTable(
  "approval",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    jobId: bigint("job_id", { mode: "number" })
      .notNull()
      .references(() => failedJobs.id),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 })
      .notNull()
      .$type<"pending" | "approved" | "rejected">(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (approval) => ({
    jobIdIdx: index("approval_job_id_idx").on(approval.jobId),
    userEmailIdx: index("approval_user_email_idx").on(approval.userEmail),
  }),
);

// Add this relation to connect approvals with failedJobs
export const failedJobsRelations = relations(failedJobs, ({ many }) => ({
  approvals: many(approvals),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  failedJob: one(failedJobs, {
    fields: [approvals.jobId],
    references: [failedJobs.id],
  }),
}));

export const auditLogs = createTable(
  "audit_log",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    jobId: bigint("job_id", { mode: "number" }).notNull(),
    event: varchar("event", { length: 255 }).notNull(),
    performedBy: varchar("performed_by", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (al) => ({
    jobIdIdx: index("audit_log_job_id_idx").on(al.jobId),
    performedByIdx: index("audit_log_performed_by_idx").on(al.performedBy),
  }),
);
