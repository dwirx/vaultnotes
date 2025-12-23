import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileJson, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useVault, ExportedVault } from '@/contexts/VaultContext';
import { decryptWithPassword } from '@/lib/crypto';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EncryptedExport {
  version: number;
  encrypted: true;
  exportedAt: string;
  data: string;
}

type ImportStatus = 'idle' | 'dragging' | 'password' | 'processing' | 'success' | 'error';

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { importNotes } = useVault();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [encryptedData, setEncryptedData] = useState<EncryptedExport | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    setEncryptedData(null);
    setPassword('');
    setShowPassword(false);
    setIsDecrypting(false);
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetState]);

  const processPlaintextImport = useCallback(async (data: ExportedVault) => {
    setStatus('processing');
    try {
      const importResult = await importNotes(data);
      setResult(importResult);
      setStatus('success');
      
      if (importResult.imported > 0) {
        toast.success(`Imported ${importResult.imported} notes`);
      }
    } catch (err) {
      console.error('Import error:', err);
      setStatus('error');
      setErrorMessage('Failed to import notes');
    }
  }, [importNotes]);

  const processImportFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setErrorMessage('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Check if it's an encrypted export
      if (data.encrypted === true && data.data) {
        setEncryptedData(data as EncryptedExport);
        setStatus('password');
        return;
      }
      
      // Validate plaintext structure
      if (!data.version || !data.notes || !Array.isArray(data.notes)) {
        throw new Error('Invalid file format');
      }

      await processPlaintextImport(data as ExportedVault);
    } catch (err) {
      console.error('Import error:', err);
      setStatus('error');
      setErrorMessage('Invalid file format. Please use a valid export file.');
    }
  }, [processPlaintextImport]);

  const handleDecryptAndImport = async () => {
    if (!encryptedData || !password) return;

    setIsDecrypting(true);
    try {
      const decryptedJson = await decryptWithPassword(encryptedData.data, password);
      const data = JSON.parse(decryptedJson) as ExportedVault;
      
      if (!data.version || !data.notes || !Array.isArray(data.notes)) {
        throw new Error('Invalid decrypted data');
      }

      await processPlaintextImport(data);
    } catch (err) {
      console.error('Decryption error:', err);
      setErrorMessage('Wrong password or corrupted file');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleClick = () => {
    if (status === 'success' || status === 'error') {
      resetState();
    }
    if (status !== 'password') {
      fileInputRef.current?.click();
    }
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
    if (status !== 'processing' && status !== 'password') {
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
          {/* Password Entry for Encrypted Files */}
          {status === 'password' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Encrypted file detected
                </p>
                <p className="text-xs text-muted-foreground">
                  Enter the password to decrypt and import
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-background border border-border rounded-md px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && password) {
                        handleDecryptAndImport();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs text-destructive text-center">{errorMessage}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={resetState}
                    className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecryptAndImport}
                    disabled={!password || isDecrypting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDecrypting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      'Decrypt & Import'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drop Zone - only show when not in password mode */}
          {status !== 'password' && (
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
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Help text */}
          {status !== 'password' && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Supports both encrypted and plaintext export files
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
