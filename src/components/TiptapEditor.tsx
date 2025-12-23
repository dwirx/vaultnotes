import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

// Helper to get markdown from editor
function getMarkdown(editor: Editor): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storage = editor.storage as any;
  return storage.markdown?.getMarkdown?.() ?? '';
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  autoFocus = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        codeBlock: {},
        code: {},
        bold: {},
        italic: {},
        strike: {},
      }),
      Placeholder.configure({
        placeholder,
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: true,
      }),
    ],
    content: '',
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const md = getMarkdown(editor);
      onChange(md);
    },
  });

  // Load initial content
  useEffect(() => {
    if (editor && content) {
      const currentContent = getMarkdown(editor);
      if (currentContent !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-120px)] flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="w-full h-full min-h-[calc(100vh-120px)] border-none outline-none [&_.tiptap]:outline-none [&_.tiptap]:border-none [&>div]:outline-none [&>div]:border-none [&_.ProseMirror]:border-none [&_.ProseMirror]:outline-none"
    />
  );
}
