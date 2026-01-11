import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  foodName: text("food_name").notNull(),
  imageUrl: text("image_url"), // Optional, if we want to store it (or base64 if short, but typically external storage)
  // Since we're just doing base64 in/out for now and maybe storing result, let's keep it simple.
  analysis: jsonb("analysis").default({}), // Store full analysis result if needed
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertScanSchema = createInsertSchema(scans).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

// Request types
export const scanRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"), // Base64 string
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;

// Response types
export type ScanResponse = {
  foodName: string;
  confidence?: number;
  analysis?: any;
};

// Error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};
