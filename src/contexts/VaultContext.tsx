import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { encrypt, decrypt } from '@/lib/crypto';
import { generateMnemonic, mnemonicToVaultKey, mnemonicToVaultId } from '@/lib/mnemonic';
import { saveNote, getNotesByVault, deleteNote as deleteNoteFromDB, saveVault, Note } from '@/lib/storage';

interface VaultContextType {
  vaultId: string | null;
  vaultKey: string | null;
  mnemonic: string[] | null;
  notes: DecryptedNote[];
  isLoading: boolean;
  createVaultWithMnemonic: (mnemonic?: string[]) => Promise<{ vaultId: string; vaultKey: string; mnemonic: string[] }>;
  signInWithMnemonic: (mnemonic: string[]) => Promise<boolean>;
  signOut: () => void;
  createNote: () => Promise<string>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  getNote: (noteId: string) => DecryptedNote | undefined;
}

export interface DecryptedNote {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultId, setVaultId] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string[] | null>(null);
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotes = useCallback(async (vid: string, vkey: string) => {
    setIsLoading(true);
    try {
      const encryptedNotes = await getNotesByVault(vid);
      const decryptedNotes: DecryptedNote[] = [];

      for (const note of encryptedNotes) {
        try {
          const content = await decrypt(note.encryptedContent, vkey);
          decryptedNotes.push({
            id: note.id,
            content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          });
        } catch {
          console.error('Failed to decrypt note:', note.id);
        }
      }

      setNotes(decryptedNotes.sort((a, b) => b.updatedAt - a.updatedAt));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVaultWithMnemonic = useCallback(async (providedMnemonic?: string[]) => {
    const newMnemonic = providedMnemonic || generateMnemonic();
    const newVaultId = await mnemonicToVaultId(newMnemonic);
    const newVaultKey = await mnemonicToVaultKey(newMnemonic);

    await saveVault({ id: newVaultId, createdAt: Date.now() });

    setVaultId(newVaultId);
    setVaultKey(newVaultKey);
    setMnemonic(newMnemonic);
    setNotes([]);

    return { vaultId: newVaultId, vaultKey: newVaultKey, mnemonic: newMnemonic };
  }, []);

  const signInWithMnemonic = useCallback(async (mnemonicWords: string[]) => {
    try {
      const vid = await mnemonicToVaultId(mnemonicWords);
      const vkey = await mnemonicToVaultKey(mnemonicWords);
      
      setVaultId(vid);
      setVaultKey(vkey);
      setMnemonic(mnemonicWords);
      await loadNotes(vid, vkey);
      return true;
    } catch {
      return false;
    }
  }, [loadNotes]);

  const signOut = useCallback(() => {
    setVaultId(null);
    setVaultKey(null);
    setMnemonic(null);
    setNotes([]);
  }, []);

  const createNote = useCallback(async () => {
    if (!vaultId || !vaultKey) throw new Error('Not signed in');

    const noteId = crypto.randomUUID();
    const now = Date.now();
    const content = '';
    const encryptedContent = await encrypt(content, vaultKey);

    await saveNote({
      id: noteId,
      vaultId,
      encryptedContent,
      createdAt: now,
      updatedAt: now,
    });

    setNotes(prev => [{ id: noteId, content, createdAt: now, updatedAt: now }, ...prev]);

    return noteId;
  }, [vaultId, vaultKey]);

  const updateNote = useCallback(async (noteId: string, content: string) => {
    if (!vaultId || !vaultKey) throw new Error('Not signed in');

    const now = Date.now();
    const encryptedContent = await encrypt(content, vaultKey);

    const existingNote = notes.find(n => n.id === noteId);
    if (!existingNote) throw new Error('Note not found');

    await saveNote({
      id: noteId,
      vaultId,
      encryptedContent,
      createdAt: existingNote.createdAt,
      updatedAt: now,
    });

    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, content, updatedAt: now } : n))
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, [vaultId, vaultKey, notes]);

  const deleteNoteHandler = useCallback(async (noteId: string) => {
    await deleteNoteFromDB(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  const getNote = useCallback((noteId: string) => {
    return notes.find(n => n.id === noteId);
  }, [notes]);

  return (
    <VaultContext.Provider
      value={{
        vaultId,
        vaultKey,
        mnemonic,
        notes,
        isLoading,
        createVaultWithMnemonic,
        signInWithMnemonic,
        signOut,
        createNote,
        updateNote,
        deleteNote: deleteNoteHandler,
        getNote,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
