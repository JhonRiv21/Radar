import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: text("external_id").notNull().unique(),
    source: text("source").notNull(),
    title: text("title"),
    url: text("url"),
    sourceDomain: text("source_domain"),
    country: text("country"),
    lang: text("lang"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    category: text("category"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("events_ingested_at_idx").on(t.ingestedAt),
    index("events_occurred_at_idx").on(t.occurredAt),
  ],
);

export const ingestRuns = pgTable("ingest_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull().default("running"),
  rows: integer("rows").notNull().default(0),
  error: text("error"),
});
