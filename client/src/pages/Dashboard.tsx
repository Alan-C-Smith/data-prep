import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { UploadZone } from "@/components/UploadZone";
import { FileCard } from "@/components/FileCard";
import { useFiles } from "@/hooks/use-files";
import { Loader2, Plus, FileQuestion } from "lucide-react";

export default function Dashboard() {
  const { data: files, isLoading, error } = useFiles();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
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
              AI-Powered Processing
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight mb-6">
              Turn messy data into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">clean insights</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Upload your Excel or CSV files and let our intelligent engine parse, clean, and structure your data for immediate analysis.
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
              <UploadZone />
            </div>
          </div>
        </motion.section>

        {/* Recent Files Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">Recent Files</h2>
            {/* <button className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button> */}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your workspace...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
              <p className="text-destructive font-medium">Failed to load files. Please try again.</p>
            </div>
          ) : files?.length === 0 ? (
            <motion.div 
              className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No files yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first dataset to get started.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {files?.map((file) => (
                <motion.div key={file.id} variants={item}>
                  <FileCard file={file} />
                </motion.div>
              ))}
              
              {/* Empty state "Add New" card to fill the grid nicely */}
              <motion.div variants={item} className="h-full">
                <div className="h-full min-h-[200px] border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">Upload Another</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </section>
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-border py-8 mt-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DataPrep.ai. Built for speed and simplicity.</p>
        </div>
      </footer>
    </div>
  );
}
