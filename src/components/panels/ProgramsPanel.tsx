import React, { useState } from "react";
import { useApp } from "../../context";
import {
  ProgramKind,
  ProgramStatus,
  ProgramNote,
  LearningObjectStatus,
} from "../../types";
import { ProgramEventModal } from "../modals/ProgramEventModal";
import { generateId } from "../../utils";

type ActiveTab = ProgramKind | "objects-of-learning";

const isProgramKind = (tab: ActiveTab): tab is ProgramKind => {
  return tab !== "objects-of-learning";
};

const KINDS: { kind: ProgramKind; label: string; icon: string }[] = [
  { kind: "children-festival", label: "Children's Festivals", icon: "🎉" },
  { kind: "jy-intensive", label: "JY Intensives", icon: "⚡" },
  { kind: "study-circle", label: "Study Circles", icon: "📚" },
];

const STATUS_COLORS: Record<ProgramStatus, string> = {
  planned: "#3b82f6",
  ongoing: "#10b981",
  completed: "#6b7280",
  cancelled: "#ef4444",
};

const LEARNING_STATUS_COLORS: Record<LearningObjectStatus, string> = {
  active: "#10b981",
  completed: "#6b7280",
};

export const ProgramsPanel: React.FC = () => {
  const {
    programEvents,
    updateProgramEvent,
    deleteProgramEvent,
    learningObjects,
    addLearningObject,
    updateLearningObject,
    deleteLearningObject,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>("children-festival");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Objects of Learning state
  const [newStatement, setNewStatement] = useState("");
  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);
  const [editingObjNotes, setEditingObjNotes] = useState<
    Record<string, string>
  >({});
  const [deleteObjConfirmId, setDeleteObjConfirmId] = useState<string | null>(
    null,
  );

  const eventsForKind =
    activeTab !== "objects-of-learning"
      ? programEvents
          .filter((e) => e.kind === activeTab)
          .sort(
            (a, b) =>
              new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
          )
      : [];

  const sortedLearningObjects = [...learningObjects].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleAddNote = (eventId: string) => {
    const text = (newNoteText[eventId] ?? "").trim();
    if (!text) return;
    const event = programEvents.find((e) => e.id === eventId);
    if (!event) return;
    const note: ProgramNote = {
      id: generateId(),
      date: new Date().toISOString(),
      text,
    };
    updateProgramEvent(eventId, {
      trackingNotes: [...event.trackingNotes, note],
    });
    setNewNoteText((prev) => ({ ...prev, [eventId]: "" }));
  };

  const handleDeleteNote = (eventId: string, noteId: string) => {
    const event = programEvents.find((e) => e.id === eventId);
    if (!event) return;
    updateProgramEvent(eventId, {
      trackingNotes: event.trackingNotes.filter((n) => n.id !== noteId),
    });
  };

  const handleSaveReflections = (eventId: string, text: string) => {
    updateProgramEvent(eventId, { reflections: text });
  };

  const handleAddStatement = () => {
    const text = newStatement.trim();
    if (!text) return;
    addLearningObject({
      statement: text,
      status: "active",
      dateAdded: new Date().toISOString(),
    });
    setNewStatement("");
  };

  const handleToggleObjStatus = (id: string, current: LearningObjectStatus) => {
    updateLearningObject(id, {
      status: current === "active" ? "completed" : "active",
    });
  };

  const handleSaveObjNotes = (id: string) => {
    updateLearningObject(id, { notes: editingObjNotes[id] ?? "" });
    setExpandedObjId(null);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNoteDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentKindLabel = KINDS.find((k) => k.kind === activeTab)?.label ?? "";

  return (
    <div style={{ padding: "1rem", maxWidth: "860px", margin: "0 auto" }}>
      {/* Sub-tabs */}
      <div className="tabs" role="tablist" style={{ marginBottom: "1.25rem" }}>
        {KINDS.map(({ kind, label, icon }) => (
          <button
            key={kind}
            className={`tab ${activeTab === kind ? "tab--active" : ""}`}
            onClick={() => {
              setActiveTab(kind);
              setExpandedId(null);
            }}
            role="tab"
          >
            {icon} {label}
          </button>
        ))}
        <button
          className={`tab ${activeTab === "objects-of-learning" ? "tab--active" : ""}`}
          onClick={() => {
            setActiveTab("objects-of-learning");
            setExpandedId(null);
          }}
          role="tab"
        >
          🎯 Objects of Learning
        </button>
      </div>

      {/* ── Objects of Learning ── */}
      {activeTab === "objects-of-learning" ? (
        <ObjectsOfLearningTab
          learningObjects={sortedLearningObjects}
          newStatement={newStatement}
          setNewStatement={setNewStatement}
          expandedObjId={expandedObjId}
          setExpandedObjId={setExpandedObjId}
          editingObjNotes={editingObjNotes}
          setEditingObjNotes={setEditingObjNotes}
          deleteObjConfirmId={deleteObjConfirmId}
          setDeleteObjConfirmId={setDeleteObjConfirmId}
          onAddStatement={handleAddStatement}
          onToggleStatus={handleToggleObjStatus}
          onSaveNotes={handleSaveObjNotes}
          onDelete={deleteLearningObject}
          formatDate={formatDate}
          statusColors={LEARNING_STATUS_COLORS}
        />
      ) : (
        <>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {KINDS.find((k) => k.kind === activeTab)?.icon} {currentKindLabel}
              <span
                className="chip chip--muted"
                style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}
              >
                {eventsForKind.length}
              </span>
            </h3>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleOpenCreate}
            >
              + New {currentKindLabel.replace(/s$/, "")}
            </button>
          </div>

          {/* Empty state */}
          {eventsForKind.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--text-muted, #6b7280)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {KINDS.find((k) => k.kind === activeTab)?.icon}
              </div>
              <p>No {currentKindLabel.toLowerCase()} yet.</p>
              <button
                className="btn btn--primary btn--sm"
                onClick={handleOpenCreate}
                style={{ marginTop: "0.5rem" }}
              >
                Create the first one
              </button>
            </div>
          )}

          {/* Event cards */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {eventsForKind.map((event) => {
              const isExpanded = expandedId === event.id;
              const isDeleteConfirm = deleteConfirmId === event.id;

              return (
                <div
                  key={event.id}
                  className="panel__section"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  {/* Card header */}
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong style={{ fontSize: "1rem" }}>
                          {event.title}
                        </strong>
                        <span
                          style={{
                            background: STATUS_COLORS[event.status],
                            color: "white",
                            borderRadius: "999px",
                            padding: "0.15rem 0.55rem",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {event.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "0.35rem",
                          flexWrap: "wrap",
                          fontSize: "0.82rem",
                          color: "var(--text-muted, #6b7280)",
                        }}
                      >
                        <span>
                          📅{" "}
                          {event.endDate && event.endDate !== event.date
                            ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
                            : formatDate(event.date)}
                        </span>
                        {event.location && <span>📍 {event.location}</span>}
                        {event.team.length > 0 && (
                          <span>
                            👥{" "}
                            {event.team
                              .map(
                                (m) =>
                                  `${m.name}${m.role ? ` (${m.role})` : ""}`,
                              )
                              .join(", ")}
                          </span>
                        )}
                        {event.trackingNotes.length > 0 && (
                          <span>
                            🗒 {event.trackingNotes.length} note
                            {event.trackingNotes.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn--sm"
                        onClick={() => handleOpenEdit(event.id)}
                      >
                        Edit
                      </button>
                      {isDeleteConfirm ? (
                        <>
                          <button
                            className="btn btn--sm btn--danger"
                            onClick={() => {
                              deleteProgramEvent(event.id);
                              setDeleteConfirmId(null);
                              if (expandedId === event.id) setExpandedId(null);
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn--sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn--sm"
                          onClick={() => setDeleteConfirmId(event.id)}
                          style={{ color: "#ef4444" }}
                        >
                          Delete
                        </button>
                      )}
                      <span style={{ color: "var(--text-muted, #9ca3af)" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border, #e5e7eb)",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1.25rem",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "0.9rem",
                            }}
                          >
                            Reflections
                          </h4>
                          <ReflectionsEditor
                            value={event.reflections}
                            onSave={(text) =>
                              handleSaveReflections(event.id, text)
                            }
                          />
                        </div>

                        <div>
                          <h4
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "0.9rem",
                            }}
                          >
                            Tracking Notes
                          </h4>

                          <div
                            style={{
                              display: "flex",
                              gap: "0.4rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Add a note..."
                              value={newNoteText[event.id] ?? ""}
                              onChange={(e) =>
                                setNewNoteText((prev) => ({
                                  ...prev,
                                  [event.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddNote(event.id);
                                }
                              }}
                              style={{ flex: 1 }}
                            />
                            <button
                              className="btn btn--sm btn--primary"
                              onClick={() => handleAddNote(event.id)}
                              disabled={!(newNoteText[event.id] ?? "").trim()}
                            >
                              Add
                            </button>
                          </div>

                          {event.trackingNotes.length === 0 && (
                            <p
                              className="muted"
                              style={{ fontSize: "0.82rem" }}
                            >
                              No notes yet — type above to log something.
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                              maxHeight: "260px",
                              overflowY: "auto",
                            }}
                          >
                            {event.trackingNotes
                              .slice()
                              .reverse()
                              .map((note) => (
                                <div
                                  key={note.id}
                                  style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "flex-start",
                                    padding: "0.4rem 0.5rem",
                                    borderRadius: "6px",
                                    background:
                                      "var(--bg-subtle, rgba(0,0,0,0.04))",
                                  }}
                                >
                                  <span
                                    className="muted"
                                    style={{
                                      fontSize: "0.72rem",
                                      whiteSpace: "nowrap",
                                      paddingTop: "2px",
                                    }}
                                  >
                                    {formatNoteDate(note.date)}
                                  </span>
                                  <span
                                    style={{ flex: 1, fontSize: "0.85rem" }}
                                  >
                                    {note.text}
                                  </span>
                                  <button
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#9ca3af",
                                      fontSize: "0.75rem",
                                      padding: "0 2px",
                                      lineHeight: 1,
                                      flexShrink: 0,
                                    }}
                                    onClick={() =>
                                      handleDeleteNote(event.id, note.id)
                                    }
                                    title="Remove note"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      <p
                        className="muted"
                        style={{
                          fontSize: "0.72rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        Added {formatDate(event.dateAdded)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal */}
          {isProgramKind(activeTab) ? (
            <ProgramEventModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditingId(null);
              }}
              kind={activeTab}
              editingId={editingId}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

// ─── Objects of Learning sub-panel ───────────────────────────────────────────

interface ObjTabProps {
  learningObjects: ReturnType<typeof useApp>["learningObjects"];
  newStatement: string;
  setNewStatement: (v: string) => void;
  expandedObjId: string | null;
  setExpandedObjId: (id: string | null) => void;
  editingObjNotes: Record<string, string>;
  setEditingObjNotes: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  deleteObjConfirmId: string | null;
  setDeleteObjConfirmId: (id: string | null) => void;
  onAddStatement: () => void;
  onToggleStatus: (id: string, current: LearningObjectStatus) => void;
  onSaveNotes: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (iso: string) => string;
  statusColors: Record<LearningObjectStatus, string>;
}

const ObjectsOfLearningTab: React.FC<ObjTabProps> = ({
  learningObjects,
  newStatement,
  setNewStatement,
  expandedObjId,
  setExpandedObjId,
  editingObjNotes,
  setEditingObjNotes,
  deleteObjConfirmId,
  setDeleteObjConfirmId,
  onAddStatement,
  onToggleStatus,
  onSaveNotes,
  onDelete,
  formatDate,
  statusColors,
}) => {
  const activeCount = learningObjects.filter(
    (o) => o.status === "active",
  ).length;
  const completedCount = learningObjects.filter(
    (o) => o.status === "completed",
  ).length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <h3 style={{ margin: 0 }}>🎯 Objects of Learning</h3>
          {activeCount > 0 && (
            <span
              style={{
                background: statusColors.active,
                color: "white",
                borderRadius: "999px",
                padding: "0.15rem 0.6rem",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              {activeCount} active
            </span>
          )}
          {completedCount > 0 && (
            <span className="chip chip--muted" style={{ fontSize: "0.72rem" }}>
              {completedCount} completed
            </span>
          )}
        </div>
      </div>

      {/* Add statement */}
      <div
        className="panel__section"
        style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}
      >
        <label
          className="muted"
          style={{
            fontSize: "0.8rem",
            display: "block",
            marginBottom: "0.4rem",
          }}
        >
          Add an object of learning
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder='e.g. "We are learning how to raise capacity for home visits..."'
            value={newStatement}
            onChange={(e) => setNewStatement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddStatement();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={onAddStatement}
            disabled={!newStatement.trim()}
          >
            Add
          </button>
        </div>
      </div>

      {/* Empty state */}
      {learningObjects.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem 1rem",
            color: "var(--text-muted, #6b7280)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🎯</div>
          <p>No objects of learning yet.</p>
          <p className="muted" style={{ fontSize: "0.82rem" }}>
            Add a statement above describing what the community is learning
            about.
          </p>
        </div>
      )}

      {/* Statement list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {learningObjects.map((obj) => {
          const isExpanded = expandedObjId === obj.id;
          const isCompleted = obj.status === "completed";
          const isDeleteConfirm = deleteObjConfirmId === obj.id;
          const draftNotes = editingObjNotes[obj.id] ?? obj.notes ?? "";

          return (
            <div
              key={obj.id}
              className="panel__section"
              style={{
                padding: 0,
                overflow: "hidden",
                opacity: isCompleted ? 0.7 : 1,
              }}
            >
              {/* Row */}
              <div
                style={{
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                {/* Status toggle checkbox */}
                <button
                  title={isCompleted ? "Mark active" : "Mark completed"}
                  onClick={() => onToggleStatus(obj.id, obj.status)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: `2px solid ${statusColors[obj.status]}`,
                    background: isCompleted
                      ? statusColors.completed
                      : "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: 0,
                  }}
                >
                  {isCompleted ? "✓" : ""}
                </button>

                {/* Statement + meta */}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: "0.92rem",
                      textDecoration: isCompleted ? "line-through" : "none",
                      color: isCompleted
                        ? "var(--text-muted, #6b7280)"
                        : "inherit",
                    }}
                  >
                    {obj.statement}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginTop: "0.2rem",
                      fontSize: "0.75rem",
                      color: "var(--text-muted, #9ca3af)",
                    }}
                  >
                    <span>Added {formatDate(obj.dateAdded)}</span>
                    {obj.notes && (
                      <span style={{ fontStyle: "italic" }}>Has notes</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.35rem",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="btn btn--sm"
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedObjId(null);
                      } else {
                        setEditingObjNotes((prev) => ({
                          ...prev,
                          [obj.id]: obj.notes ?? "",
                        }));
                        setExpandedObjId(obj.id);
                      }
                    }}
                  >
                    {isExpanded ? "Close" : "Notes"}
                  </button>

                  {isDeleteConfirm ? (
                    <>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => {
                          onDelete(obj.id);
                          setDeleteObjConfirmId(null);
                          if (expandedObjId === obj.id) setExpandedObjId(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn--sm"
                        onClick={() => setDeleteObjConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn--sm"
                      onClick={() => setDeleteObjConfirmId(obj.id)}
                      style={{ color: "#ef4444" }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Notes expansion */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid var(--border, #e5e7eb)",
                    padding: "0.75rem 1rem",
                  }}
                >
                  <label className="muted" style={{ fontSize: "0.8rem" }}>
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    value={draftNotes}
                    onChange={(e) =>
                      setEditingObjNotes((prev) => ({
                        ...prev,
                        [obj.id]: e.target.value,
                      }))
                    }
                    placeholder="Additional context, progress, insights..."
                    style={{ width: "100%", marginTop: "0.35rem" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "0.4rem",
                    }}
                  >
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={() => onSaveNotes(obj.id)}
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Reflections editor with save button ─────────────────────────────────────

interface ReflectionsEditorProps {
  value: string;
  onSave: (text: string) => void;
}

const ReflectionsEditor: React.FC<ReflectionsEditorProps> = ({
  value,
  onSave,
}) => {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const isDirty = draft !== value;

  return (
    <div>
      <textarea
        rows={8}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your reflections here..."
        style={{ width: "100%", resize: "vertical" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "0.4rem",
        }}
      >
        {saved && (
          <span
            className="muted"
            style={{ fontSize: "0.8rem", marginRight: "0.5rem" }}
          >
            Saved ✓
          </span>
        )}
        <button
          className="btn btn--sm btn--primary"
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save
        </button>
      </div>
    </div>
  );
};
