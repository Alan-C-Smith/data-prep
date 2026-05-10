/**
 * Server-side file parsing utilities
 * Handles TSV, CSV and Excel file parsing efficiently
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

  const columnOrder = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];

  return {
    data: jsonData,
    columnOrder,
    fileName,
    rowCount: jsonData.length,
  };
}

function parseDelimited(buffer: Buffer, delimiter: string, fileName: string): ParsedFile {
  const text = buffer.toString('utf8');
  const result = Papa.parse<Record<string, any>>(text, {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const error = result.errors[0];
    throw new Error(`Failed to parse ${fileName}: ${error.message}`);
  }

  const jsonData = result.data;
  const columnOrder = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return {
    data: jsonData,
    columnOrder,
    fileName,
    rowCount: jsonData.length,
  };
}

export function parseCSV(buffer: Buffer, fileName: string): ParsedFile {
  return parseDelimited(buffer, ',', fileName);
}

export function parseTSV(buffer: Buffer, fileName: string): ParsedFile {
  return parseDelimited(buffer, '\t', fileName);
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
  } else if (ext === 'tsv') {
    return parseTSV(buffer, fileName);
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}
