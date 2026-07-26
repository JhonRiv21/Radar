CREATE TABLE "radar"."hazards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"source" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"place" text,
	"magnitude" double precision,
	"depth_km" double precision,
	"significance" integer,
	"alert" text,
	"tsunami" boolean DEFAULT false NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"url" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"coverage_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "hazards_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "radar"."events" ADD COLUMN "hazard_id" uuid;--> statement-breakpoint
CREATE INDEX "hazards_occurred_at_idx" ON "radar"."hazards" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "hazards_kind_idx" ON "radar"."hazards" USING btree ("kind");