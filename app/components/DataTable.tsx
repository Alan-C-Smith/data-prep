'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Search, Pencil, Check, X } from 'lucide-react';

interface DataTableProps {
  data: any[];
  onColumnSelect?: (column: string) => void;
  selectedColumns?: Set<string>;
  columnOrder?: string[];
  columnRenames?: Record<string, string>;
  onRenameColumn?: (originalName: string, newName: string) => void;
}

export function DataTable({ data, onColumnSelect, selectedColumns, columnOrder, columnRenames = {}, onRenameColumn }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const itemsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
        <p className="text-muted-foreground font-medium">No data found in this file.</p>
      </div>
    );
  }

  // Get headers from columnOrder if provided, otherwise from first row keys
  const headers = columnOrder && columnOrder.length > 0 ? columnOrder : Object.keys(data[0]);

  // Filter data
  const filteredData = data.filter((row) =>
    headers.some((header) => String(row[header]).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const actualStartIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium">Showing {filteredData.length} rows</div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 px-4 py-4 text-center font-bold text-foreground text-xs bg-muted border-r border-border sticky left-0 z-10">
                  #
                </TableHead>
                {headers.map((header) => {
                  const displayName = columnRenames[header] || header;
                  const isEditing = editingColumn === header;
                  
                  return (
                    <TableHead
                      key={header}
                      className={`font-bold text-foreground whitespace-nowrap px-6 py-4 cursor-pointer transition-colors relative group ${
                        selectedColumns?.has(header) ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50'
                      }`}
                      title="Click to select/deselect column"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {isEditing ? (
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 px-2 py-1 text-sm bg-background border border-primary rounded"
                          />
                        ) : (
                          <span onClick={() => onColumnSelect?.(header)}>{displayName}</span>
                        )}
                        {onRenameColumn && (
                          <div className="hidden group-hover:flex gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    onRenameColumn(header, editValue);
                                    setEditingColumn(null);
                                  }}
                                  className="p-1 rounded hover:bg-primary/20"
                                  title="Save"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingColumn(null)}
                                  className="p-1 rounded hover:bg-destructive/20"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingColumn(header);
                                  setEditValue(displayName);
                                }}
                                className="p-1 rounded hover:bg-muted"
                                title="Rename column"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="w-12 px-4 py-4 text-center text-xs text-muted-foreground font-medium bg-muted border-r border-border sticky left-0 z-10">
                      {actualStartIndex + i}
                    </TableCell>
                    {headers.map((header) => (
                      <TableCell key={`${i}-${header}`} className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {String(row[header]).length > 50 ? String(row[header]).substring(0, 50) + '...' : row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
