import { Leaf } from 'lucide-react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Leaf className="h-6 w-6 text-accent" strokeWidth={1.5} />
    </div>
  );
}
