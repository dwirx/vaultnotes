import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, Download, LogOut, ChevronDown, ChevronUp, Key, Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import {
  copyToClipboard,
  generateVaultKeyFileContent,
  generateVaultKeyFilename,
  downloadTextFile,
} from '@/lib/vault-utils';
import { mnemonicToString } from '@/lib/mnemonic';
import { useVault } from '@/contexts/VaultContext';
import { ImportDialog } from './ImportDialog';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  vaultKey: string;
  mnemonic: string[] | null;
  onSignOut: () => void;
}

export function AccountDialog({
  open,
  onOpenChange,
  vaultId,
  vaultKey,
  mnemonic,
  onSignOut,
}: AccountDialogProps) {
  const { exportVault, notes } = useVault();
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleCopyMnemonic = async () => {
    if (!mnemonic) return;
    const success = await copyToClipboard(mnemonicToString(mnemonic));
    if (success) {
      setCopiedMnemonic(true);
      setTimeout(() => setCopiedMnemonic(false), 2000);
      toast.success('Recovery phrase copied!');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    try {
      const content = generateVaultKeyFileContent(vaultId, vaultKey, mnemonic || undefined);
      const filename = generateVaultKeyFilename(vaultId);
      downloadTextFile(content, filename);
      toast.success('Backup downloaded!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleExportNotes = () => {
    try {
      const data = exportVault();
      if (!data) {
        toast.error('No vault to export');
        return;
      }
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-notes-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${data.notes.length} notes`);
    } catch {
      toast.error('Failed to export notes');
    }
  };

  const handleSignOut = () => {
    onOpenChange(false);
    onSignOut();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Account</DialogTitle>
          <DialogDescription className="text-sm">
            Manage your vault and recovery phrase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Recovery Phrase Section */}
          {mnemonic && (
            <div className="bg-muted/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Key className="h-4 w-4 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Recovery Phrase</p>
                    <p className="text-xs text-muted-foreground">12 words</p>
                  </div>
                </div>
                {showMnemonic ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              
              {showMnemonic && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    {mnemonic.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-background px-2 py-1.5 rounded text-xs"
                      >
                        <span className="text-muted-foreground w-4">{index + 1}.</span>
                        <span className="text-foreground font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCopyMnemonic}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-background hover:bg-muted text-foreground rounded-md text-xs transition-colors"
                  >
                    {copiedMnemonic ? (
                      <>
                        <Check className="h-3 w-3 text-accent" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy phrase
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg text-left transition-colors"
            >
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Download backup</p>
                <p className="text-xs text-muted-foreground">Save your recovery phrase to a file</p>
              </div>
            </button>

            {/* Export Notes */}
            <button
              onClick={handleExportNotes}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg text-left transition-colors"
            >
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Export notes</p>
                <p className="text-xs text-muted-foreground">
                  Download all {notes.length} notes as JSON
                </p>
              </div>
            </button>

            {/* Import Notes */}
            <button
              onClick={() => setImportDialogOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg text-left transition-colors"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Import notes</p>
                <p className="text-xs text-muted-foreground">
                  Load notes from a JSON file
                </p>
              </div>
            </button>

            <div className="border-t border-border my-2" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 rounded-lg text-left transition-colors group"
            >
              <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-destructive">Sign out</p>
                <p className="text-xs text-muted-foreground">Lock your vault</p>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Import Dialog */}
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </Dialog>
  );
}
