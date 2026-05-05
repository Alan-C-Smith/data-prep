'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDataAPI } from '@/hooks/use-data-api';
import type { FileRecord } from '@/lib/schema';

interface UploadZoneProps {
  onFileUpload: (file: FileRecord) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileUpload, isLoading = false }: UploadZoneProps) {
  const { toast } = useToast();
  const { uploadFile } = useDataAPI();
  const [isUploading, setIsUploading] = useState(false);

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

      setIsUploading(true);
      try {
        // Use backend API for file parsing
        const uploadedFile = await uploadFile(file);

        if (!uploadedFile) {
          return;
        }

        // Create FileRecord for the app
        const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const fileRecord: FileRecord = {
          id: fileId,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          data: uploadedFile.data,
          columnOrder: uploadedFile.columnOrder,
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
      } finally {
        setIsUploading(false);
      }
    },
    [onFileUpload, toast, uploadFile]
  );

  const onDropRejected = useCallback(
    (fileRejections: any[]) => {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast({
              title: 'File too large',
              description: 'Files cannot exceed 50MB. Please choose a smaller file.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Upload rejected',
              description: error.message,
              variant: 'destructive',
            });
          }
        });
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isLoading || isUploading,
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
            : 'border-border dark:border-white/25 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-muted/30 dark:hover:bg-white/5'
        }
        ${isLoading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
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
        {isUploading ? (
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
        {isUploading ? 'Uploading...' : isLoading ? 'Processing...' : isDragActive ? 'Drop it here!' : 'Upload your dataset'}
      </h3>

      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Drag and drop your Excel .xlsx or .csv files here, or click to browse. Maximum file size: 50MB.
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
