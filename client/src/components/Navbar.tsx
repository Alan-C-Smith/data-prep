import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="bg-primary/10 p-2 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer">
              <Layers className="w-6 h-6 text-primary" />
            </div>
          </Link>
          <Link href="/">
            <span className="font-display font-bold text-xl cursor-pointer">DataPrep.ai</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Documentation
          </a>
          <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Support
          </button>
        </div>
      </div>
    </nav>
  );
}
