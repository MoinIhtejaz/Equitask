export const COMMENT_ENCRYPTION_DISABLED_DEMO_ENV = "NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO";

export function isCommentEncryptionDisabledForDemo(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_COMMENT_ENCRYPTION_DEMO === "true";
}
