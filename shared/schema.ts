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

// For file upload, the request is multipart/form-data, so we don't define a JSON body schema here for the upload itself,
// but we define the response structure.
