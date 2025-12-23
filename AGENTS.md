# Repository Guidelines

## Project Structure & Module Organization

- `src/` — application code (Vite + React + TypeScript)
  - `src/pages/` — route-level screens (e.g. `SignIn.tsx`, `Vault.tsx`)
  - `src/components/` — app components (e.g. `Logo.tsx`, `NavLink.tsx`)
  - `src/components/ui/` — shadcn-ui primitives (kebab-case, generator-managed)
  - `src/contexts/`, `src/hooks/`, `src/lib/` — shared state, hooks, utilities (crypto/storage live here)
- `public/` — static assets copied as-is
- `index.html`, `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js` — app/config entry points
- `dist/` — production build output (generated)

## Build, Test, and Development Commands

- `npm i` — install dependencies (primary lockfile: `package-lock.json`)
- `npm run dev` — start dev server (Vite; defaults to `http://localhost:8080`)
- `npm run build` — production build to `dist/`
- `npm run build:dev` — development-mode build (useful for debugging build-only issues)
- `npm run preview` — serve `dist/` locally for a production-like check
- `npm run lint` — run ESLint across the repo

## Coding Style & Naming Conventions

- Prefer small, focused PRs; avoid drive-by reformatting.
- Use `@/` imports for `src/` (configured in `vite.config.ts` / `tsconfig.json`).
- React components use `PascalCase` filenames in `src/components/` and `src/pages/`.
- Keep shadcn-ui files in `src/components/ui/` and follow existing kebab-case naming.
- Styling is Tailwind-first; keep global CSS changes in `src/index.css` minimal.

## Testing Guidelines

- No automated test runner is configured yet (no `test` script). Validate changes via `npm run dev` and by exercising affected routes/components.
- If introducing tests, prefer Vitest + Testing Library and name files `*.test.ts(x)` near the code they cover.

## Commit & Pull Request Guidelines

- Existing history uses short, imperative subject lines (e.g. “Introduce …”). Keep commit subjects concise and action-oriented.
- PRs should explain the “why”, list notable behavior/UI changes, and include screenshots for UI updates.
- Before requesting review, ensure `npm run lint` and `npm run build` succeed.

## Security & Data Handling

- Notes are encrypted client-side (`src/lib/crypto.ts`) and stored in IndexedDB (`src/lib/storage.ts`).
- Never commit real vault keys, exported vault data, or decrypted note content; avoid logging plaintext during debugging.
