// IndiFolks treats each booking as one calendar day in India.
// Store/read the same local day even when MongoDB serializes UTC timestamps.
const IST_OFFSET_MINUTES = 330;
const MS_PER_DAY = 86_400_000;
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
});

export function indiaDayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const values = Object.fromEntries(dateFormatter.formatToParts(date)
    .filter(part => ['year', 'month', 'day'].includes(part.type))
    .map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dayRange(dayKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey || '')) return null;
  const [year, month, day] = dayKey.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MINUTES * 60_000);
  if (indiaDayKey(start) !== dayKey) return null;
  return { start, end: new Date(start.getTime() + MS_PER_DAY) };
}

export function requestedIndiaDay(value) {
  // New calendar submits YYYY-MM-DD; legacy clients may submit ISO timestamps.
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dayRange(value) ? value : null;
  }
  return indiaDayKey(value);
}

export function bookingDateForDay(dayKey) {
  const range = dayRange(dayKey);
  // Noon IST ensures a day-only booking remains on the chosen date.
  return range ? new Date(range.start.getTime() + MS_PER_DAY / 2) : null;
}

export function monthRange(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(monthKey || '')) return null;
  const [year, month] = monthKey.split('-').map(Number);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  const first = dayRange(`${monthKey}-01`);
  const next = new Date(Date.UTC(year, month, 1) - IST_OFFSET_MINUTES * 60_000);
  return first ? { start: first.start, end: next } : null;
}
