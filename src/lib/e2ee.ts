export const COMMENT_ENCRYPTION_VERSION = "e2ee-v1";
export const COMMENT_ENCRYPTION_ALGORITHM = "AES-GCM-256";

export interface EncryptedCommentPayload {
  ciphertext: string;
  iv: string;
  encryptionVersion: typeof COMMENT_ENCRYPTION_VERSION;
  encryptionAlgorithm: typeof COMMENT_ENCRYPTION_ALGORITHM;
  keyId: string;
}

const KEY_PREFIX = "equitask:e2ee:team-key:";
const AES_GCM = "AES-GCM";
const IV_BYTES = 12;

function assertBrowserCrypto(): Crypto {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Browser encryption is not available on this device.");
  }

  return window.crypto;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window.btoa(binary);
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = window.atob(value.trim());
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function storageKey(teamId: string): string {
  return `${KEY_PREFIX}${teamId}`;
}

export function getCommentKeyId(teamId: string): string {
  return `team-key:${teamId}:${COMMENT_ENCRYPTION_VERSION}`;
}

async function importTeamKey(base64Key: string): Promise<CryptoKey> {
  const cryptoApi = assertBrowserCrypto();

  return cryptoApi.subtle.importKey(
    "raw",
    base64ToArrayBuffer(base64Key),
    { name: AES_GCM },
    true,
    ["encrypt", "decrypt"]
  );
}

async function generateTeamKey(): Promise<{ key: CryptoKey; exported: string }> {
  const cryptoApi = assertBrowserCrypto();
  const key = await cryptoApi.subtle.generateKey({ name: AES_GCM, length: 256 }, true, [
    "encrypt",
    "decrypt"
  ]);
  const exported = arrayBufferToBase64(await cryptoApi.subtle.exportKey("raw", key));

  return { key, exported };
}

export async function getOrCreateTeamKey(teamId: string): Promise<CryptoKey> {
  const existing = window.localStorage.getItem(storageKey(teamId));

  if (existing) {
    return importTeamKey(existing);
  }

  const generated = await generateTeamKey();
  window.localStorage.setItem(storageKey(teamId), generated.exported);
  return generated.key;
}

export async function exportTeamKey(teamId: string): Promise<string> {
  await getOrCreateTeamKey(teamId);
  return window.localStorage.getItem(storageKey(teamId)) ?? "";
}

export async function saveImportedTeamKey(teamId: string, base64Key: string): Promise<void> {
  await importTeamKey(base64Key);
  window.localStorage.setItem(storageKey(teamId), base64Key.trim());
}

export async function encryptCommentForTeam(
  teamId: string,
  plaintext: string
): Promise<EncryptedCommentPayload> {
  const cryptoApi = assertBrowserCrypto();
  const key = await getOrCreateTeamKey(teamId);
  const iv = cryptoApi.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await cryptoApi.subtle.encrypt({ name: AES_GCM, iv }, key, encoded);

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
    encryptionVersion: COMMENT_ENCRYPTION_VERSION,
    encryptionAlgorithm: COMMENT_ENCRYPTION_ALGORITHM,
    keyId: getCommentKeyId(teamId)
  };
}

export async function decryptCommentForTeam(
  teamId: string,
  payload: Pick<EncryptedCommentPayload, "ciphertext" | "iv">
): Promise<string> {
  const key = await getOrCreateTeamKey(teamId);
  const plaintext = await assertBrowserCrypto().subtle.decrypt(
    { name: AES_GCM, iv: base64ToArrayBuffer(payload.iv) },
    key,
    base64ToArrayBuffer(payload.ciphertext)
  );

  return new TextDecoder().decode(plaintext);
}
