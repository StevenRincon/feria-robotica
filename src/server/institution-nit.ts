export function normalizeInstitutionDane(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const input = value.trim();
    if (!/^\d{12}$/.test(input)) return null;

    return input;
}