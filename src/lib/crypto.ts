// Crypto utilities for end-to-end encryption using AES-GCM

export async function generateVaultKey(): Promise<string> {
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  return arrayBufferToBase64Url(keyBytes);
}

export function generateVaultId(): string {
  const idBytes = new Uint8Array(16);
  crypto.getRandomValues(idBytes);
  return arrayBufferToBase64Url(idBytes);
}

async function deriveKey(vaultKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyBuffer = base64UrlToArrayBuffer(vaultKey);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string, vaultKey: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(vaultKey, salt);

  const encodedText = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return arrayBufferToBase64Url(combined);
}

export async function decrypt(encryptedData: string, vaultKey: string): Promise<string> {
  const combined = base64UrlToArrayBuffer(encryptedData);
  const combinedArray = new Uint8Array(combined);

  const salt = combinedArray.slice(0, 16);
  const iv = combinedArray.slice(16, 28);
  const ciphertext = combinedArray.slice(28);

  const key = await deriveKey(vaultKey, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

function arrayBufferToBase64Url(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

// Password-based encryption for export files
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptWithPassword(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);

  const encodedText = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  return arrayBufferToBase64Url(combined);
}

export async function decryptWithPassword(encryptedData: string, password: string): Promise<string> {
  const combined = base64UrlToArrayBuffer(encryptedData);
  const combinedArray = new Uint8Array(combined);

  const salt = combinedArray.slice(0, 16);
  const iv = combinedArray.slice(16, 28);
  const ciphertext = combinedArray.slice(28);

  const key = await deriveKeyFromPassword(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
