import {
  pgSchema,
  uuid,
  text,
  doublePrecision,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const radar = pgSchema("radar");

export const events = radar.table(
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
    hazardId: uuid("hazard_id"),
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

export const hazards = radar.table(
  "hazards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: text("external_id").notNull().unique(),
    source: text("source").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    place: text("place"),
    magnitude: doublePrecision("magnitude"),
    depthKm: doublePrecision("depth_km"),
    significance: integer("significance"),
    alert: text("alert"),
    tsunami: boolean("tsunami").default(false).notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    country: text("country"),
    url: text("url"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    coverageCount: integer("coverage_count").default(0).notNull(),
    coverageCheckedAt: timestamp("coverage_checked_at", { withTimezone: true }),
  },
  (t) => [
    index("hazards_occurred_at_idx").on(t.occurredAt),
    index("hazards_kind_idx").on(t.kind),
  ],
);

export const ingestRuns = radar.table("ingest_runs", {
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
