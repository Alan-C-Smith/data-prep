'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw, RotateCw, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { PreprocessingAction } from '@/lib/schema';

interface PreprocessingPanelProps {
  columns: string[];
  data: any[];
  selectedColumns?: Set<string>;
  onColumnSelect?: (column: string) => void;
  onApply: (action: PreprocessingAction) => void;
  columnRenames?: Record<string, string>;
  getDisplayName?: (columnName: string) => string;
  searchTerm?: string;
  columnOrder?: string[];
  onSearchChange?: (term: string) => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isProcessing?: boolean;
}

type OperationType =
  | 'capitalize'
  | 'lowercase'
  | 'capitalizeFirst'
  | 'removeCharacters'
  | 'replaceCharacters'
  | 'removeDuplicates'
  | 'removeRows'
  | 'sortColumn'
  | 'transpose'
  | 'mergeColumns';

// Helper function to parse row indices from a string supporting ranges and commas
function parseRowIndices(input: string, maxIndex: number): number[] {
  const indices = new Set<number>();
  const parts = input.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    // Check if it's a range (e.g., "0-4")
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr);
      const end = parseInt(endStr);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max && i < maxIndex; i++) {
          indices.add(i);
        }
      }
    } else {
      // Single index
      const num = parseInt(part);
      if (!isNaN(num) && num < maxIndex) {
        indices.add(num);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

export function PreprocessingPanel({
  columns,
  data,
  selectedColumns,
  onSearchChange,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onColumnSelect,
  onApply,
  columnRenames = {},
  getDisplayName = (name) => name,
  searchTerm = '',
  columnOrder = [],
  isProcessing = false,
}: PreprocessingPanelProps) {
  const { toast } = useToast();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce search input - wait 300ms after user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onSearchChange?.(localSearchTerm);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [localSearchTerm, onSearchChange]);

  // Sync external searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const [operation, setOperation] = useState<OperationType>('capitalize');
  const [internalSelectedColumns, setInternalSelectedColumns] = useState<Set<string>>(new Set());
  const [removeChars, setRemoveChars] = useState('');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [rowIndices, setRowIndices] = useState('');
  const [useFilteredRows, setUseFilteredRows] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [mergeColumnName, setMergeColumnName] = useState('');
  const [mergeDelimiter, setMergeDelimiter] = useState(' ');

  // Use provided selectedColumns or fall back to internal state
  const currentSelectedColumns = selectedColumns || internalSelectedColumns;
  const handleColumnSelect =
    onColumnSelect ||
    ((col: string) => {
      const newSelected = new Set(internalSelectedColumns);
      if (newSelected.has(col)) {
        newSelected.delete(col);
      } else {
        newSelected.add(col);
      }
      setInternalSelectedColumns(newSelected);
    });

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      const allSelected = new Set(columns);
      if (onColumnSelect) {
        columns.forEach((col) => {
          if (!currentSelectedColumns.has(col)) {
            onColumnSelect(col);
          }
        });
      } else {
        setInternalSelectedColumns(allSelected);
      }
    } else {
      if (onColumnSelect) {
        Array.from(currentSelectedColumns).forEach((col) => onColumnSelect(col));
      } else {
        setInternalSelectedColumns(new Set());
      }
    }
  };

  const handleApply = async () => {
    const columnsToApply = Array.from(currentSelectedColumns);

    // Validate operation-specific inputs
    if (
      ['capitalize', 'lowercase', 'capitalizeFirst', 'removeCharacters', 'replaceCharacters', 'removeDuplicates', 'sortColumn', 'mergeColumns'].includes(
        operation
      ) &&
      columnsToApply.length === 0
    ) {
      toast({
        title: 'Please select at least one column',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'sortColumn' && columnsToApply.length !== 1) {
      toast({
        title: 'Please select exactly one column to sort by',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'mergeColumns' && columnsToApply.length < 2) {
      toast({
        title: 'Please select at least two columns to merge',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'mergeColumns' && !mergeColumnName.trim()) {
      toast({
        title: 'Please enter a name for the merged column',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'removeCharacters' && !removeChars) {
      toast({
        title: 'Please specify characters to remove',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'replaceCharacters') {
      if (!findStr || !replaceStr) {
        toast({
          title: 'Please specify find and replace values',
          variant: 'destructive',
        });
        return;
      }
    }

    if (operation === 'removeRows') {
      if (!useFilteredRows && !rowIndices) {
        toast({
          title: 'Please specify row indices or use filtered rows',
          variant: 'destructive',
        });
        return;
      }

      if (!useFilteredRows) {
        const indices = parseRowIndices(rowIndices, data.length);
        if (indices.length === 0) {
          toast({
            title: 'Invalid row indices',
            variant: 'destructive',
          });
          return;
        }
      }
    }

    let payload: PreprocessingAction | null = null;

    switch (operation) {
      case 'capitalize':
        payload = { type: 'capitalize', columns: columnsToApply };
        break;
      case 'lowercase':
        payload = { type: 'lowercase', columns: columnsToApply };
        break;
      case 'capitalizeFirst':
        payload = { type: 'capitalizeFirst', columns: columnsToApply };
        break;
      case 'removeCharacters':
        payload = {
          type: 'removeCharacters',
          columns: columnsToApply,
          characters: removeChars,
        };
        break;
      case 'replaceCharacters':
        payload = {
          type: 'replaceCharacters',
          columns: columnsToApply,
          find: findStr,
          replace: replaceStr,
        };
        break;
      case 'removeDuplicates':
        payload = { type: 'removeDuplicates', columns: columnsToApply };
        break;
      case 'sortColumn':
        payload = {
          type: 'sortColumn',
          column: columnsToApply[0],
          direction: sortDirection,
        };
        break;
      case 'transpose':
        payload = { type: 'transpose' };
        break;
      case 'mergeColumns':
        payload = {
          type: 'mergeColumns',
          columns: columnsToApply,
          newColumn: mergeColumnName.trim(),
          delimiter: mergeDelimiter,
        };
        break;
      case 'removeRows':
        if (useFilteredRows) {
          const headers = columnOrder && columnOrder.length > 0 ? columnOrder : Object.keys(data[0] || {});
          const filteredIndices: number[] = [];
          const term = searchTerm.toLowerCase().trim();
          if (term) {
            data.forEach((row, idx) => {
              const matchesFilter = headers.some((header) => String(row[header]).toLowerCase().includes(term));
              if (matchesFilter) {
                filteredIndices.push(idx);
              }
            });
          }
          payload = { type: 'removeRows', indices: filteredIndices };
        } else {
          const indices = parseRowIndices(rowIndices, data.length);
          payload = { type: 'removeRows', indices };
        }
        break;
      default:
        throw new Error(`Unknown operation type: ${operation}`);
    }

    if (!payload) {
      toast({
        title: 'Error',
        description: 'Failed to create operation payload',
        variant: 'destructive',
      });
      return;
    }

    try {
      onApply(payload);
      // Reset form
      setInternalSelectedColumns(new Set());
      setRemoveChars('');
      setFindStr('');
      setReplaceStr('');
      setRowIndices('');
      setUseFilteredRows(false);
      setSortDirection('asc');
      setMergeColumnName('');
      setMergeDelimiter(' ');
    } catch (error) {
      toast({
        title: 'Error applying preprocessing',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const columnSelectionUI = (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 p-3 border border-primary/30 rounded-lg bg-primary/5">
        <Checkbox
          id="select-all"
          checked={currentSelectedColumns.size === columns.length && columns.length > 0}
          onCheckedChange={handleSelectAllChange}
        />
        <label htmlFor="select-all" className="text-sm font-semibold cursor-pointer text-primary">
          Select All Columns ({currentSelectedColumns.size}/{columns.length})
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-card">
        {columns.map((col) => (
          <div key={col} className="flex items-center space-x-2 hover:bg-muted/50 p-1 rounded transition-colors">
            <Checkbox
              id={`col-${col}`}
              checked={currentSelectedColumns.has(col)}
              onCheckedChange={() => handleColumnSelect(col)}
            />
            <label htmlFor={`col-${col}`} className="text-sm cursor-pointer truncate flex-1">
              {getDisplayName(col)}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground italic">
        💡 Tip: You can also click column headings in the data table below to select/deselect them
      </p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative group flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search data..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
                title="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              title="Reset to original"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Operation Selection */}
          <div className="flex-1 min-w-48">
            <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
              <SelectTrigger className="bg-background h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectGroup className="py-2 border-b border-border">
                  <SelectLabel className="text-xs font-bold text-primary uppercase tracking-wider px-2 py-1 bg-primary/5 rounded mb-1">📝 Text Case</SelectLabel>
                  <SelectItem value="capitalize">Capitalize (UPPERCASE)</SelectItem>
                  <SelectItem value="lowercase">Lowercase (lowercase)</SelectItem>
                  <SelectItem value="capitalizeFirst">Capitalize First Letter (Title Case)</SelectItem>
                </SelectGroup>

                <SelectGroup className="py-2 border-b border-border">
                  <SelectLabel className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded mb-1">🔄 Remove / Replace</SelectLabel>
                  <SelectItem value="removeCharacters">Remove Characters</SelectItem>
                  <SelectItem value="replaceCharacters">Replace Characters</SelectItem>
                </SelectGroup>

                <SelectGroup className="py-2 border-b border-border">
                  <SelectLabel className="text-xs font-bold text-cyan-600 uppercase tracking-wider px-2 py-1 bg-cyan-50 rounded mb-1">↕️ Sort / Transpose</SelectLabel>
                  <SelectItem value="sortColumn">Sort Column</SelectItem>
                  <SelectItem value="transpose">Transpose Table</SelectItem>
                </SelectGroup>

                <SelectGroup className="py-2 border-b border-border">
                  <SelectLabel className="text-xs font-bold text-amber-600 uppercase tracking-wider px-2 py-1 bg-amber-50 rounded mb-1">🧩 Merge Columns</SelectLabel>
                  <SelectItem value="mergeColumns">Merge Columns</SelectItem>
                </SelectGroup>

                <SelectGroup className="py-2 border-b border-border">
                  <SelectLabel className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-2 py-1 bg-purple-50 dark:bg-purple-950/30 rounded mb-1">🎯 Deduplication & Removal</SelectLabel>
                  <SelectItem value="removeDuplicates">Remove Duplicates</SelectItem>
                  <SelectItem value="removeRows">Remove Rows</SelectItem>
                </SelectGroup>

              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-3">

        {/* Column Selection (for operations that require it) */}
        {operation !== 'removeRows' && operation !== 'transpose' && (
          <Collapsible className="space-y-1">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-xs h-8 py-1">
                <span className="font-semibold">Columns ({currentSelectedColumns.size})</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>{columnSelectionUI}</CollapsibleContent>
          </Collapsible>
        )}

        {/* Operation-specific input fields */}
        {operation === 'removeCharacters' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold">Characters to Remove</label>
            <Input
              placeholder='e.g., "-", " ", ","'
              value={removeChars}
              onChange={(e) => setRemoveChars(e.target.value)}
            />
          </div>
        )}

        {operation === 'replaceCharacters' && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Find</label>
              <Input
                placeholder="Text to find"
                value={findStr}
                onChange={(e) => setFindStr(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Replace With</label>
              <Input
                placeholder="Replacement text"
                value={replaceStr}
                onChange={(e) => setReplaceStr(e.target.value)}
              />
            </div>
          </div>
        )}

        {operation === 'sortColumn' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Sort direction</label>
              <Select value={sortDirection} onValueChange={(value: any) => setSortDirection(value)}>
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {operation === 'mergeColumns' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Merged column name</label>
              <Input
                placeholder="New column name"
                value={mergeColumnName}
                onChange={(e) => setMergeColumnName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Delimiter</label>
              <Input
                placeholder="e.g. space, comma, dash"
                value={mergeDelimiter}
                onChange={(e) => setMergeDelimiter(e.target.value)}
              />
            </div>
          </div>
        )}

        {operation === 'transpose' && (
          <div className="p-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">
            Transpose will swap rows and columns for the full table. The result is a new table where each original column becomes a row.
          </div>
        )}

        {operation === 'removeRows' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useFilteredRows"
                checked={useFilteredRows}
                onCheckedChange={(checked) => setUseFilteredRows(checked as boolean)}
              />
              <label htmlFor="useFilteredRows" className="text-xs font-semibold cursor-pointer">
                Remove rows matching search filter
              </label>
            </div>

            {useFilteredRows ? (
              <div className="p-2 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  This will remove all rows that match the current search term.
                </p>
                {searchTerm && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current search: <span className="font-mono font-bold">{searchTerm}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold">Row Indices to Remove</label>
                <Textarea
                  placeholder="Examples:&#10;- Single: 0, 2, 5&#10;- Range: 0-4 (removes 0,1,2,3,4)&#10;- Mixed: 0-4, 10, 15-20"
                  value={rowIndices}
                  onChange={(e) => setRowIndices(e.target.value)}
                  className="font-mono text-xs"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Supports: comma-separated (0, 5, 10), ranges (0-4), or both (0-4, 10, 15-20)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Apply Button */}
        <button onClick={handleApply} disabled={isProcessing} className="w-full px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border border-primary/50 hover:border-primary">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing
            </>
          ) : (
            'Apply'
          )}
        </button>
      </CardContent>
    </Card>
  );
}
