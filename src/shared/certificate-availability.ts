export const CERTIFICATES_AVAILABLE_AT = Date.parse('2026-11-07T00:00:00-05:00');
export const CERTIFICATE_AVAILABILITY_MESSAGE = 'Se habilitará próximamente. Los certificados estarán disponibles desde el 7 de noviembre de 2026.';

export function areCertificatesAvailable(now = Date.now()): boolean {
    return now >= CERTIFICATES_AVAILABLE_AT;
}