const aud = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const audCents = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
});

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0';
  return aud.format(value);
}

export function formatCurrencyDetail(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0.00';
  return audCents.format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function age(isoDob: string | null | undefined): number | null {
  if (!isoDob) return null;
  const dob = new Date(isoDob);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}
