# 🔐 Private Notes Vault

A secure, client-side encrypted notes application with a beautiful WYSIWYG editor. Your notes are encrypted locally before storage - no server ever sees your plaintext data.

![Private Notes Vault](https://img.shields.io/badge/Encryption-AES--256--GCM-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tiptap](https://img.shields.io/badge/Editor-Tiptap-purple)

## ✨ Features

### 🔒 Security First
- **Client-side encryption** - All notes are encrypted using AES-256-GCM before storage
- **Mnemonic phrase recovery** - 12-word recovery phrase for vault access
- **Zero-knowledge architecture** - Your plaintext data never leaves your device
- **IndexedDB storage** - Encrypted data stored locally in your browser

### 📤 Export & Import
- **Export notes** - Download all your notes as a JSON file (decrypted)
- **Import notes** - Load notes from a previously exported JSON file
- **Drag & drop** - Simply drag a JSON file onto the import area
- **Duplicate detection** - Automatically skips notes that already exist
- **Cross-device sync** - Move your notes between devices easily

### ✍️ WYSIWYG Markdown Editor
- **Live formatting** - See your formatting as you type (like Typora/Notion)
- **Markdown shortcuts** - Type naturally with familiar shortcuts:
  - `#` → Heading 1
  - `##` → Heading 2
  - `###` → Heading 3
  - `-` or `*` → Bullet list
  - `1.` → Numbered list
  - `>` → Blockquote
  - `**text**` → **Bold**
  - `*text*` → *Italic*
  - `` `code` `` → Inline code
  - ```` ``` ```` → Code block
- **Auto-save** - Notes save automatically as you type (500ms debounce)
- **View Source** - Access raw markdown anytime via menu

### 🎨 Beautiful Design
- **Warm cream aesthetic** - Easy on the eyes with olive/sage accents
- **Dark mode support** - Automatic theme switching
- **Responsive layout** - Works great on desktop and mobile
- **JetBrains Mono font** - Clean monospace typography

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/private-notes-vault.git
cd private-notes-vault

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Editor**: Tiptap (ProseMirror-based)
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Storage**: IndexedDB
- **Routing**: React Router

## 📁 Project Structure

```
src/
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui primitives
│   ├── TiptapEditor.tsx  # WYSIWYG editor
│   └── ...
├── contexts/        # React contexts (VaultContext)
├── hooks/           # Custom hooks
├── lib/             # Utilities
│   ├── crypto.ts    # Encryption/decryption
│   ├── storage.ts   # IndexedDB operations
│   ├── mnemonic.ts  # Recovery phrase generation
│   └── ...
├── pages/           # Route components
│   ├── Home.tsx
│   ├── CreateVault.tsx
│   ├── SignIn.tsx
│   ├── Vault.tsx
│   └── NoteEditor.tsx
└── index.css        # Global styles + Tiptap styling
```

## 🔐 How Encryption Works

1. **Vault Creation**: A random 256-bit key is generated and encoded as a 12-word mnemonic phrase
2. **Note Encryption**: Each note is encrypted with AES-256-GCM using the vault key
3. **Storage**: Only encrypted data is stored in IndexedDB
4. **Recovery**: The mnemonic phrase can regenerate the exact same key

```
User Input → Encrypt (AES-256-GCM) → IndexedDB
                    ↑
              Vault Key (from mnemonic)
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Tiptap](https://tiptap.dev/) - Headless editor framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons

---

**⚠️ Important**: Keep your 12-word recovery phrase safe! Without it, you cannot access your encrypted notes. There is no password reset or recovery option.
