const DEFAULT_COUNTRY_CODE = "91";

export function toWhatsAppNumber(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.length > 10) {
    return digitsOnly;
  }
  if (digitsOnly.length === 10) {
    return `${DEFAULT_COUNTRY_CODE}${digitsOnly}`;
  }

  return digitsOnly;
}