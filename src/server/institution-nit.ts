export function normalizeInstitutionNit(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const input = value.trim();
    if (!/^(?:\d{9,10}|\d{9}-\d|\d{3}(?:\.\d{3}){2}(?:-\d)?)$/.test(input)) return null;

    return input.replace(/\D/g, '');
}