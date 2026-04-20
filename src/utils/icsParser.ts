export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end?: Date;
  description?: string;
}

/**
 * Parses a raw .ics (iCalendar) string into CalendarEvent objects.
 * Handles line folding (CRLF + space/tab continuation).
 * Supports DTSTART with date-only, datetime, and timezone formats.
 */
export function parseICS(text: string): CalendarEvent[] {
  // Unfold continuation lines (RFC 5545: CRLF + space/tab = continuation)
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events: CalendarEvent[] = [];
  let current: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT") {
      if (current?.summary && current?.start) {
        events.push({
          id: current.id ?? Math.random().toString(36).slice(2),
          summary: current.summary,
          start: current.start,
          end: current.end,
          description: current.description,
        });
      }
      current = null;
    } else if (current !== null) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).toUpperCase();
      const value = line.slice(colonIdx + 1);

      if (key === "SUMMARY") {
        current.summary = value.trim();
      } else if (key.startsWith("DTSTART")) {
        current.start = parseICSDate(value);
      } else if (key.startsWith("DTEND")) {
        current.end = parseICSDate(value);
      } else if (key === "DESCRIPTION") {
        current.description = value
          .replace(/\\n/g, "\n")
          .replace(/\\,/g, ",")
          .replace(/\\;/g, ";")
          .trim();
      } else if (key === "UID") {
        current.id = value.trim();
      }
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function parseICSDate(value: string): Date {
  // Strip trailing Z (UTC marker) then remove T separator
  const clean = value.replace(/Z$/, "").replace("T", "");
  if (clean.length === 8) {
    // DATE only: YYYYMMDD
    const y = parseInt(clean.slice(0, 4), 10);
    const mo = parseInt(clean.slice(4, 6), 10) - 1;
    const d = parseInt(clean.slice(6, 8), 10);
    return new Date(y, mo, d);
  }
  // DATETIME: YYYYMMDDHHMMSS (14 chars)
  const y = parseInt(clean.slice(0, 4), 10);
  const mo = parseInt(clean.slice(4, 6), 10) - 1;
  const d = parseInt(clean.slice(6, 8), 10);
  const h = parseInt(clean.slice(8, 10) || "0", 10);
  const mi = parseInt(clean.slice(10, 12) || "0", 10);
  return new Date(y, mo, d, h, mi);
}
