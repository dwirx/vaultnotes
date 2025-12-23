import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { Copy, Check, ArrowLeft, RefreshCw, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { generateMnemonic, mnemonicToString } from '@/lib/mnemonic';
import { generateVaultKeyFileContent, generateVaultKeyFilename, downloadTextFile } from '@/lib/vault-utils';

export default function CreateVault() {
  const navigate = useNavigate();
  const { createVaultWithMnemonic } = useVault();
  const [mnemonic, setMnemonic] = useState<string[] | null>(null);
  const [credentials, setCredentials] = useState<{ vaultId: string; vaultKey: string } | null>(null);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleGenerateMnemonic = () => {
    setMnemonic(generateMnemonic());
    setConfirmed(false);
  };

  const handleCreate = async () => {
    if (!mnemonic) return;
    
    setIsCreating(true);
    try {
      const creds = await createVaultWithMnemonic(mnemonic);
      setCredentials(creds);
      toast.success('Vault created!');
    } catch {
      toast.error('Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  const copyMnemonic = async () => {
    if (!mnemonic) return;
    await navigator.clipboard.writeText(mnemonicToString(mnemonic));
    setCopiedMnemonic(true);
    setTimeout(() => setCopiedMnemonic(false), 2000);
    toast.success('Recovery phrase copied!');
  };

  const handleDownload = () => {
    if (!credentials || !mnemonic) return;
    const content = generateVaultKeyFileContent(credentials.vaultId, credentials.vaultKey, mnemonic);
    const filename = generateVaultKeyFilename(credentials.vaultId);
    downloadTextFile(content, filename);
    toast.success('Backup file downloaded!');
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8 sm:py-12 md:px-16">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground p-2 -ml-2 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Logo />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          <span className="text-muted-foreground"># </span>Create new vault
        </h1>

        {!mnemonic ? (
          // Step 1: Introduction
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm sm:text-base">
              Create a new encrypted vault to store your notes securely.
            </p>

            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h3 className="font-medium text-foreground mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono">1.</span>
                  Generate a 12-word recovery phrase
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono">2.</span>
                  Write it down and keep it safe
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-mono">3.</span>
                  Use it to access your vault anytime
                </li>
              </ul>
            </div>

            <button
              onClick={handleGenerateMnemonic}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm sm:text-base hover:bg-accent/90 transition-colors"
            >
              Generate recovery phrase
            </button>
          </div>
        ) : !credentials ? (
          // Step 2: Show mnemonic
          <div className="space-y-6">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Write these words down!</p>
                <p className="text-xs text-destructive/80 mt-1">
                  This is the only way to access your vault. If you lose it, your notes cannot be recovered.
                </p>
              </div>
            </div>

            {/* Mnemonic Display */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Your Recovery Phrase
                </span>
                <button
                  onClick={handleGenerateMnemonic}
                  className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded transition-colors"
                  title="Generate new phrase"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {mnemonic.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-background border border-border px-3 py-2.5 rounded-md"
                  >
                    <span className="text-muted-foreground text-xs font-mono w-5">{index + 1}.</span>
                    <span className="text-foreground font-mono text-sm">{word}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={copyMnemonic}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm transition-colors"
              >
                {copiedMnemonic ? (
                  <>
                    <Check className="h-4 w-4 text-accent" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>

            {/* Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent rounded"
              />
              <span className="text-sm text-foreground">
                I have written down my recovery phrase and understand it cannot be recovered if lost.
              </span>
            </label>

            <button
              onClick={handleCreate}
              disabled={isCreating || !confirmed}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm sm:text-base hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating vault...
                </>
              ) : (
                'Create vault'
              )}
            </button>
          </div>
        ) : (
          // Step 3: Success
          <div className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-accent mb-4">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Vault created!</h2>
              <p className="text-sm text-muted-foreground">
                Your encrypted vault is ready to use.
              </p>
            </div>

            {/* Recovery Phrase Summary */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
                Your Recovery Phrase
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {mnemonic.map((word, index) => (
                  <div
                    key={index}
                    className="text-xs bg-muted px-2 py-1.5 rounded font-mono text-center"
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Download Backup */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border hover:bg-muted text-foreground rounded-md text-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              Download backup file
            </button>

            {/* Continue Button */}
            <button
              onClick={() => navigate('/vault')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm sm:text-base hover:bg-accent/90 transition-colors"
            >
              Open my vault
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
