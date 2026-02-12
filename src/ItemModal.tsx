import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import {
  Person,
  Activity,
  Category,
  AgeGroup,
  EmploymentStatus,
  ParticipationStatus,
  ActivityType,
} from "./types";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPersonId: string | null;
  onAddFamily?: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  editingPersonId,
  onAddFamily,
}) => {
  const { people, activities, families, addPerson, updatePerson, addActivity } =
    useApp();

  const [itemType, setItemType] = useState<"people" | "activities">("people");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");

  // Person fields
  const [categories, setCategories] = useState<Category[]>([]);
  const [connectedActivities, setConnectedActivities] = useState<string[]>([]);
  const [jyTexts, setJyTexts] = useState<string[]>([]);
  const [studyCircleBooks, setStudyCircleBooks] = useState("");
  const [ruhiLevel, setRuhiLevel] = useState<number>(0);
  const [familyId, setFamilyId] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [schoolName, setSchoolName] = useState("");
  const [employmentStatus, setEmploymentStatus] =
    useState<EmploymentStatus>("employed");
  const [participationStatus, setParticipationStatus] =
    useState<ParticipationStatus>("active");

  // Activity fields
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [leader, setLeader] = useState("");

  useEffect(() => {
    if (editingPersonId) {
      const person = people.find((p) => p.id === editingPersonId);
      if (person) {
        setItemType("people");
        setName(person.name);
        setArea(person.area);
        setNote(person.note);
        setCategories(person.categories);
        setConnectedActivities(person.connectedActivities);
        setJyTexts(person.jyTextsCompleted);
        setStudyCircleBooks(person.studyCircleBooks);
        setRuhiLevel(person.ruhiLevel);
        setFamilyId(person.familyId || "");
        setAgeGroup(person.ageGroup);
        setSchoolName(person.schoolName || "");
        setEmploymentStatus(person.employmentStatus);
        setParticipationStatus(person.participationStatus);
      }
    } else {
      resetForm();
    }
  }, [editingPersonId, people]);

  const resetForm = () => {
    setItemType("people");
    setName("");
    setArea("");
    setNote("");
    setCategories([]);
    setConnectedActivities([]);
    setJyTexts([]);
    setStudyCircleBooks("");
    setRuhiLevel(0);
    setFamilyId("");
    setAgeGroup("adult");
    setSchoolName("");
    setEmploymentStatus("employed");
    setParticipationStatus("active");
    setActivityType("");
    setLeader("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (itemType === "people") {
      const personData: Omit<Person, "id"> = {
        name: name.trim(),
        area: area.trim(),
        note: note.trim(),
        categories: categories.length ? categories : [],
        position: null,
        connectedActivities,
        jyTextsCompleted: jyTexts,
        studyCircleBooks: studyCircleBooks.trim(),
        ruhiLevel,
        familyId: familyId || null,
        ageGroup,
        schoolName: schoolName.trim() || null,
        employmentStatus,
        participationStatus,
        homeVisits: [],
        conversations: [],
        connections: [],
      };

      if (editingPersonId) {
        updatePerson(editingPersonId, personData);
      } else {
        addPerson(personData);
      }
    } else {
      if (!activityType) {
        alert("Please select an activity type");
        return;
      }

      const activityData: Omit<Activity, "id"> = {
        name: name.trim(),
        type: activityType,
        leader: leader.trim(),
        note: note.trim(),
        position: null,
      };

      addActivity(activityData);
    }

    resetForm();
    onClose();
  };

  const handleCategoryToggle = (cat: Category) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleJyTextToggle = (text: string) => {
    setJyTexts((prev) =>
      prev.includes(text) ? prev.filter((t) => t !== text) : [...prev, text],
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__content">
        <h3>{editingPersonId ? "Edit Person" : "Add Item"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="muted">Type</label>
            <select
              value={itemType}
              onChange={(e) =>
                setItemType(e.target.value as "people" | "activities")
              }
              disabled={!!editingPersonId}
            >
              <option value="people">Person</option>
              <option value="activities">Activity</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {itemType === "people" ? (
            <>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label className="muted">Family</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={familyId}
                    onChange={(e) => setFamilyId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">No Family</option>
                    {families.map((family) => (
                      <option key={family.id} value={family.id}>
                        {family.familyName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn"
                    onClick={onAddFamily}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + Add Family
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="muted">Age Group</label>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {(
                    ["child", "JY", "youth", "adult", "elder"] as AgeGroup[]
                  ).map((age) => (
                    <label
                      key={age}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="ageGroup"
                        value={age}
                        checked={ageGroup === age}
                        onChange={(e) =>
                          setAgeGroup(e.target.value as AgeGroup)
                        }
                      />
                      {age === "JY"
                        ? "JY"
                        : age.charAt(0).toUpperCase() + age.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {(ageGroup === "child" ||
                ageGroup === "JY" ||
                ageGroup === "youth") && (
                <div className="form-row">
                  <label className="muted">School Name</label>
                  <input
                    type="text"
                    placeholder="School name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-row">
                <label className="muted">Employment Status</label>
                <select
                  value={employmentStatus}
                  onChange={(e) =>
                    setEmploymentStatus(e.target.value as EmploymentStatus)
                  }
                >
                  <option value="student">Student</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="form-row">
                <label className="muted">Participation Status</label>
                <select
                  value={participationStatus}
                  onChange={(e) =>
                    setParticipationStatus(
                      e.target.value as ParticipationStatus,
                    )
                  }
                >
                  <option value="active">Active</option>
                  <option value="occasional">Occasional</option>
                  <option value="lapsed">Lapsed</option>
                  <option value="new">New</option>
                </select>
              </div>

              <div className="chips">
                {(["JY", "CC", "Youth", "Parents"] as Category[]).map((cat) => (
                  <label key={cat}>
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className="form-row">
                <label className="muted">Connected Activities</label>
                <select
                  multiple
                  size={3}
                  value={connectedActivities}
                  onChange={(e) =>
                    setConnectedActivities(
                      Array.from(e.target.selectedOptions, (opt) => opt.value),
                    )
                  }
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} ({activity.type})
                    </option>
                  ))}
                </select>
                <small className="hint">Hold Ctrl/Cmd to select multiple</small>
              </div>

              <div className="form-row">
                <label className="muted">JY Texts Completed</label>
                <div className="chips">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <label key={num}>
                      <input
                        type="checkbox"
                        checked={jyTexts.includes(`Book ${num}`)}
                        onChange={() => handleJyTextToggle(`Book ${num}`)}
                      />
                      Book {num}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label className="muted">Study Circle Books</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Ruhi Book 1, Book 2"
                  value={studyCircleBooks}
                  onChange={(e) => setStudyCircleBooks(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label className="muted">Ruhi Level</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  placeholder="0-12"
                  value={ruhiLevel}
                  onChange={(e) => setRuhiLevel(parseInt(e.target.value) || 0)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <label className="muted">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) =>
                    setActivityType(e.target.value as ActivityType)
                  }
                >
                  <option value="">Select type...</option>
                  <option value="JY">JY</option>
                  <option value="CC">CC</option>
                  <option value="StudyCircle">Study Circle</option>
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
                          : activityType === "StudyCircle"
                            ? "Tutor name"
                            : "Leader name"
                    }
                    value={leader}
                    onChange={(e) => setLeader(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="form-row">
            <input
              type="text"
              placeholder="Notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {editingPersonId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
