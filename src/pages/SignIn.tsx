import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useVault();
  const [vaultId, setVaultId] = useState('');
  const [vaultKey, setVaultKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vaultId.trim() || !vaultKey.trim()) {
      toast.error('Please enter both vault ID and key');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signIn(vaultId.trim(), vaultKey.trim());
      if (success) {
        toast.success('Signed in successfully!');
        navigate('/vault');
      } else {
        toast.error('Failed to sign in');
      }
    } catch {
      toast.error('Invalid credentials or decryption failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-2xl">
        <Logo className="mb-4" />

        <h1 className="text-xl font-bold text-foreground mb-6">
          <span className="text-muted-foreground"># </span>Sign in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-foreground text-sm block mb-2">Vault ID</label>
            <input
              type="text"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
              placeholder="Enter your vault ID"
              className="w-full bg-card border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-foreground text-sm block mb-2">Vault Key</label>
            <input
              type="password"
              value={vaultKey}
              onChange={(e) => setVaultKey(e.target.value)}
              placeholder="Enter your vault key"
              className="w-full bg-card border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="text-accent hover:underline underline-offset-4 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : '→ Sign in'}
          </button>
        </form>

        <div className="pt-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
