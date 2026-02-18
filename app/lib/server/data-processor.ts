/**
 * Server-side data processing utilities
 * Handles all preprocessing operations efficiently
 */

import type { PreprocessingAction } from '@/lib/schema';
import { format, parseISO, isValid } from 'date-fns';

export interface ProcessingResult {
  data: any[];
  columnOrder: string[];
  message: string;
}

/**
 * Apply preprocessing action to data on the server
 * Much faster than client-side processing
 */
export function applyPreprocessing(
  data: any[],
  columnOrder: string[],
  action: PreprocessingAction
): ProcessingResult {
  let newData = JSON.parse(JSON.stringify(data));
  let message = '';

  switch (action.type) {
    case 'capitalize':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
          if (col in newRow) {
            newRow[col] = String(newRow[col]).toUpperCase();
          }
        });
        return newRow;
      });
      message = `Capitalized ${action.columns.length} column(s)`;
      break;

    case 'lowercase':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
          if (col in newRow) {
            newRow[col] = String(newRow[col]).toLowerCase();
          }
        });
        return newRow;
      });
      message = `Lowercase applied to ${action.columns.length} column(s)`;
      break;

    case 'capitalizeFirst':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
          if (col in newRow) {
            const str = String(newRow[col]);
            newRow[col] = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          }
        });
        return newRow;
      });
      message = `Title case applied to ${action.columns.length} column(s)`;
      break;

    case 'removeCharacters':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
          if (col in newRow) {
            newRow[col] = String(newRow[col]).split(action.characters).join('');
          }
        });
        return newRow;
      });
      message = `Removed characters from ${action.columns.length} column(s)`;
      break;

    case 'replaceCharacters':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
          if (col in newRow) {
            newRow[col] = String(newRow[col]).replace(new RegExp(action.find, 'g'), action.replace);
          }
        });
        return newRow;
      });
      message = `Replaced characters in ${action.columns.length} column(s)`;
      break;

    case 'removeDuplicates':
      const seen = new Set<string>();
      const initialCount = newData.length;
      newData = newData.filter((row: Record<string, any>) => {
        const key = action.columns.map((col) => row[col]).join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const removedCount = initialCount - newData.length;
      message = `Removed ${removedCount} duplicate row(s)`;
      break;

    case 'removeRows':
      newData = newData.filter((_: any, idx: number) => !action.indices.includes(idx));
      message = `Removed ${action.indices.length} row(s)`;
      break;

    case 'convertDate':
      newData = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        action.columns.forEach((col) => {
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
      message = `Converted dates in ${action.columns.length} column(s)`;
      break;
  }

  return {
    data: newData,
    columnOrder,
    message,
  };
}

/**
 * Filter data based on search term
 * Optimized for large datasets
 */
export function filterData(data: any[], columnOrder: string[], searchTerm: string): any[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }

  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((row) =>
    columnOrder.some((header) => 
      String(row[header]).toLowerCase().includes(lowerSearch)
    )
  );
}

/**
 * Get paginated data
 */
export function getPaginatedData(
  data: any[],
  page: number = 1,
  itemsPerPage: number = 10
): { data: any[]; totalPages: number; totalItems: number } {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    data: data.slice(startIndex, endIndex),
    totalPages,
    totalItems,
  };
}
