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

    case 'sortColumn': {
      const direction = action.direction === 'desc' ? -1 : 1;
      newData.sort((a: Record<string, any>, b: Record<string, any>) => {
        const aValue = a[action.column];
        const bValue = b[action.column];
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        const numericComparable = !Number.isNaN(aNum) && !Number.isNaN(bNum);

        if (numericComparable) {
          return (aNum - bNum) * direction;
        }

        const aText = String(aValue ?? '').toLowerCase();
        const bText = String(bValue ?? '').toLowerCase();
        if (aText < bText) return -1 * direction;
        if (aText > bText) return 1 * direction;
        return 0;
      });
      message = `Sorted by ${action.column} (${action.direction})`;
      break;
    }

    case 'transpose': {
      const headers = columnOrder && columnOrder.length > 0 ? columnOrder : Object.keys(newData[0] || {});
      const isSyntheticTranspose =
        headers.length > 1 &&
        headers[0] === 'Column' &&
        headers.slice(1).every((header, index) => header === `Row ${index}`);

      if (isSyntheticTranspose) {
        const rowLabels = headers.slice(1);
        const originalHeaders = newData.map((row: Record<string, any>) => row.Column);
        const restored = rowLabels.map((label) => {
          const row: Record<string, any> = {};
          originalHeaders.forEach((header, columnIndex) => {
            row[header] = newData[columnIndex]?.[label];
          });
          return row;
        });

        newData = restored;
        columnOrder = originalHeaders;
        message = `Restored original table from transposed state`;
      } else {
        const rowCount = newData.length;
        const transposed = headers.map((header) => {
          const row: Record<string, any> = { Column: header };
          for (let i = 0; i < rowCount; i += 1) {
            row[`Row ${i}`] = newData[i]?.[header];
          }
          return row;
        });
        const newColumnOrder = ['Column', ...Array.from({ length: rowCount }, (_, i) => `Row ${i}`)];
        newData = transposed;
        columnOrder = newColumnOrder;
        message = `Transposed table (${headers.length} columns → ${newData.length} rows)`;
      }
      break;
    }

    case 'mergeColumns': {
      const merged = newData.map((row: Record<string, any>) => {
        const newRow = { ...row };
        newRow[action.newColumn] = action.columns
          .map((column) => (column in newRow ? String(newRow[column]) : ''))
          .join(action.delimiter);
        return newRow;
      });
      const newColumnOrder = columnOrder.includes(action.newColumn)
        ? columnOrder
        : [...columnOrder, action.newColumn];
      newData = merged;
      columnOrder = newColumnOrder;
      message = `Merged ${action.columns.length} column(s) into ${action.newColumn}`;
      break;
    }
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
