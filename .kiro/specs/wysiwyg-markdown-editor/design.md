# Design Document: WYSIWYG Markdown Editor

## Overview

Fitur ini mengimplementasikan WYSIWYG editor menggunakan Tiptap untuk menggantikan textarea biasa di NoteEditor. Editor akan memberikan pengalaman seperti Typora/Notion dimana markdown shortcuts langsung dirender sebagai rich text. Data tetap disimpan sebagai Markdown string untuk kompatibilitas dengan sistem enkripsi dan pencarian yang ada.

### Key Design Decisions

1. **Tiptap sebagai editor framework** - Dipilih karena:
   - Berbasis ProseMirror yang mature dan battle-tested
   - Dukungan React yang baik via `@tiptap/react`
   - StarterKit menyediakan markdown shortcuts out-of-the-box
   - Package `tiptap-markdown` untuk import/export markdown

2. **Markdown sebagai storage format** - Tetap menyimpan markdown string karena:
   - Kompatibel dengan sistem enkripsi yang ada
   - Pencarian notes tetap berfungsi
   - Portable dan human-readable

3. **Single editor area** - Menghilangkan split edit/preview karena:
   - WYSIWYG sudah menampilkan formatting langsung
   - UX lebih sederhana dan fokus

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NoteEditor Page                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │                   Header                         │    │
│  │  [← Back] [Logo]              [Status] [Menu ▼] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              TiptapEditor Component              │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │           EditorContent                  │    │    │
│  │  │  (ProseMirror with markdown shortcuts)   │    │    │
│  │  │                                          │    │    │
│  │  │  # Heading 1                             │    │    │
│  │  │  ## Heading 2                            │    │    │
│  │  │  - Bullet list                           │    │    │
│  │  │  > Blockquote                            │    │    │
│  │  │  **bold** *italic* `code`                │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         MarkdownSourceDialog (optional)          │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     load      ┌──────────────┐     parse      ┌──────────────┐
│   Storage    │ ───────────▶  │   Markdown   │ ───────────▶   │   Tiptap     │
│  (encrypted) │               │    String    │                │   Editor     │
└──────────────┘               └──────────────┘                └──────────────┘
       ▲                                                              │
       │                                                              │
       │         save           ┌──────────────┐     serialize       │
       └─────────────────────── │   Markdown   │ ◀───────────────────┘
                                │    String    │      (onUpdate)
                                └──────────────┘
```

## Components and Interfaces

### TiptapEditor Component

```typescript
interface TiptapEditorProps {
  content: string;              // Initial markdown content
  onChange: (markdown: string) => void;  // Callback when content changes
  placeholder?: string;         // Placeholder text
  autoFocus?: boolean;          // Auto focus on mount
}

// Component akan menggunakan:
// - useEditor hook dari @tiptap/react
// - StarterKit untuk extensions dasar
// - Markdown extension untuk import/export
// - Placeholder extension untuk placeholder text
```

### Editor Extensions Configuration

```typescript
const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: true,
    orderedList: true,
    blockquote: true,
    codeBlock: true,
    code: true,
    bold: true,
    italic: true,
    strike: true,
  }),
  Markdown.configure({
    html: false,
    tightLists: true,
    bulletListMarker: '-',
    transformPastedText: true,
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
  }),
];
```

### MarkdownSourceDialog Component

```typescript
interface MarkdownSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markdown: string;
  onCopy: () => void;
}
```

## Data Models

### Note Content Flow

```typescript
// Existing Note interface (unchanged)
interface Note {
  id: string;
  content: string;  // Markdown string
  createdAt: number;
  updatedAt: number;
}

// Editor state conversion
type EditorContent = {
  // Tiptap internal JSON format
  type: 'doc';
  content: ProseMirrorNode[];
};

// Conversion functions
function markdownToEditor(markdown: string): EditorContent;
function editorToMarkdown(editor: Editor): string;
```

### Autosave State

```typescript
interface AutosaveState {
  isSaving: boolean;
  showSaved: boolean;
  lastSavedAt: number | null;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Markdown Round-Trip Consistency

*For any* valid markdown string that can be represented in the editor, loading it into the editor and then exporting it back to markdown SHALL produce semantically equivalent markdown content.

**Validates: Requirements 1.2, 3.1, 3.2, 3.4**

This is a round-trip property that ensures:
- Markdown is correctly parsed into editor format
- Editor content is correctly serialized back to markdown
- No data loss during the conversion cycle

Note: "Semantically equivalent" means the rendered output would be the same, even if whitespace or formatting details differ slightly (e.g., `*italic*` vs `_italic_`).

### Property 2: Search Compatibility

*For any* note content stored as markdown, the existing search functionality SHALL find the note when searching for any text substring contained within the markdown content.

**Validates: Requirements 3.3**

This property ensures backward compatibility with the existing search system that operates on markdown strings.

## Error Handling

### Editor Initialization Errors

| Error Condition | Handling Strategy |
|-----------------|-------------------|
| Tiptap fails to initialize | Display fallback textarea with error message |
| Invalid markdown content | Load empty editor, log warning |
| Extension loading fails | Use minimal StarterKit without failing extensions |

### Save Errors

| Error Condition | Handling Strategy |
|-----------------|-------------------|
| Save fails (storage error) | Show error toast, retry on next change |
| Encryption fails | Show error toast, keep content in editor |
| Network timeout (if applicable) | Show warning, queue for retry |

### Content Conversion Errors

| Error Condition | Handling Strategy |
|-----------------|-------------------|
| Markdown parse error | Load raw content as plain text |
| Export to markdown fails | Fallback to HTML export, then convert |

## Testing Strategy

### Unit Tests

Unit tests akan fokus pada:
- Component rendering (TiptapEditor mounts correctly)
- Placeholder visibility (shown when empty, hidden when content exists)
- Menu interactions (View Source option appears)
- Dialog functionality (copy to clipboard works)
- Autosave debounce timing

### Property-Based Tests

Property-based tests akan menggunakan **fast-check** library untuk TypeScript/JavaScript.

Konfigurasi:
- Minimum 100 iterations per property test
- Generate random markdown strings dengan berbagai formatting
- Test round-trip consistency dan search compatibility

**Test Annotations:**
- **Feature: wysiwyg-markdown-editor, Property 1: Markdown Round-Trip Consistency**
- **Feature: wysiwyg-markdown-editor, Property 2: Search Compatibility**

### Integration Tests

- Load note → edit → save → reload → verify content preserved
- Search notes after editing with WYSIWYG editor
- Autosave triggers correctly after content changes

### Manual Testing Checklist

- [ ] Markdown shortcuts work (# → H1, ## → H2, etc.)
- [ ] Bold/italic/code formatting works
- [ ] Lists (bullet and numbered) work
- [ ] Blockquotes work
- [ ] Code blocks work
- [ ] Responsive layout on mobile and desktop
- [ ] Placeholder appears when empty
- [ ] View Source dialog shows correct markdown
