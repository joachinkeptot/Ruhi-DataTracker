import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import { Activity, ActivityType } from "../../types";
import { notifyWarning } from "../../utils";

interface ActivityModalContentProps {
  editingActivityId: string | null;
  onClose: () => void;
}

export const ActivityModalContent: React.FC<ActivityModalContentProps> = ({
  editingActivityId,
  onClose,
}) => {
  const { people, activities, addActivity, updateActivity, updatePerson } = useApp();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [leader, setLeader] = useState("");
  const [activityParticipants, setActivityParticipants] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");

  useEffect(() => {
    if (editingActivityId) {
      const activity = activities.find((a) => a.id === editingActivityId);
      if (activity) {
        setName(activity.name);
        setActivityType(activity.type);
        setLeader(activity.facilitator || activity.leader || "");
        setNotes(activity.notes || "");
        setActivityParticipants(activity.participantIds || []);
      }
    } else {
      resetForm();
    }
  }, [editingActivityId, activities]);

  const resetForm = () => {
    setName("");
    setNotes("");
    setActivityType("");
    setLeader("");
    setActivityParticipants([]);
    setParticipantSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!activityType) {
      notifyWarning("Please select an activity type");
      return;
    }

    const activityData: Omit<Activity, "id"> = {
      name: name.trim(),
      type: activityType,
      leader: leader.trim() || undefined,
      facilitator: leader.trim() || undefined,
      notes: notes.trim() || undefined,
      participantIds: activityParticipants,
      materials: undefined,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      position: { x: Math.random() * 700, y: Math.random() * 400 },
      reflections: [],
    };

    if (editingActivityId) {
      const existingActivity = activities.find((a) => a.id === editingActivityId);
      if (existingActivity) {
        updateActivity(editingActivityId, {
          ...activityData,
          dateCreated: existingActivity.dateCreated,
          position: existingActivity.position,
          reflections: existingActivity.reflections,
        });

        const prevIds = new Set(existingActivity.participantIds || []);
        const nextIds = new Set(activityParticipants);

        prevIds.forEach((personId) => {
          if (!nextIds.has(personId)) {
            const person = people.find((p) => p.id === personId);
            if (!person) return;
            updatePerson(personId, {
              connectedActivities: person.connectedActivities.filter(
                (id) => id !== editingActivityId,
              ),
            });
          }
        });

        nextIds.forEach((personId) => {
          if (!prevIds.has(personId)) {
            const person = people.find((p) => p.id === personId);
            if (!person) return;
            updatePerson(personId, {
              connectedActivities: person.connectedActivities.includes(editingActivityId)
                ? person.connectedActivities
                : [...person.connectedActivities, editingActivityId],
            });
          }
        });
      }
    } else {
      const activityId = addActivity(activityData);
      activityParticipants.forEach((personId) => {
        const person = people.find((p) => p.id === personId);
        if (!person) return;
        const next = person.connectedActivities.includes(activityId)
          ? person.connectedActivities
          : [...person.connectedActivities, activityId];
        updatePerson(personId, { connectedActivities: next });
      });
    }

    resetForm();
    onClose();
  };

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(participantSearch.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <label className="muted">Activity Type</label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value as ActivityType)}
        >
          <option value="">Select type...</option>
          <option value="JY">JY</option>
          <option value="CC">CC</option>
          <option value="Study Circle">Study Circle</option>
          <option value="Devotional">Devotional</option>
        </select>
      </div>

      {activityType && (
        <div className="form-row">
          <input
            type="text"
            placeholder={
              activityType === "JY"
                ? "Animator name"
                : activityType === "CC"
                  ? "Teacher name"
                  : activityType === "Study Circle"
                    ? "Tutor name"
                    : "Leader name"
            }
            value={leader}
            onChange={(e) => setLeader(e.target.value)}
          />
        </div>
      )}

      <div className="form-row">
        <label className="muted">Participants</label>
        <input
          type="text"
          placeholder="Search people..."
          value={participantSearch}
          onChange={(e) => setParticipantSearch(e.target.value)}
        />
        <div className="chips" style={{ maxHeight: "160px", overflow: "auto" }}>
          {filteredPeople.map((person) => (
            <label key={person.id}>
              <input
                type="checkbox"
                checked={activityParticipants.includes(person.id)}
                onChange={() =>
                  setActivityParticipants((prev) =>
                    prev.includes(person.id)
                      ? prev.filter((id) => id !== person.id)
                      : [...prev, person.id],
                  )
                }
              />
              {person.name}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="modal__actions">
        <button type="button" className="btn" onClick={() => { resetForm(); onClose(); }}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary">
          {editingActivityId ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
};
