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
