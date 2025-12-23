import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-2xl">
        <Logo className="mb-4" />

        <h1 className="text-xl font-bold text-foreground mb-6">
          <span className="text-muted-foreground"># </span>LeafVault
        </h1>

        <p className="text-foreground mb-2">
          End to end encrypted offline markdown notes.
        </p>

        <p className="text-foreground mb-8">
          No AI. Privately yours.
        </p>

        <div className="space-y-2 mb-8">
          <Link to="/create" className="block text-accent hover:underline underline-offset-4">
            <span className="font-bold">Create</span> new vault
          </Link>
          <Link to="/signin" className="block text-accent hover:underline underline-offset-4">
            <span className="font-bold">Sign in</span> to existing vault
          </Link>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          100% free to use. No limits. No catch.
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Your vault key never leaves your device or gets sent to the server — it's only used to encrypt updates before they're sent, so no one except you can read what you write.
        </p>

        <p className="text-muted-foreground text-sm">
          A clean-room implementation inspired by encrypted note apps.
        </p>
      </div>
    </main>
  );
}
