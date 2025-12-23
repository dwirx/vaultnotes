import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Shield, Lock, Smartphone, Loader2 } from 'lucide-react';
import { useVault } from '@/contexts/VaultContext';

export default function Home() {
  const navigate = useNavigate();
  const { vaultId, isRestoring } = useVault();

  // Redirect to vault if already signed in
  useEffect(() => {
    if (!isRestoring && vaultId) {
      navigate('/vault');
    }
  }, [vaultId, isRestoring, navigate]);

  // Show loading while restoring session
  if (isRestoring) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center sm:text-left sm:mx-0">
          <Logo className="mb-6 justify-center sm:justify-start" />

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-muted-foreground"># </span>LeafVault
          </h1>

          <p className="text-foreground text-base sm:text-lg md:text-xl mb-2">
            End-to-end encrypted offline markdown notes.
          </p>

          <p className="text-accent text-sm sm:text-base font-medium mb-8">
            No AI. Privately yours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12">
            <Link 
              to="/create" 
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm sm:text-base hover:bg-accent/90 transition-colors"
            >
              Create new vault
            </Link>
            <Link 
              to="/signin" 
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground rounded-md font-medium text-sm sm:text-base hover:bg-muted transition-colors"
            >
              Sign in with recovery phrase
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-8 sm:px-8 sm:py-12 md:px-16 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center sm:text-left p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-3">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">12-Word Recovery</h3>
              <p className="text-muted-foreground text-sm">
                Access your vault with just your recovery phrase. No email, no password to remember.
              </p>
            </div>

            <div className="text-center sm:text-left p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-3">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Client-Side Encryption</h3>
              <p className="text-muted-foreground text-sm">
                Your notes are encrypted before they leave your device. Only you can read them.
              </p>
            </div>

            <div className="text-center sm:text-left p-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-3">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Works Everywhere</h3>
              <p className="text-muted-foreground text-sm">
                Access your notes from any device. Works offline with local storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-8 sm:px-8 sm:py-12 md:px-16">
        <div className="max-w-3xl mx-auto text-center sm:text-left sm:mx-0">
          <p className="text-muted-foreground text-xs sm:text-sm mb-4">
            100% free to use. No limits. No catch.
          </p>

          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Your recovery phrase never leaves your device — it's only used locally to encrypt and decrypt your notes.
          </p>
        </div>
      </div>
    </main>
  );
}
