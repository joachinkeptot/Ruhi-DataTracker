import React, { useState, useMemo } from "react";
import { useApp } from "../../context";
import { Reflection, ReflectionType } from "../../types";
import { notifyWarning } from "../../utils";

export const Reflections: React.FC = () => {
  const { reflections, addReflection, updateReflection, deleteReflection } =
    useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ReflectionType | "">("");
  const [selectedReflection, setSelectedReflection] =
    useState<Reflection | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Form states for new/edit reflection
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReflectionType>("meeting");
  const [date, setDate] = useState("");
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [tags, setTags] = useState("");

  const reflectionTypes: ReflectionType[] = [
    "meeting",
    "call",
    "one-on-one",
    "team",
    "other",
  ];

  // Filter and search reflections
  const filteredReflections = useMemo(() => {
    let filtered = [...reflections].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Search by title, notes, or attendees
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.notes.toLowerCase().includes(query) ||
          r.attendees?.some((a) => a.toLowerCase().includes(query)),
      );
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    return filtered;
  }, [reflections, searchQuery, filterType]);

  const resetForm = () => {
    setTitle("");
    setType("meeting");
    setDate("");
    setAttendees("");
    setNotes("");
    setKeyTakeaways("");
    setNextSteps("");
    setFollowUpDate("");
    setTags("");
  };

  const handleAdd = () => {
    if (!title.trim() || !date || !notes.trim()) {
      notifyWarning("Please fill in title, date, and notes");
      return;
    }

    addReflection({
      title: title.trim(),
      type,
      date,
      attendees: attendees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      notes: notes.trim(),
      keyTakeaways: keyTakeaways.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
      followUpDate: followUpDate || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = () => {
    if (!selectedReflection) return;
    if (!title.trim() || !date || !notes.trim()) {
      notifyWarning("Please fill in title, date, and notes");
      return;
    }

    updateReflection(selectedReflection.id, {
      title: title.trim(),
      type,
      date,
      attendees: attendees
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      notes: notes.trim(),
      keyTakeaways: keyTakeaways.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
      followUpDate: followUpDate || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    resetForm();
    setShowEditForm(false);
    setSelectedReflection(null);
  };

  const handleSelectReflection = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setTitle(reflection.title);
    setType(reflection.type);
    setDate(reflection.date);
    setAttendees(reflection.attendees?.join(", ") || "");
    setNotes(reflection.notes);
    setKeyTakeaways(reflection.keyTakeaways || "");
    setNextSteps(reflection.nextSteps || "");
    setFollowUpDate(reflection.followUpDate || "");
    setTags(reflection.tags?.join(", ") || "");
    setShowEditForm(false);
  };

  const handleStartEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this reflection?")) {
      deleteReflection(id);
      if (selectedReflection?.id === id) {
        setSelectedReflection(null);
      }
    }
  };

  const getTypeIcon = (reflectionType: ReflectionType) => {
    const icons: Record<ReflectionType, string> = {
      meeting: "📅",
      call: "📞",
      "one-on-one": "👤",
      team: "👥",
      other: "📝",
    };
    return icons[reflectionType];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="panel panel--split">
      <div
        className="panel__section panel__section--list"
        style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Reflections</h2>

          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-row" style={{ marginBottom: "1rem" }}>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType((e.target.value as ReflectionType) || "")
              }
            >
              <option value="">All Types</option>
              {reflectionTypes.map((t) => (
                <option key={t} value={t}>
                  {getTypeIcon(t)}{" "}
                  {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn--primary"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
              setShowEditForm(false);
              setSelectedReflection(null);
            }}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            + New Reflection
          </button>
        </div>

        <div className="list" style={{ overflowY: "auto", flex: 1 }}>
          {filteredReflections.length === 0 ? (
            <div
              className="hint"
              style={{ padding: "1rem", textAlign: "center" }}
            >
              No reflections yet
            </div>
          ) : (
            filteredReflections.map((reflection) => (
              <div
                key={reflection.id}
                className={`list-item ${selectedReflection?.id === reflection.id ? "list-item--active" : ""}`}
                onClick={() => {
                  handleSelectReflection(reflection);
                  setShowEditForm(false);
                }}
                style={{
                  borderLeft:
                    selectedReflection?.id === reflection.id
                      ? "4px solid #3b82f6"
                      : "4px solid transparent",
                }}
              >
                <div className="list-item__title">
                  {getTypeIcon(reflection.type)} {reflection.title}
                </div>
                <div className="list-item__meta">
                  {formatDate(reflection.date)}
                </div>
                {reflection.attendees && reflection.attendees.length > 0 && (
                  <div className="list-item__subtitle">
                    with {reflection.attendees.join(", ")}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className="panel__section panel__section--detail"
        style={{ overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        {showAddForm ? (
          <div style={{ padding: "1rem", overflowY: "auto", height: "100%" }}>
            <h3>New Reflection</h3>
            <div className="form-row">
              <label className="muted">Title *</label>
              <input
                type="text"
                placeholder="e.g., Meeting with JY coordinators"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReflectionType)}
              >
                {reflectionTypes.map((t) => (
                  <option key={t} value={t}>
                    {getTypeIcon(t)}{" "}
                    {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="muted">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Attendees</label>
              <input
                type="text"
                placeholder="Comma-separated names"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Reflection Notes *</label>
              <textarea
                placeholder="What happened? What was discussed? What did you observe?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>

            <div className="form-row">
              <label className="muted">Key Takeaways</label>
              <textarea
                placeholder="Main points, learnings, or insights..."
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-row">
              <label className="muted">Next Steps</label>
              <textarea
                placeholder="Action items or follow-up plans..."
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <label className="muted">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Tags</label>
              <input
                type="text"
                placeholder="Comma-separated tags (e.g., important, urgent, planning)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem" }}>
              <button
                className="btn btn--primary"
                onClick={handleAdd}
                style={{ flex: 1 }}
              >
                Save Reflection
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : showEditForm && selectedReflection ? (
          <div style={{ padding: "1rem", overflowY: "auto", height: "100%" }}>
            <h3>Edit Reflection</h3>
            <div className="form-row">
              <label className="muted">Title *</label>
              <input
                type="text"
                placeholder="e.g., Meeting with JY coordinators"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReflectionType)}
              >
                {reflectionTypes.map((t) => (
                  <option key={t} value={t}>
                    {getTypeIcon(t)}{" "}
                    {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="muted">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Attendees</label>
              <input
                type="text"
                placeholder="Comma-separated names"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Reflection Notes *</label>
              <textarea
                placeholder="What happened? What was discussed? What did you observe?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>

            <div className="form-row">
              <label className="muted">Key Takeaways</label>
              <textarea
                placeholder="Main points, learnings, or insights..."
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-row">
              <label className="muted">Next Steps</label>
              <textarea
                placeholder="Action items or follow-up plans..."
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-row">
              <label className="muted">Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label className="muted">Tags</label>
              <input
                type="text"
                placeholder="Comma-separated tags (e.g., important, urgent, planning)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "2rem" }}>
              <button
                className="btn btn--primary"
                onClick={handleEdit}
                style={{ flex: 1 }}
              >
                Update Reflection
              </button>
              <button
                className="btn btn--danger"
                onClick={() => handleDelete(selectedReflection.id)}
                style={{ flex: 1 }}
              >
                Delete
              </button>
              <button
                className="btn"
                onClick={() => {
                  setShowEditForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedReflection ? (
          <div style={{ padding: "1rem", overflowY: "auto", height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                  {getTypeIcon(selectedReflection.type)}{" "}
                  {selectedReflection.title}
                </h3>
                <div className="muted" style={{ fontSize: "0.9rem" }}>
                  {formatDate(selectedReflection.date)}
                </div>
              </div>
              <button className="btn btn--sm" onClick={handleStartEdit}>
                Edit
              </button>
            </div>

            {selectedReflection.attendees &&
              selectedReflection.attendees.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                    Attendees
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {selectedReflection.attendees.map((attendee) => (
                      <span key={attendee} className="chip">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Notes</h4>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {selectedReflection.notes}
              </p>
            </div>

            {selectedReflection.keyTakeaways && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                  Key Takeaways
                </h4>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {selectedReflection.keyTakeaways}
                </p>
              </div>
            )}

            {selectedReflection.nextSteps && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                  Next Steps
                </h4>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {selectedReflection.nextSteps}
                </p>
              </div>
            )}

            {selectedReflection.followUpDate && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                  Follow-up Date
                </h4>
                <p style={{ margin: 0 }}>
                  {formatDate(selectedReflection.followUpDate)}
                </p>
              </div>
            )}

            {selectedReflection.tags && selectedReflection.tags.length > 0 && (
              <div>
                <h4 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Tags</h4>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {selectedReflection.tags.map((tag) => (
                    <span key={tag} className="chip chip--muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
            <p>
              Select a reflection to view details or create a new one to get
              started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
