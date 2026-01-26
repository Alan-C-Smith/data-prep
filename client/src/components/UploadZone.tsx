import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { useUploadFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";

export function UploadZone() {
  const { mutate: uploadFile, isPending } = useUploadFile();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file type manually as an extra safeguard if needed, though accept prop handles most
    if (!file.name.endsWith('.csv') && !file.name.match(/\.xls(x)?$/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: `${file.name} has been uploaded and processed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [uploadFile, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isPending
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-12
        transition-all duration-300 ease-in-out
        flex flex-col items-center justify-center text-center
        ${isDragActive 
          ? "border-primary bg-primary/5 scale-[1.01]" 
          : "border-border hover:border-primary/50 hover:bg-muted/30"
        }
        ${isPending ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      
      <div className={`
        w-20 h-20 rounded-full flex items-center justify-center mb-6
        transition-all duration-300
        ${isDragActive ? "bg-primary/20" : "bg-muted"}
      `}>
        {isPending ? (
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        ) : (
          <Upload className={`w-10 h-10 transition-colors ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
        )}
      </div>

      <h3 className="text-xl font-bold font-display text-foreground mb-2">
        {isPending ? "Processing..." : isDragActive ? "Drop it here!" : "Upload your dataset"}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Drag and drop your Excel (.xlsx) or CSV files here, or click to browse.
      </p>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Excel</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>CSV Supported</span>
      </div>
    </div>
  );
}
