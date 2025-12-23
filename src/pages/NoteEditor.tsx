import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function NoteEditor() {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { vaultId, vaultKey, getNote, updateNote, deleteNote } = useVault();

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!vaultId || !vaultKey) {
      navigate('/');
      return;
    }

    if (noteId) {
      const note = getNote(noteId);
      if (note) {
        setContent(note.content);
      }
    }
  }, [vaultId, vaultKey, noteId, getNote, navigate]);

  const saveNote = useCallback(async (newContent: string) => {
    if (!noteId) return;

    setIsSaving(true);
    try {
      await updateNote(noteId, newContent);
      setLastSaved(new Date());
    } catch {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, updateNote]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 500);
  };

  const handleDelete = async () => {
    if (!noteId) return;

    if (window.confirm('Delete this note? This cannot be undone.')) {
      try {
        await deleteNote(noteId);
        toast.success('Note deleted');
        navigate('/vault');
      } catch {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveNote(content);
  };

  if (!vaultId || !vaultKey) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="p-4 md:px-16 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/vault" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Logo />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-xs">
            {isSaving ? (
              'Saving...'
            ) : lastSaved ? (
              `Saved ${lastSaved.toLocaleTimeString()}`
            ) : (
              ''
            )}
          </span>
          <button
            onClick={handleManualSave}
            className="text-muted-foreground hover:text-foreground"
            title="Save now"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
            title="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 md:px-16 md:py-8">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing in Markdown..."
          className="w-full h-full min-h-[calc(100vh-200px)] bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none font-mono text-sm leading-relaxed"
          autoFocus
        />
      </div>
    </main>
  );
}
