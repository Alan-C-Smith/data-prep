import { files, type FileRecord, type InsertFile } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getFiles(): Promise<FileRecord[]>;
  getFile(id: number): Promise<FileRecord | undefined>;
  createFile(file: InsertFile): Promise<FileRecord>;
  updateFile(id: number, data: any): Promise<FileRecord>;
  deleteFile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFiles(): Promise<FileRecord[]> {
    return await db.select().from(files).orderBy(desc(files.createdAt));
  }

  async getFile(id: number): Promise<FileRecord | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async createFile(insertFile: InsertFile): Promise<FileRecord> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async updateFile(id: number, data: any): Promise<FileRecord> {
    const [file] = await db.update(files).set({ data }).where(eq(files.id, id)).returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
