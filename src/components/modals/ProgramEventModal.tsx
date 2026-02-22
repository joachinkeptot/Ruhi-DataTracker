import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import {
  ProgramEvent,
  ProgramKind,
  ProgramStatus,
  ProgramTeamMember,
} from "../../types";

interface ProgramEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: ProgramKind;
  editingId?: string | null;
}

const KIND_LABELS: Record<ProgramKind, string> = {
  "children-festival": "Children's Festival",
  "jy-intensive": "JY Intensive",
  "study-circle": "Study Circle",
};

const STATUS_OPTIONS: ProgramStatus[] = [
  "planned",
  "ongoing",
  "completed",
  "cancelled",
];

const DEFAULT_ROLES: Record<ProgramKind, string> = {
  "children-festival": "Coordinating",
  "jy-intensive": "Coordinating",
  "study-circle": "Tutor",
};

export const ProgramEventModal: React.FC<ProgramEventModalProps> = ({
  isOpen,
  onClose,
  kind,
  editingId,
}) => {
  const { people, programEvents, addProgramEvent, updateProgramEvent } =
    useApp();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ProgramStatus>("planned");
  const [reflections, setReflections] = useState("");
  const [team, setTeam] = useState<ProgramTeamMember[]>([]);

  // Team member form
  const [memberPersonId, setMemberPersonId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState(DEFAULT_ROLES[kind]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingId) {
      const ev = programEvents.find((e) => e.id === editingId);
      if (ev) {
        setTitle(ev.title);
        setDate(ev.date);
        setEndDate(ev.endDate ?? "");
        setLocation(ev.location ?? "");
        setStatus(ev.status);
        setReflections(ev.reflections);
        setTeam(ev.team);
      }
    } else {
      setTitle("");
      setDate("");
      setEndDate("");
      setLocation("");
      setStatus("planned");
      setReflections("");
      setTeam([]);
    }
    setMemberPersonId("");
    setMemberName("");
    setMemberRole(DEFAULT_ROLES[kind]);
  }, [isOpen, editingId, kind]);

  const handlePersonSelect = (personId: string) => {
    setMemberPersonId(personId);
    if (personId) {
      const person = people.find((p) => p.id === personId);
      if (person) setMemberName(person.name);
    } else {
      setMemberName("");
    }
  };

  const addTeamMember = () => {
    const name = memberName.trim();
    if (!name) return;
    setTeam((prev) => [
      ...prev,
      {
        personId: memberPersonId || undefined,
        name,
        role: memberRole.trim() || DEFAULT_ROLES[kind],
      },
    ]);
    setMemberPersonId("");
    setMemberName("");
    setMemberRole(DEFAULT_ROLES[kind]);
  };

  const removeTeamMember = (index: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const payload: Omit<ProgramEvent, "id"> = {
      kind,
      title: title.trim(),
      date,
      endDate: endDate || undefined,
      location: location.trim() || undefined,
      status,
      team,
      reflections: reflections.trim(),
      trackingNotes: editingId
        ? (programEvents.find((e) => e.id === editingId)?.trackingNotes ?? [])
        : [],
      dateAdded: editingId
        ? (programEvents.find((e) => e.id === editingId)?.dateAdded ??
          new Date().toISOString())
        : new Date().toISOString(),
    };

    if (editingId) {
      updateProgramEvent(editingId, payload);
    } else {
      addProgramEvent(payload);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__content" style={{ maxWidth: "560px" }}>
        <h3>
          {editingId ? "Edit" : "New"} {KIND_LABELS[kind]}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="muted">Title *</label>
            <input
              type="text"
              placeholder={`e.g., Spring ${KIND_LABELS[kind]}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row" style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label className="muted">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="muted">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label className="muted">Location</label>
              <input
                type="text"
                placeholder="e.g., Community Center"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="muted">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProgramStatus)}
                style={{ width: "100%" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Section */}
          <div className="form-row">
            <label className="muted">Those Coordinating</label>
            {team.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                  marginBottom: "0.5rem",
                }}
              >
                {team.map((member, i) => (
                  <span
                    key={`${member.name}-${member.role ?? ""}-${i}`}
                    className="chip chip--muted"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <span>
                      {member.name}
                      {member.role ? ` · ${member.role}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(i)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0 2px",
                        lineHeight: 1,
                        color: "inherit",
                        opacity: 0.7,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}
            >
              <div style={{ flex: 2 }}>
                <label className="muted" style={{ fontSize: "0.75rem" }}>
                  From database
                </label>
                <select
                  value={memberPersonId}
                  onChange={(e) => handlePersonSelect(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">— or type a name →</option>
                  {people
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label className="muted" style={{ fontSize: "0.75rem" }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={memberName}
                  onChange={(e) => {
                    setMemberName(e.target.value);
                    if (e.target.value !== memberName) setMemberPersonId("");
                  }}
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ flex: 1.5 }}>
                <label className="muted" style={{ fontSize: "0.75rem" }}>
                  Role
                </label>
                <input
                  type="text"
                  placeholder={DEFAULT_ROLES[kind]}
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <button
                type="button"
                className="btn btn--sm btn--primary"
                onClick={addTeamMember}
                disabled={!memberName.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {/* Reflections */}
          <div className="form-row">
            <label className="muted">Reflections</label>
            <textarea
              rows={4}
              placeholder="Key learnings, what went well, what to improve..."
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
            />
          </div>

          <div className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {editingId ? "Save Changes" : `Create ${KIND_LABELS[kind]}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
