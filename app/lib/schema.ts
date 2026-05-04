import { z } from "zod";

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

// === FILE RECORD TYPE (IN-MEMORY ONLY) ===
export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: Record<string, any>[];
  columnOrder: string[];
  createdAt: Date;
}

export type InsertFile = Omit<FileRecord, 'id' | 'createdAt'>;
export type FileResponse = FileRecord;
