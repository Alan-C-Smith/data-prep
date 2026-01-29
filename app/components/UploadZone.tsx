'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FileRecord } from '@/lib/schema';

interface UploadZoneProps {
  onFileUpload: (file: FileRecord) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileUpload, isLoading = false }: UploadZoneProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (!file.name.endsWith('.csv') && !file.name.match(/\.xls(x)?$/)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV or Excel file.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Get column order from the sheet range
        const columnOrder: string[] = [];
        if (data.length > 0) {
          const firstRow = data[0] as Record<string, any>;
          // Iterate through sheet in order to get actual column sequence
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_col(col) + '1';
            const cell = sheet[cellAddress];
            if (cell && cell.v) {
              columnOrder.push(String(cell.v));
            }
          }
          // Fallback to Object.keys if the above didn't work
          if (columnOrder.length === 0) {
            columnOrder.push(...Object.keys(firstRow));
          }
        }

        // Simple ID generator
        const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const fileRecord: FileRecord = {
          id: fileId,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          data: data as Record<string, any>[],
          columnOrder: columnOrder,
          createdAt: new Date(),
        };

        onFileUpload(fileRecord);
        toast({
          title: 'Success!',
          description: `${file.name} has been uploaded and processed.`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload Failed',
          description: 'Failed to process file',
          variant: 'destructive',
        });
      }
    },
    [onFileUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-12
        transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center text-center
        ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div
        className={`
        w-20 h-20 rounded-full flex items-center justify-center mb-6
        transition-all duration-300
        ${isDragActive ? 'bg-primary/20' : 'bg-muted'}
      `}
      >
        {isLoading ? (
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        ) : (
          <Upload
            className={`w-10 h-10 transition-colors ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
        )}
      </div>

      <h3 className="text-xl font-bold font-display text-foreground mb-2">
        {isLoading ? 'Processing...' : isDragActive ? 'Drop it here!' : 'Upload your dataset'}
      </h3>

      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Drag and drop your Excel (.xlsx) or CSV files here, or click to browse.
      </p>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>CSV Supported</span>
      </div>
    </div>
  );
}
