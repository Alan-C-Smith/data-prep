import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import multer from "multer";
import * as XLSX from "xlsx";
import { format, parseISO, isValid } from "date-fns";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed demo data if empty
  const initialFiles = await storage.getFiles();
  if (initialFiles.length === 0) {
    await storage.createFile({
      filename: "demo_sales_data.xlsx",
      originalName: "demo_sales_data.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 1024,
      data: [
        { "Date": "2024-01-01", "Product": "Widget A", "Region": "North", "Sales": 100 },
        { "Date": "2024-01-02", "Product": "Widget B", "Region": "South", "Sales": 150 },
        { "Date": "2024-01-03", "Product": "Widget A", "Region": "East", "Sales": 120 },
        { "Date": "2024-01-04", "Product": "Widget C", "Region": "West", "Sales": 200 },
        { "Date": "2024-01-05", "Product": "Widget B", "Region": "North", "Sales": 160 }
      ]
    });
  }

  app.get(api.files.list.path, async (req, res) => {
    const files = await storage.getFiles();
    res.json(files);
  });

  app.get(api.files.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const file = await storage.getFile(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(file);
  });

  app.post(api.files.upload.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const buffer = req.file.buffer;
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const fileRecord = await storage.createFile({
        filename: req.file.filename || req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        data: data as any,
      });

      res.status(201).json(fileRecord);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  app.post(api.files.preprocess.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const file = await storage.getFile(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    try {
      const action = api.files.preprocess.input.parse(req.body);
      let data = [...(file.data as any[])];

      switch (action.type) {
        case "capitalize":
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              if (typeof newRow[col] === 'string') newRow[col] = newRow[col].toUpperCase();
            });
            return newRow;
          });
          break;
        case "lowercase":
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              if (typeof newRow[col] === 'string') newRow[col] = newRow[col].toLowerCase();
            });
            return newRow;
          });
          break;
        case "capitalizeFirst":
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              if (typeof newRow[col] === 'string') {
                newRow[col] = newRow[col].split(' ')
                  .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase())
                  .join(' ');
              }
            });
            return newRow;
          });
          break;
        case "removeCharacters":
          const chars = action.characters;
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              if (typeof newRow[col] === 'string') {
                const regex = new RegExp(`[${chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');
                newRow[col] = newRow[col].replace(regex, '');
              }
            });
            return newRow;
          });
          break;
        case "replaceCharacters":
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              if (typeof newRow[col] === 'string') {
                newRow[col] = newRow[col].split(action.find).join(action.replace);
              }
            });
            return newRow;
          });
          break;
        case "removeDuplicates":
          const seen = new Set();
          data = data.filter(row => {
            const key = action.columns.map(col => row[col]).join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          break;
        case "removeRows":
          data = data.filter((_, i) => !action.indices.includes(i));
          break;
        case "convertDate":
          data = data.map(row => {
            const newRow = { ...row };
            action.columns.forEach(col => {
              const val = newRow[col];
              if (val) {
                const date = typeof val === 'string' ? parseISO(val) : new Date(val);
                if (isValid(date)) {
                  newRow[col] = format(date, action.format);
                }
              }
            });
            return newRow;
          });
          break;
      }

      const updatedFile = await storage.updateFile(id, data);
      res.json(updatedFile);
    } catch (error) {
      console.error('Preprocessing error:', error);
      res.status(400).json({ message: "Invalid preprocessing action" });
    }
  });

  app.delete(api.files.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const file = await storage.getFile(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await storage.deleteFile(id);
    res.status(204).send();
  });

  return httpServer;
}
