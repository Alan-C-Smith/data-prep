/**
 * Server-side file parsing utilities
 * Handles CSV and Excel file parsing efficiently
 */

import * as XLSX from 'xlsx';

export interface ParsedFile {
  data: any[];
  columnOrder: string[];
  fileName: string;
  rowCount: number;
}

/**
 * Parse Excel file from buffer
 */
export function parseExcel(buffer: Buffer, fileName: string): ParsedFile {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const columnOrder = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return {
    data: jsonData,
    columnOrder,
    fileName,
    rowCount: jsonData.length,
  };
}

/**
 * Parse CSV file from buffer
 */
export function parseCSV(buffer: Buffer, fileName: string): ParsedFile {
  // Use XLSX for CSV parsing as well for consistency
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const columnOrder = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return {
    data: jsonData,
    columnOrder,
    fileName,
    rowCount: jsonData.length,
  };
}

/**
 * Detect file type and parse accordingly
 */
export function parseFile(buffer: Buffer, fileName: string): ParsedFile {
  const ext = fileName.toLowerCase().split('.').pop();

  if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(buffer, fileName);
  } else if (ext === 'csv') {
    return parseCSV(buffer, fileName);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}
