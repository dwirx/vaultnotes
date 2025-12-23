import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Unlock, Eye, EyeOff, Download, Loader2, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useVault, ExportedVault } from '@/contexts/VaultContext';
import { encryptWithPassword } from '@/lib/crypto';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EncryptedExport {
  version: number;
  encrypted: true;
  exportedAt: string;
  data: string; // encrypted JSON string
}

type ExportMode = 'encrypted' | 'plaintext';

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { exportVault, notes } = useVault();
  const [mode, setMode] = useState<ExportMode>('encrypted');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const resetState = useCallback(() => {
    setMode('encrypted');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setIsExporting(false);
    setExported(false);
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetState]);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const data = exportVault();
    if (!data) {
      toast.error('No vault to export');
      return;
    }

    if (mode === 'encrypted') {
      if (!password) {
        toast.error('Please enter a password');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      
      if (mode === 'encrypted') {
        // Encrypt the entire export data
        const jsonData = JSON.stringify(data);
        const encryptedData = await encryptWithPassword(jsonData, password);
        
        const encryptedExport: EncryptedExport = {
          version: 1,
          encrypted: true,
          exportedAt: new Date().toISOString(),
          data: encryptedData,
        };
        
        downloadFile(JSON.stringify(encryptedExport, null, 2), `vault-notes-encrypted-${dateStr}.json`);
        toast.success(`Exported ${data.notes.length} notes (encrypted)`);
      } else {
        // Plaintext export
        downloadFile(JSON.stringify(data, null, 2), `vault-notes-${dateStr}.json`);
        toast.success(`Exported ${data.notes.length} notes`);
      }
      
      setExported(true);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export notes');
    } finally {
      setIsExporting(false);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const canExport = mode === 'plaintext' || (password.length >= 6 && passwordsMatch);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Export Notes</DialogTitle>
          <DialogDescription className="text-sm">
            Download your {notes.length} notes as a backup file.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2 space-y-4">
          {exported ? (
            // Success state
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Export complete!
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Your notes have been downloaded.
              </p>
              <button
                onClick={() => handleOpenChange(false)}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('encrypted')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${mode === 'encrypted' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${mode === 'encrypted' ? 'bg-accent/20' : 'bg-muted'}
                  `}>
                    <Lock className={`h-5 w-5 ${mode === 'encrypted' ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${mode === 'encrypted' ? 'text-accent' : 'text-foreground'}`}>
                      Encrypted
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Password protected
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('plaintext')}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                    ${mode === 'plaintext' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-accent/50'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${mode === 'plaintext' ? 'bg-accent/20' : 'bg-muted'}
                  `}>
                    <Unlock className={`h-5 w-5 ${mode === 'plaintext' ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${mode === 'plaintext' ? 'text-accent' : 'text-foreground'}`}>
                      Plaintext
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No encryption
                    </p>
                  </div>
                </button>
              </div>

              {/* Password fields for encrypted mode */}
              {mode === 'encrypted' && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Your export will be encrypted with this password</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`
                      w-full bg-background border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50
                      ${confirmPassword && !passwordsMatch ? 'border-destructive' : 'border-border focus:border-accent'}
                    `}
                  />
                  
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                  
                  {password && password.length < 6 && (
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  )}
                </div>
              )}

              {/* Warning for plaintext */}
              {mode === 'plaintext' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Plaintext export is not encrypted. Anyone with access to the file can read your notes.
                  </p>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting || !canExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export {notes.length} notes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
