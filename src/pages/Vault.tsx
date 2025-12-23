import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { Plus, FileText, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Vault() {
  const navigate = useNavigate();
  const { vaultId, vaultKey, notes, isLoading, createNote, signOut } = useVault();

  useEffect(() => {
    if (!vaultId || !vaultKey) {
      navigate('/');
    }
  }, [vaultId, vaultKey, navigate]);

  const handleNewNote = async () => {
    try {
      const noteId = await createNote();
      navigate(`/vault/note/${noteId}`);
    } catch {
      toast.error('Failed to create note');
    }
  };

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out');
    navigate('/');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotePreview = (content: string) => {
    const firstLine = content.split('\n')[0] || 'Untitled';
    return firstLine.slice(0, 50) + (firstLine.length > 50 ? '...' : '');
  };

  if (!vaultId || !vaultKey) return null;

  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Logo />
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-2">
          <span className="text-muted-foreground"># </span>Your notes
        </h1>

        <p className="text-muted-foreground text-sm mb-8">
          Vault: <code className="text-foreground">{vaultId.slice(0, 8)}...</code>
        </p>

        <button
          onClick={handleNewNote}
          className="text-accent hover:underline underline-offset-4 mb-8 inline-flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> New note
        </button>

        {isLoading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Create your first one!</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <Link
                key={note.id}
                to={`/vault/note/${note.id}`}
                className="block p-3 border border-border rounded-sm hover:bg-card transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm truncate">
                      {getNotePreview(note.content) || 'Empty note'}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
