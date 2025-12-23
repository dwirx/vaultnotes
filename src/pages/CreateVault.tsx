import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateVault() {
  const navigate = useNavigate();
  const { createVault } = useVault();
  const [credentials, setCredentials] = useState<{ vaultId: string; vaultKey: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const creds = await createVault();
      setCredentials(creds);
      toast.success('Vault created successfully!');
    } catch {
      toast.error('Failed to create vault');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'id' | 'key') => {
    await navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    toast.success(`Vault ${type} copied!`);
  };

  const handleContinue = () => {
    navigate('/vault');
  };

  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-2xl">
        <Logo className="mb-4" />

        <h1 className="text-xl font-bold text-foreground mb-6">
          <span className="text-muted-foreground"># </span>Create new vault
        </h1>

        {!credentials ? (
          <div className="space-y-6">
            <p className="text-foreground">
              Create a new encrypted vault to store your notes securely.
            </p>

            <p className="text-muted-foreground text-sm">
              You'll receive a <strong>Vault ID</strong> and a <strong>Vault Key</strong>. 
              Save them somewhere safe — the key cannot be recovered if lost.
            </p>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="text-accent hover:underline underline-offset-4 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : '→ Create vault'}
            </button>

            <div className="pt-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-card border border-border rounded-sm">
              <p className="text-destructive text-sm font-bold mb-4">
                ⚠ Save these credentials now! The vault key cannot be recovered.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm block mb-1">Vault ID</label>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
                      {credentials.vaultId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credentials.vaultId, 'id')}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      {copiedId ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground text-sm block mb-1">Vault Key (secret)</label>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
                      {credentials.vaultKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(credentials.vaultKey, 'key')}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      {copiedKey ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="text-accent hover:underline underline-offset-4"
            >
              → Continue to vault
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
