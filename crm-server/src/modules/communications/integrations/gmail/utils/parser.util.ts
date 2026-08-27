// Add near the top, alongside other imports
export function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf-8');
      }
    }
    // fallback: recurse into nested multipart
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return '';
}

/** Pull just the email address out of a "Name <email@x.com>" From header. */
export function parseFromEmail(fromHeader: string): string {
  const match = fromHeader.match(/<(.+)>/);
  return (match ? match[1] : fromHeader).trim().toLowerCase();
}