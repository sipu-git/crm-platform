export function formatFullName(firstName?: string | null, lastName?: string | null): string {
    return [firstName, lastName]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part))
        .join(" ");
}