'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { PreprocessingAction } from '@/lib/schema';

interface FileRecord {
  originalName: string;
  size: number;
  data: any[];
  columnOrder: string[];
}

export function useDataAPI() {
  const { toast } = useToast();

  /**
   * Upload and parse file via API
   */
  const uploadFile = useCallback(
    async (file: File): Promise<FileRecord | null> => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Upload failed');
        }

        const result = await response.json();
        return result.file;
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  /**
   * Apply preprocessing via API
   */
  const preprocessData = useCallback(
    async (data: any[], columnOrder: string[], action: PreprocessingAction) => {
      try {
        const response = await fetch('/api/preprocess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, columnOrder, action }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Processing failed');
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Preprocessing error:', error);
        toast({
          title: 'Processing failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  return {
    uploadFile,
    preprocessData,
  };
}
