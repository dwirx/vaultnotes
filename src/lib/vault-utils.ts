/**
 * Utility functions for vault key management
 */

/**
 * Generate formatted text content for vault key download file
 * @param vaultId - The vault identifier
 * @param vaultKey - The secret vault key
 * @param mnemonic - Optional recovery phrase
 * @returns Formatted text content with security warning
 */
export function generateVaultKeyFileContent(vaultId: string, vaultKey: string, mnemonic?: string[]): string {
  const timestamp = new Date().toISOString();
  
  let content = `=====================================
LEAFVAULT - VAULT CREDENTIALS
=====================================

⚠️ WARNING: Keep this file secure!
These credentials are the ONLY way to access your encrypted notes.
If you lose them, your notes cannot be recovered.

Vault ID: ${vaultId}
Vault Key: ${vaultKey}`;

  if (mnemonic && mnemonic.length > 0) {
    content += `

Recovery Phrase (12 words):
${mnemonic.map((w, i) => `${(i + 1).toString().padStart(2, ' ')}. ${w}`).join('\n')}`;
  }

  content += `

Generated: ${timestamp}
=====================================`;

  return content;
}

/**
 * Generate filename for vault key download
 * @param vaultId - The vault identifier
 * @returns Filename in format "vault-key-{first8chars}.txt"
 */
export function generateVaultKeyFilename(vaultId: string): string {
  const prefix = vaultId.slice(0, 8);
  return `vault-key-${prefix}.txt`;
}

/**
 * Trigger a text file download in the browser
 * @param content - The text content to download
 * @param filename - The name of the file
 */
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers or when clipboard API is not available
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }
}
