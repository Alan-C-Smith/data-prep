'use client';

import { useState, useCallback } from 'react';
import type { FileRecord, PreprocessingAction } from '@/lib/schema';
import * as XLSX from 'xlsx';
import { format, parseISO, isValid } from 'date-fns';

// Simple UUID generator for browser (no external dependencies)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useFileState() {
  const [currentFile, setCurrentFile] = useState<FileRecord | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const fileRecord: FileRecord = {
        id: generateId(),
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: data as Record<string, any>[],
        createdAt: new Date(),
      };

      setCurrentFile(fileRecord);
      return fileRecord;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to process file');
    }
  }, []);

  const preprocessFile = useCallback((action: PreprocessingAction) => {
    if (!currentFile) throw new Error('No file loaded');

    let newData = JSON.parse(JSON.stringify(currentFile.data));

    switch (action.type) {
      case 'capitalize':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              newRow[col] = String(newRow[col]).toUpperCase();
            }
          });
          return newRow;
        });
        break;

      case 'lowercase':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              newRow[col] = String(newRow[col]).toLowerCase();
            }
          });
          return newRow;
        });
        break;

      case 'capitalizeFirst':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              const str = String(newRow[col]);
              newRow[col] = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }
          });
          return newRow;
        });
        break;

      case 'removeCharacters':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              newRow[col] = String(newRow[col]).split(action.characters).join('');
            }
          });
          return newRow;
        });
        break;

      case 'replaceCharacters':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              newRow[col] = String(newRow[col]).replace(new RegExp(action.find, 'g'), action.replace);
            }
          });
          return newRow;
        });
        break;

      case 'removeDuplicates':
        const seen = new Set<string>();
        newData = newData.filter((row: Record<string, any>) => {
          const key = action.columns.map(col => row[col]).join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        break;

      case 'removeRows':
        newData = newData.filter((_: any, idx: number) => !action.indices.includes(idx));
        break;

      case 'convertDate':
        newData = newData.map((row: Record<string, any>) => {
          const newRow = { ...row };
          action.columns.forEach(col => {
            if (col in newRow) {
              try {
                const date = parseISO(String(newRow[col]));
                if (isValid(date)) {
                  newRow[col] = format(date, action.format);
                }
              } catch (e) {
                // Keep original value if parsing fails
              }
            }
          });
          return newRow;
        });
        break;
    }

    setCurrentFile({
      ...currentFile,
      data: newData,
    });
  }, [currentFile]);

  const clearFile = useCallback(() => {
    setCurrentFile(null);
  }, []);

  return {
    currentFile,
    uploadFile,
    preprocessFile,
    clearFile,
  };
}
