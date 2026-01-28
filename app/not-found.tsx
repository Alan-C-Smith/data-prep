'use client';

import Link from 'next/link';
import { FileQuestion, Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Simple navbar without any hooks */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl cursor-pointer">DataPrep.ai</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist.</p>
        <Link href="/">
          <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
