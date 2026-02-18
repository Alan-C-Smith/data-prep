'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { UploadZone } from '@/components/UploadZone';
import { DataTable } from '@/components/DataTable';
import { PreprocessingPanel } from '@/components/PreprocessingPanel';
import { useToast } from '@/hooks/use-toast';
import { useDataAPI } from '@/hooks/use-data-api';
import type { FileRecord, PreprocessingAction } from '@/lib/schema';
import { Loader2, Download, FileIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<FileRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<Array<{ data: any[]; columnOrder: string[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [columnRenames, setColumnRenames] = useState<Record<string, string>>({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { preprocessData } = useDataAPI();

  const handleFileUpload = (file: FileRecord) => {
    setCurrentFile(file);
    setSelectedColumns(new Set());
    setColumnRenames({});
    setHistory([{ data: JSON.parse(JSON.stringify(file.data)), columnOrder: file.columnOrder }]);
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

  const handlePreprocess = async (action: PreprocessingAction) => {
    if (!currentFile) return;

    try {
      setIsProcessing(true);
      const currentData = currentFile.data;
      const result = await preprocessData(currentData, currentFile.columnOrder, action);

      if (!result) {
        return;
      }

      // Update history - remove any future states if we're not at the end
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ data: result.data, columnOrder: result.columnOrder });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setCurrentFile({
        ...currentFile,
        data: result.data,
        columnOrder: result.columnOrder,
      });

      // Show success message
      toast({
        title: 'Success',
        description: result.message,
      });

      // Reset selected columns after successful operation
      setSelectedColumns(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (!currentFile || history.length === 0) return;
    
    const originalState = history[0];
    setCurrentFile({
      ...currentFile,
      data: JSON.parse(JSON.stringify(originalState.data)),
      columnOrder: originalState.columnOrder,
    });
    setHistoryIndex(0);
    setSelectedColumns(new Set());
    setColumnRenames({});
    
    toast({
      title: 'Data reset',
      description: 'Table reverted to original state.',
    });
  };

  const handleNewFile = () => {
    setCurrentFile(null);
    setSelectedColumns(new Set());
    setColumnRenames({});
    setHistory([]);
    setHistoryIndex(-1);
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

    // Add to history properly (like handlePreprocess does)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ data: newData, columnOrder: newColumnOrder });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCurrentFile({
      ...currentFile,
      data: newData,
      columnOrder: newColumnOrder,
    });
    setColumnRenames(newRenames);
    setSelectedColumns(newSelected);

    toast({
      title: 'Column deleted',
      description: `Column "${getDisplayName(columnName)}" has been removed.`,
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0 && currentFile) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setHistoryIndex(newIndex);
      setCurrentFile({
        ...currentFile,
        data: JSON.parse(JSON.stringify(previousState.data)),
        columnOrder: previousState.columnOrder,
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && currentFile) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setHistoryIndex(newIndex);
      setCurrentFile({
        ...currentFile,
        data: JSON.parse(JSON.stringify(nextState.data)),
        columnOrder: nextState.columnOrder,
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
            {/* Loading Popup for Upload */}
            {isProcessing ? (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card rounded-xl p-8 shadow-xl flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-center mb-1">Uploading File</h3>
                    <p className="text-sm text-muted-foreground text-center">Please wait while your file is being processed...</p>
                  </div>
                </motion.div>
              </div>
            ) : (
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
                      <UploadZone onFileUpload={handleFileUpload} isLoading={false} />
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
            )}
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
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border border-primary/50 hover:border-primary" disabled={isProcessing}>
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isProcessing ? '' : 'Export'}
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
                  onClick={() => setShowNewFileDialog(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-medium hover:shadow-lg hover:shadow-accent/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border border-accent/50 hover:border-accent"
                >
                  <FileIcon className="w-4 h-4" />
                  New File
                </button>
              </div>
            </motion.div>

            {/* Preprocessing Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PreprocessingPanel
                columns={Object.keys(currentFile.data[0] || {})}
                data={currentFile.data}
                selectedColumns={selectedColumns}
                onColumnSelect={handleColumnToggle}
                onApply={handlePreprocess}
                columnRenames={columnRenames}
                getDisplayName={getDisplayName}
                searchTerm={searchTerm}
                columnOrder={currentFile.columnOrder}
                onSearchChange={setSearchTerm}
                onReset={() => setShowResetDialog(true)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                isProcessing={isProcessing}
              />
            </motion.div>

            {/* Data Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DataTable
                data={currentFile.data}
                searchTerm={searchTerm}
                onColumnSelect={handleColumnToggle}
                selectedColumns={selectedColumns}
                columnOrder={currentFile.columnOrder}
                columnRenames={columnRenames}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            </motion.div>
          </>
        )}
      </main>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset table to original?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert all changes and restore the table to its original state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleReset();
                setShowResetDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* New File Confirmation Dialog */}
      <AlertDialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you're finished?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to load a new file. Make sure you've exported your data if you want to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleNewFile();
                setShowNewFileDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Load New File
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}
