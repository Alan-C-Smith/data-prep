import { Link } from "wouter";
import { format } from "date-fns";
import { FileText, Calendar, HardDrive, ArrowRight, Trash2 } from "lucide-react";
import type { FileRecord } from "@shared/schema";
import { useDeleteFile } from "@/hooks/use-files";
import { useToast } from "@/hooks/use-toast";
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

interface FileCardProps {
  file: FileRecord;
}

export function FileCard({ file }: FileCardProps) {
  const { mutate: deleteFile, isPending } = useDeleteFile();
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    // Prevent navigation when clicking delete
    e.stopPropagation(); 
    e.preventDefault(); 
  };

  const confirmDelete = () => {
    deleteFile(file.id, {
      onSuccess: () => {
        toast({ title: "File deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete", variant: "destructive" });
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

  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link href={`/files/${file.id}`}>
        <div className="p-6 cursor-pointer h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <FileText className="w-6 h-6" />
            </div>
            
            <div onClick={handleDelete}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete File?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete 
                      <span className="font-semibold text-foreground"> {file.originalName}</span> and all its processed data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <h3 className="font-display font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {file.originalName}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
            Processed successfully. Ready for analysis.
          </p>

          <div className="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {file.createdAt ? format(new Date(file.createdAt), 'MMM d, yyyy') : 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                {formatSize(file.size)}
              </span>
            </div>
            
            <ArrowRight className="w-4 h-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-primary" />
          </div>
        </div>
      </Link>
    </div>
  );
}
