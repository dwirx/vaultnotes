import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVault } from '@/contexts/VaultContext';
import { Logo } from '@/components/Logo';
import { TiptapEditor } from '@/components/TiptapEditor';
import { ArrowLeft, Trash2, Check, MoreVertical, Code, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function NoteEditor() {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { vaultId, vaultKey, getNote, updateNote, deleteNote } = useVault();

  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vaultId || !vaultKey) {
      navigate('/');
      return;
    }

    if (noteId) {
      const note = getNote(noteId);
      if (note) {
        setContent(note.content);
        setInitialContent(note.content);
      }
    }
  }, [vaultId, vaultKey, noteId, getNote, navigate]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveNote = useCallback(async (newContent: string) => {
    if (!noteId) return;

    setIsSaving(true);
    try {
      await updateNote(noteId, newContent);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [noteId, updateNote]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 500);
  }, [saveNote]);

  const handleDelete = async () => {
    if (!noteId) return;

    if (window.confirm('Delete this note? This cannot be undone.')) {
      try {
        await deleteNote(noteId);
        toast.success('Note deleted');
        navigate('/vault');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Markdown copied to clipboard');
      setShowSourceDialog(false);
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (!vaultId || !vaultKey) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="px-4 py-3 sm:px-8 md:px-16">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/vault" 
                className="text-muted-foreground hover:text-foreground p-2 -ml-2 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Logo />
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              <span className="text-xs text-muted-foreground mr-2">
                {isSaving ? (
                  'Saving...'
                ) : showSaved ? (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                ) : null}
              </span>

              {/* Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-20">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowSourceDialog(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Code className="h-4 w-4" />
                      View Source
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 px-4 py-4 sm:px-8 sm:py-6 md:px-16">
        <div className="max-w-4xl mx-auto h-full">
          <TiptapEditor
            content={initialContent}
            onChange={handleContentChange}
            placeholder="Start writing...

Use markdown shortcuts:
# Heading 1
## Heading 2
- Bullet list
1. Numbered list
> Quote
**bold** *italic* `code`"
            autoFocus
          />
        </div>
      </div>

      {/* Markdown Source Dialog */}
      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Markdown Source</span>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">
            <pre className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap break-words">
              {content || '(empty)'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
