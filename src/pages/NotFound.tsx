import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:p-8 md:p-16 flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <Logo className="mb-8 justify-center" />
        
        <h1 className="text-6xl sm:text-8xl font-bold text-muted-foreground/30 mb-4">404</h1>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </h2>
        
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
