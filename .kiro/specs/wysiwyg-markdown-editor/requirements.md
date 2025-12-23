# Requirements Document

## Introduction

Fitur ini mengubah NoteEditor dari textarea biasa menjadi WYSIWYG (What You See Is What You Get) editor menggunakan Tiptap. Editor akan memberikan pengalaman seperti Typora/Notion dimana markdown shortcuts langsung dirender sebagai rich text (misalnya ketik `#` lalu spasi langsung jadi Heading tanpa tanda `#` terlihat). Data tetap disimpan sebagai Markdown string untuk kompatibilitas dengan sistem yang ada.

## Glossary

- **WYSIWYG_Editor**: Editor berbasis Tiptap yang menampilkan rich text formatting secara langsung saat user mengetik markdown shortcuts
- **Markdown_Shortcuts**: Kombinasi karakter yang otomatis dikonversi menjadi formatting (contoh: `#` → Heading, `**` → Bold)
- **Tiptap**: Library rich text editor berbasis ProseMirror untuk React
- **Note_Content**: String markdown yang disimpan di storage dan dienkripsi
- **ProseMirror**: Framework editor yang menjadi basis Tiptap, menggunakan class `.ProseMirror` untuk styling

## Requirements

### Requirement 1: WYSIWYG Editor Integration

**User Story:** As a user, I want to write notes with live formatting preview, so that I can see how my content looks without switching between edit and preview modes.

#### Acceptance Criteria

1. WHEN the NoteEditor page loads, THE WYSIWYG_Editor SHALL render a Tiptap editor instance as the main writing area
2. WHEN a note is loaded, THE WYSIWYG_Editor SHALL import the markdown content and display it as rich text
3. WHEN the user types content, THE WYSIWYG_Editor SHALL display formatted text in real-time
4. THE WYSIWYG_Editor SHALL replace the existing textarea and preview panel with a single unified editor area

### Requirement 2: Markdown Shortcuts Support

**User Story:** As a user, I want to use familiar markdown shortcuts while typing, so that I can format text quickly without using toolbar buttons.

#### Acceptance Criteria

1. WHEN the user types `#` followed by space, THE WYSIWYG_Editor SHALL convert the line to Heading 1 and hide the `#` character
2. WHEN the user types `##` followed by space, THE WYSIWYG_Editor SHALL convert the line to Heading 2 and hide the `##` characters
3. WHEN the user types `###` followed by space, THE WYSIWYG_Editor SHALL convert the line to Heading 3 and hide the `###` characters
4. WHEN the user types `-` or `*` followed by space, THE WYSIWYG_Editor SHALL convert the line to a bullet list item
5. WHEN the user types `1.` followed by space, THE WYSIWYG_Editor SHALL convert the line to a numbered list item
6. WHEN the user types `>` followed by space, THE WYSIWYG_Editor SHALL convert the line to a blockquote
7. WHEN the user wraps text with `**`, THE WYSIWYG_Editor SHALL render the text as bold
8. WHEN the user wraps text with `*` or `_`, THE WYSIWYG_Editor SHALL render the text as italic
9. WHEN the user wraps text with backticks, THE WYSIWYG_Editor SHALL render the text as inline code
10. WHEN the user types triple backticks followed by Enter, THE WYSIWYG_Editor SHALL create a code block

### Requirement 3: Markdown Storage Compatibility

**User Story:** As a user, I want my notes to be stored as markdown, so that they remain compatible with the existing search and encryption system.

#### Acceptance Criteria

1. WHEN the editor content changes, THE WYSIWYG_Editor SHALL export content as markdown string for storage
2. WHEN saving a note, THE Note_Content SHALL be stored as a valid markdown string
3. WHEN searching notes, THE existing search functionality SHALL continue to work with markdown content
4. THE WYSIWYG_Editor SHALL preserve markdown formatting during round-trip (load → edit → save → load)

### Requirement 4: Autosave Functionality

**User Story:** As a user, I want my notes to be automatically saved as I type, so that I don't lose my work.

#### Acceptance Criteria

1. WHEN the editor content changes, THE WYSIWYG_Editor SHALL trigger autosave after 500ms debounce
2. WHILE saving is in progress, THE system SHALL display "Saving..." indicator
3. WHEN save completes successfully, THE system SHALL display "Saved" indicator for 2 seconds
4. IF save fails, THEN THE system SHALL display an error toast notification

### Requirement 5: Responsive Layout

**User Story:** As a user, I want the editor to work well on both desktop and mobile devices, so that I can write notes anywhere.

#### Acceptance Criteria

1. THE WYSIWYG_Editor SHALL display with comfortable padding and line-height on all screen sizes
2. WHILE on desktop, THE WYSIWYG_Editor SHALL have a max-width container with horizontal padding
3. WHILE on mobile, THE WYSIWYG_Editor SHALL use full width with appropriate padding
4. THE WYSIWYG_Editor SHALL maintain proper caret positioning when heading sizes change
5. THE ProseMirror styling SHALL ensure headings, lists, blockquotes, and code blocks display correctly

### Requirement 6: Editor Placeholder

**User Story:** As a user, I want to see helpful placeholder text when the editor is empty, so that I know where to start writing.

#### Acceptance Criteria

1. WHEN the editor is empty, THE WYSIWYG_Editor SHALL display a placeholder text
2. WHEN the user starts typing, THE placeholder SHALL disappear
3. THE placeholder text SHALL provide guidance on available formatting options

### Requirement 7: View Markdown Source (Optional)

**User Story:** As a power user, I want to view and copy the raw markdown source, so that I can use it in other applications.

#### Acceptance Criteria

1. WHEN the user opens the menu, THE system SHALL provide a "View Source" or "Copy Markdown" option
2. WHEN the user selects this option, THE system SHALL display the raw markdown content in a dialog
3. THE dialog SHALL allow the user to copy the markdown to clipboard
