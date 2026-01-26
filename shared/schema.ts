import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: jsonb("data").notNull(), // Storing parsed row data as JSON
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertFileSchema = createInsertSchema(files).omit({ 
  id: true, 
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type FileRecord = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type FileResponse = FileRecord;
export type FilesListResponse = FileRecord[];

// === PREPROCESSING SCHEMAS ===
export const preprocessingActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("capitalize"), columns: z.array(z.string()) }),
  z.object({ type: z.literal("lowercase"), columns: z.array(z.string()) }),
  z.object({ type: z.literal("capitalizeFirst"), columns: z.array(z.string()) }),
  z.object({ type: z.literal("removeCharacters"), columns: z.array(z.string()), characters: z.string() }),
  z.object({ type: z.literal("replaceCharacters"), columns: z.array(z.string()), find: z.string(), replace: z.string() }),
  z.object({ type: z.literal("removeDuplicates"), columns: z.array(z.string()) }),
  z.object({ type: z.literal("removeRows"), indices: z.array(z.number()) }),
  z.object({ type: z.literal("convertDate"), columns: z.array(z.string()), format: z.string() }),
]);

export type PreprocessingAction = z.infer<typeof preprocessingActionSchema>;
