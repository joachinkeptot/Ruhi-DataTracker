import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import { parseICS, CalendarEvent } from "../../utils/icsParser";

function groupByMonth(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = event.start.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries());
}

export const CalendarView: React.FC = () => {
  const { calendarUrl, setCalendarUrl } = useApp();
  const [urlInput, setUrlInput] = useState(calendarUrl || "");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const fetchCalendar = async (url: string) => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      setEvents(parseICS(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (calendarUrl) fetchCalendar(calendarUrl);
  }, [calendarUrl]);

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setCalendarUrl(trimmed);
  };

  const now = new Date();
  const visibleEvents = showPast
    ? events
    : events.filter((e) => {
        const end = e.end ?? e.start;
        return end >= now;
      });
  const grouped = groupByMonth(visibleEvents);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Bahai Calendar</h2>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        Upcoming holy days and community events
      </p>

      {/* URL input */}
      <div className="panel__section" style={{ marginBottom: "1.5rem" }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}
        >
          Google Calendar iCal URL
        </label>
        <p
          className="muted"
          style={{ marginBottom: "0.5rem", fontSize: "0.82rem" }}
        >
          In Google Calendar: open calendar settings → "Secret address in iCal
          format" → copy and paste here.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="url"
            className="form-input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="https://calendar.google.com/calendar/ical/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveUrl()}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSaveUrl}
            disabled={!urlInput.trim()}
          >
            Save & Fetch
          </button>
          {calendarUrl && (
            <button
              className="btn btn--sm"
              onClick={() => fetchCalendar(calendarUrl)}
              disabled={loading}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="muted">Loading calendar...</p>}

      {/* Error */}
      {error && (
        <div
          style={{
            color: "var(--danger)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span>Error: {error}</span>
          <button
            className="btn btn--sm"
            onClick={() => calendarUrl && fetchCalendar(calendarUrl)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Events */}
      {!loading && !error && events.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "0.75rem",
            }}
          >
            <button
              className="btn btn--sm"
              onClick={() => setShowPast((p) => !p)}
            >
              {showPast ? "Hide past events" : "Show past events"}
            </button>
          </div>

          {visibleEvents.length === 0 ? (
            <p className="muted">No upcoming events.</p>
          ) : (
            grouped.map(([month, monthEvents]) => (
              <div key={month} style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {month}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {monthEvents.map((event) => (
                    <div
                      key={event.id}
                      className="panel__section"
                      style={{ padding: "0.75rem 1rem" }}
                    >
                      <div style={{ fontWeight: 600 }}>{event.summary}</div>
                      <div
                        className="muted"
                        style={{ fontSize: "0.82rem", marginTop: "0.2rem" }}
                      >
                        {event.start.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {event.end &&
                          event.end.toDateString() !==
                            event.start.toDateString() && (
                            <span>
                              {" "}
                              –{" "}
                              {event.end.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                      </div>
                      {event.description && (
                        <div
                          style={{
                            fontSize: "0.82rem",
                            marginTop: "0.4rem",
                            color: "var(--text)",
                          }}
                        >
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Empty states */}
      {!loading && !error && calendarUrl && events.length === 0 && (
        <p className="muted">No events found in this calendar.</p>
      )}
      {!calendarUrl && !loading && (
        <p className="muted">
          Paste a Google Calendar iCal URL above to see events.
        </p>
      )}
    </div>
  );
};
