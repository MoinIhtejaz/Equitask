export const SECURE_CREDENTIAL_ORIGIN_ERROR =
  "Secure HTTPS connection required before sending credentials.";

export function getSecureCredentialOriginError(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname, protocol } = window.location;
  const isLocalDevelopment = hostname === "localhost" || hostname === "127.0.0.1";

  if (protocol === "https:" || isLocalDevelopment) {
    return null;
  }

  return SECURE_CREDENTIAL_ORIGIN_ERROR;
}
