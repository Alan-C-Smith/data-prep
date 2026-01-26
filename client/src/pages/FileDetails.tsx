import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { DataTable } from "@/components/DataTable";
import { useFile, useDeleteFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  HardDrive, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FileDetails() {
  const { id } = useParams<{ id: string }>();
  const fileId = parseInt(id);
  const { data: file, isLoading, error } = useFile(fileId);
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteFile(fileId, {
      onSuccess: () => {
        toast({ title: "File deleted successfully" });
        window.location.href = "/"; // Simple redirect
      },
      onError: () => {
        toast({ title: "Failed to delete file", variant: "destructive" });
      }
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium text-foreground">Loading file data...</h2>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <FileSpreadsheet className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">File not found</h2>
          <p className="text-muted-foreground mb-8">The file you are looking for doesn't exist or has been deleted.</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  {file.originalName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    {file.createdAt ? format(new Date(file.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                    <HardDrive className="w-3.5 h-3.5" />
                    {formatSize(file.size)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md uppercase">
                    ID: #{file.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2 rounded-lg border border-border font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => toast({ title: "Feature coming soon", description: "Export functionality is not yet implemented." })}
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-4 py-2 rounded-lg bg-destructive/10 font-medium text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete 
                      <span className="font-semibold text-foreground"> {file.originalName}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Data View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Data Preview</h2>
          </div>
          
          <DataTable data={file.data as any[]} />
        </div>
      </main>
    </div>
  );
}
