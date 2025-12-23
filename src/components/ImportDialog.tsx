import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useVault, ExportedVault } from '@/contexts/VaultContext';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStatus = 'idle' | 'dragging' | 'processing' | 'success' | 'error';

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { importNotes } = useVault();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetState]);

  const processImportFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setErrorMessage('Please select a JSON file');
      return;
    }

    setStatus('processing');
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportedVault;
      
      // Validate structure
      if (!data.version || !data.notes || !Array.isArray(data.notes)) {
        throw new Error('Invalid file format');
      }

      const importResult = await importNotes(data);
      setResult(importResult);
      setStatus('success');
      
      if (importResult.imported > 0) {
        toast.success(`Imported ${importResult.imported} notes`);
      }
    } catch (err) {
      console.error('Import error:', err);
      setStatus('error');
      setErrorMessage('Invalid file format. Please use a valid export file.');
    }
  }, [importNotes]);

  const handleClick = () => {
    if (status === 'success' || status === 'error') {
      resetState();
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImportFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'processing') {
      setStatus('dragging');
    }
  }, [status]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      if (status === 'dragging') {
        setStatus('idle');
      }
    }
  }, [status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processImportFile(files[0]);
    }
  }, [processImportFile]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Import Notes</DialogTitle>
          <DialogDescription className="text-sm">
            Import notes from a previously exported JSON file.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              relative rounded-xl border-2 border-dashed transition-all cursor-pointer
              min-h-[200px] flex flex-col items-center justify-center p-6 text-center
              ${status === 'idle' ? 'border-border hover:border-accent hover:bg-accent/5' : ''}
              ${status === 'dragging' ? 'border-accent bg-accent/10 scale-[1.02]' : ''}
              ${status === 'processing' ? 'border-muted bg-muted/50 pointer-events-none' : ''}
              ${status === 'success' ? 'border-green-500 bg-green-500/10' : ''}
              ${status === 'error' ? 'border-destructive bg-destructive/10' : ''}
            `}
          >
            {status === 'idle' && (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileJson className="h-4 w-4" />
                  <span>Supports .json files</span>
                </div>
              </>
            )}

            {status === 'dragging' && (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 animate-pulse">
                  <Upload className="h-8 w-8 text-accent" />
                </div>
                <p className="text-sm font-medium text-accent">
                  Drop your file here
                </p>
              </>
            )}

            {status === 'processing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Importing notes...
                </p>
              </>
            )}

            {status === 'success' && result && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Import complete!
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.imported > 0 ? (
                    <>
                      {result.imported} note{result.imported !== 1 ? 's' : ''} imported
                      {result.skipped > 0 && `, ${result.skipped} skipped`}
                    </>
                  ) : result.skipped > 0 ? (
                    `All ${result.skipped} notes already exist`
                  ) : (
                    'No notes to import'
                  )}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChange(false);
                  }}
                  className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Done
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Import failed
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {errorMessage}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to try again
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Help text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Use "Export notes" to create a backup file first
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
