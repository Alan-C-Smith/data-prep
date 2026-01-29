'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { UploadZone } from '@/components/UploadZone';
import { DataTable } from '@/components/DataTable';
import { PreprocessingPanel } from '@/components/PreprocessingPanel';
import { useToast } from '@/hooks/use-toast';
import type { FileRecord, PreprocessingAction } from '@/lib/schema';
import { format, parseISO, isValid } from 'date-fns';
import { Loader2, FileQuestion, RotateCcw, RotateCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<FileRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [columnRenames, setColumnRenames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFileUpload = (file: FileRecord) => {
    setCurrentFile(file);
    setSelectedColumns(new Set());
    setColumnRenames({});
    setHistory([JSON.parse(JSON.stringify(file.data))]);
    setHistoryIndex(0);
  };

  const handleColumnToggle = (column: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(column)) {
      newSelected.delete(column);
    } else {
      newSelected.add(column);
    }
    setSelectedColumns(newSelected);
  };

  const handlePreprocess = (action: PreprocessingAction) => {
    if (!currentFile) return;

    try {
      setIsProcessing(true);
      const currentData = currentFile.data;
      let newData = JSON.parse(JSON.stringify(currentData));

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
          break;

        case 'removeDuplicates':
          const seen = new Set<string>();
          newData = newData.filter((row: Record<string, any>) => {
            const key = action.columns.map((col) => row[col]).join('|');
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
          break;
      }

      // Update history - remove any future states if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setCurrentFile({
        ...currentFile,
        data: newData,
      });

      // Reset selected columns after successful operation
      setSelectedColumns(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setSelectedColumns(new Set());
    setColumnRenames({});
  };

  const handleRenameColumn = (originalName: string, newName: string) => {
    if (newName.trim() === '' || newName === originalName) {
      const newRenames = { ...columnRenames };
      delete newRenames[originalName];
      setColumnRenames(newRenames);
      return;
    }
    setColumnRenames({ ...columnRenames, [originalName]: newName });
  };

  const getDisplayName = (columnName: string) => {
    return columnRenames[columnName] || columnName;
  };

  const handleDeleteColumn = (columnName: string) => {
    if (!currentFile) return;

    // Remove column from all rows
    const newData = currentFile.data.map((row) => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });

    // Remove from columnOrder
    const newColumnOrder = currentFile.columnOrder.filter((col) => col !== columnName);

    // Remove from columnRenames
    const newRenames = { ...columnRenames };
    delete newRenames[columnName];

    // Remove from selected columns
    const newSelected = new Set(selectedColumns);
    newSelected.delete(columnName);

    setCurrentFile({
      ...currentFile,
      data: newData,
      columnOrder: newColumnOrder,
    });
    setColumnRenames(newRenames);
    setSelectedColumns(newSelected);
    setHistory([newData]);
    setHistoryIndex(0);

    toast({
      title: 'Column deleted',
      description: `Column "${getDisplayName(columnName)}" has been removed.`,
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0 && currentFile) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFile({
        ...currentFile,
        data: JSON.parse(JSON.stringify(history[newIndex])),
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && currentFile) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFile({
        ...currentFile,
        data: JSON.parse(JSON.stringify(history[newIndex])),
      });
    }
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    if (!currentFile) return;

    try {
      if (format === 'xlsx') {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(currentFile.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, currentFile.originalName.replace(/\.\w+$/, '.xlsx'));
      } else {
        // CSV export
        const headers = Object.keys(currentFile.data[0] || {});
        const csvContent = [
          headers.join(','),
          ...currentFile.data.map((row: any) =>
            headers.map((header) => {
              const value = row[header];
              if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${String(value).replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          ),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', currentFile.originalName.replace(/\.\w+$/, '.csv'));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {!currentFile ? (
          <>
            {/* Hero Section */}
            <section className="mb-16 text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Instant Processing
                </div>

                <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight mb-6">
                  Turn messy data into{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    clean insights
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Upload your Excel or CSV files and let our intelligent engine parse, clean, and structure your data
                  for immediate analysis.
                </p>
              </motion.div>
            </section>

            {/* Upload Section */}
            <motion.section
              className="mb-20 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20"></div>
                <div className="relative bg-card rounded-2xl p-1 shadow-2xl">
                  <UploadZone onFileUpload={handleFileUpload} isLoading={isProcessing} />
                </div>
              </div>
            </motion.section>

            {/* Info Section */}
            <section className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Simple Upload</h3>
                <p className="text-sm text-muted-foreground">Drag and drop your files or click to browse</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Processing</h3>
                <p className="text-sm text-muted-foreground">Apply multiple transformations to your data</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">Your data stays in your browser, never uploaded</p>
              </motion.div>
            </section>
          </>
        ) : (
          <>
            {/* File Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{currentFile.originalName}</h2>
                <p className="text-muted-foreground text-sm">
                  {currentFile.data.length} rows • {currentFile.size} bytes
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                      Export as Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                      Export as CSV (.csv)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  onClick={handleClearFile}
                  className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Data Table */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Data Preview</h3>
                <DataTable
                  data={currentFile.data}
                  onColumnSelect={handleColumnToggle}
                  selectedColumns={selectedColumns}
                  columnOrder={currentFile.columnOrder}
                  columnRenames={columnRenames}
                  onRenameColumn={handleRenameColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              </motion.div>

              {/* Preprocessing Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PreprocessingPanel
                  columns={Object.keys(currentFile.data[0] || {})}
                  data={currentFile.data}
                  selectedColumns={selectedColumns}
                  onColumnSelect={handleColumnToggle}
                  onApply={handlePreprocess}
                  columnRenames={columnRenames}
                  getDisplayName={getDisplayName}
                />
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
