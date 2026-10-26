/**
 * Time-zone helpers.
 *
 * Birth details are entered in local civil time. Vedic calculations need the
 * exact UTC instant plus the geographic coordinates, so we resolve the zone
 * offset (including historical DST) through the browser's Intl database.
 * Everything here is deterministic and offline.
 */

export interface BirthInput {
  name: string;
  /** ISO calendar date: YYYY-MM-DD */
  date: string;
  /** 24h clock: HH:mm */
  time: string;
  /** IANA zone, e.g. Asia/Kolkata */
  timeZone: string;
  latitude: number;
  longitude: number;
  /** Place name for display only. */
  place: string;
  /** True when the user does not know the exact minute. */
  timeUnknown?: boolean;
  gender?: 'female' | 'male' | 'other' | 'unspecified';
  relation?: string;
}

/** Offset of a zone from UTC, in minutes, at a given instant. */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  let hour = get('hour');
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
  return (asUtc - instant.getTime()) / 60_000;
}

/** Convert local civil date/time in a zone to a UTC Date. Handles DST edges. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0, 0);
  const firstGuess = new Date(naive - zoneOffsetMinutes(new Date(naive), timeZone) * 60_000);
  const refined = new Date(naive - zoneOffsetMinutes(firstGuess, timeZone) * 60_000);
  return refined;
}

export function utcToZonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: get('hour') === '24' ? 0 : Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: get('weekday'),
  };
}

/** Minutes east of UTC at the birth instant (used when displaying details). */
export function birthOffsetMinutes(birth: BirthInput): number {
  const instant = zonedToUtc(birth.date, birth.time, birth.timeZone);
  return zoneOffsetMinutes(instant, birth.timeZone);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatLocalDateTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

export function formatLocalTime(instant: Date | null, timeZone: string): string {
  if (!instant) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

/** A local-midnight instant for the civil date of `instant` in `timeZone`. */
export function startOfZonedDay(instant: Date, timeZone: string): Date {
  const p = utcToZonedParts(instant, timeZone);
  return zonedToUtc(
    `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`,
    '00:00',
    timeZone,
  );
}

export function addDays(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * 86_400_000);
}

export function isoDate(instant: Date, timeZone: string): string {
  const p = utcToZonedParts(instant, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Weekday index with Sunday = 0, evaluated in the given zone. */
export function zonedWeekday(instant: Date, timeZone: string): number {
  const name = utcToZonedParts(instant, timeZone).weekday;
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
}
