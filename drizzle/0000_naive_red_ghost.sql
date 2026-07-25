CREATE SCHEMA "radar";
--> statement-breakpoint
CREATE TABLE "radar"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"source" text NOT NULL,
	"title" text,
	"url" text,
	"source_domain" text,
	"country" text,
	"lang" text,
	"lat" double precision,
	"lng" double precision,
	"category" text,
	"occurred_at" timestamp with time zone,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "radar"."ingest_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"rows" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE INDEX "events_ingested_at_idx" ON "radar"."events" USING btree ("ingested_at");--> statement-breakpoint
CREATE INDEX "events_occurred_at_idx" ON "radar"."events" USING btree ("occurred_at");