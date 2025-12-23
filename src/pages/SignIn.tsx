import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { validateMnemonic } from '@/lib/mnemonic';

export default function SignIn() {
  const navigate = useNavigate();
  const { signInWithMnemonic } = useVault();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleWordChange = (index: number, value: string) => {
    // Handle paste of full mnemonic
    if (value.includes(' ')) {
      const pastedWords = value.trim().toLowerCase().split(/\s+/);
      if (pastedWords.length >= 12) {
        setMnemonicWords(pastedWords.slice(0, 12));
        inputRefs.current[11]?.focus();
        return;
      }
    }
    
    const newWords = [...mnemonicWords];
    newWords[index] = value.toLowerCase().replace(/\s/g, '');
    setMnemonicWords(newWords);

    // Auto-advance to next input
    if (value && index < 11) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mnemonicWords[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filteredWords = mnemonicWords.map(w => w.trim()).filter(w => w);
    
    if (filteredWords.length !== 12) {
      toast.error('Please enter all 12 words');
      return;
    }

    if (!validateMnemonic(filteredWords)) {
      toast.error('Invalid recovery phrase. Please check your words.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signInWithMnemonic(filteredWords, rememberMe);
      if (success) {
        toast.success('Welcome back!');
        navigate('/vault');
      } else {
        toast.error('Failed to sign in');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const filledCount = mnemonicWords.filter(w => w.trim()).length;

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
          <span className="text-muted-foreground"># </span>Sign in
        </h1>
        
        <p className="text-muted-foreground text-sm mb-8">
          Enter your 12-word recovery phrase to access your vault.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mnemonic Grid */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Recovery Phrase
              </span>
              <span className="text-xs text-muted-foreground">
                {filledCount}/12 words
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {mnemonicWords.map((word, index) => (
                <div key={index} className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono w-5">
                    {index + 1}.
                  </span>
                  <input
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="word"
                    className="w-full bg-background border border-border rounded-md pl-8 pr-2 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent font-mono text-sm transition-all"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Tip: You can paste all 12 words at once into any field.
            </p>
          </div>

          {/* Remember Me Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${rememberMe 
                  ? 'bg-accent border-accent' 
                  : 'border-border hover:border-accent/50'
                }
              `}
            >
              {rememberMe && <Check className="h-3 w-3 text-accent-foreground" />}
            </button>
            <span className="text-sm text-foreground group-hover:text-accent transition-colors">
              Remember me on this device
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || filledCount < 12}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm sm:text-base hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to vault'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Don't have a vault yet?{' '}
            <Link to="/create" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
