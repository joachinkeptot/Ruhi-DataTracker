import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import {
  Person,
  AgeGroup,
  EmploymentStatus,
  RuhiBookCompletion,
  JYTextCompletion,
  CCGradeCompletion,
} from "../../types";
import { JY_TEXTS } from "../../utils";

interface PersonModalContentProps {
  editingPersonId: string | null;
  onClose: () => void;
  onAddFamily?: () => void;
}

export const PersonModalContent: React.FC<PersonModalContentProps> = ({
  editingPersonId,
  onClose,
  onAddFamily,
}) => {
  const { people, activities, families, addPerson, updatePerson } = useApp();

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [connectedActivities, setConnectedActivities] = useState<string[]>([]);
  const [jyTexts, setJyTexts] = useState<JYTextCompletion[]>([]);
  const [studyCircleBooks, setStudyCircleBooks] = useState<RuhiBookCompletion[]>([]);
  const [ruhiLevel, setRuhiLevel] = useState<number>(0);
  const [familyId, setFamilyId] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [isParent, setIsParent] = useState(false);
  const [isElder, setIsElder] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>("employed");
  const [ccGrades, setCcGrades] = useState<CCGradeCompletion[]>([]);
  const [cohorts, setCohorts] = useState<string[]>([]);
  const [cohortInput, setCohortInput] = useState("");

  useEffect(() => {
    if (editingPersonId) {
      const person = people.find((p) => p.id === editingPersonId);
      if (person) {
        setName(person.name);
        setArea(person.area);
        setNotes(person.notes || "");
        setConnectedActivities(person.connectedActivities);
        setJyTexts(person.jyTexts || []);
        setStudyCircleBooks(person.studyCircleBooks || []);
        setRuhiLevel(person.ruhiLevel);
        setFamilyId(person.familyId || "");
        setAgeGroup(person.ageGroup);
        setIsParent(person.isParent ?? false);
        setIsElder(person.isElder ?? false);
        setSchoolName(person.schoolName || "");
        setEmploymentStatus(person.employmentStatus || "student");
        setCcGrades(person.ccGrades || []);
        setCohorts(person.cohorts || []);
      }
    } else {
      resetForm();
    }
  }, [editingPersonId, people]);

  const resetForm = () => {
    setName("");
    setArea("");
    setNotes("");
    setConnectedActivities([]);
    setJyTexts([]);
    setStudyCircleBooks([]);
    setRuhiLevel(0);
    setFamilyId("");
    setAgeGroup("adult");
    setIsParent(false);
    setIsElder(false);
    setSchoolName("");
    setEmploymentStatus("employed");
    setCcGrades([]);
    setCohorts([]);
    setCohortInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const personData: Omit<Person, "id"> = {
      name: name.trim(),
      area: area.trim(),
      notes: notes.trim() || undefined,
      connectedActivities,
      jyTexts: jyTexts || [],
      studyCircleBooks: studyCircleBooks || [],
      ccGrades: ccGrades || [],
      ruhiLevel,
      cohorts: cohorts.length ? cohorts : [],
      familyId: familyId || undefined,
      ageGroup,
      isParent,
      isElder,
      schoolName: schoolName.trim() || undefined,
      employmentStatus: (employmentStatus || "student") as EmploymentStatus,
      homeVisits: [],
      conversations: [],
      connections: [],
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      position: { x: Math.random() * 700, y: Math.random() * 400 },
    };

    if (editingPersonId) {
      updatePerson(editingPersonId, personData);
    } else {
      addPerson(personData);
    }

    resetForm();
    onClose();
  };

  const handleJyTextToggle = (bookName: string) => {
    setJyTexts((prev) => {
      const exists = prev.some((j) => j.bookName === bookName);
      if (exists) return prev.filter((j) => j.bookName !== bookName);
      return [...prev, { bookName, dateCompleted: new Date().toISOString() }];
    });
  };

  const handleCcGradeToggle = (gradeNumber: number) => {
    setCcGrades((prev) => {
      const exists = prev.some((g) => g.gradeNumber === gradeNumber);
      if (exists) return prev.filter((g) => g.gradeNumber !== gradeNumber);
      return [
        ...prev,
        { gradeNumber, lessonsCompleted: 0, dateCompleted: new Date().toISOString() },
      ];
    });
  };

  const handleAddCohort = () => {
    const label = cohortInput.trim();
    if (!label) return;
    setCohorts((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setCohortInput("");
  };

  const existingCohorts = Array.from(
    new Set(people.flatMap((p) => p.cohorts || []))
  ).filter((c) => !cohorts.includes(c));

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
          <button type="button" className="btn" onClick={onAddFamily} style={{ whiteSpace: "nowrap" }}>
            + Add Family
          </button>
        </div>
      </div>

      <div className="form-row">
        <label className="muted">Age Group</label>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {(["child", "JY", "youth", "adult", "parents", "elder"] as AgeGroup[]).map((age) => (
            <label key={age} style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="ageGroup"
                value={age}
                checked={ageGroup === age}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
              />
              {age === "JY" ? "JY" : age.charAt(0).toUpperCase() + age.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {(ageGroup === "child" || ageGroup === "JY" || ageGroup === "youth") && (
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
          onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
        >
          <option value="student">Student</option>
          <option value="employed">Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div className="form-row">
        <label className="muted">Parent / Elder</label>
        <div className="chips" style={{ fontSize: "0.875rem" }}>
          <label>
            <input type="checkbox" checked={isParent} onChange={(e) => setIsParent(e.target.checked)} />
            Parent
          </label>
          <label>
            <input type="checkbox" checked={isElder} onChange={(e) => setIsElder(e.target.checked)} />
            Elder
          </label>
        </div>
      </div>

      <div className="form-row">
        <label className="muted">Cohorts</label>
        {existingCohorts.length > 0 && (
          <div style={{ marginBottom: "0.75rem", padding: "0.5rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem" }}>Available Cohorts:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {existingCohorts.map((cohort) => (
                <button
                  key={cohort}
                  type="button"
                  className="chip chip--activity"
                  onClick={() => setCohorts((prev) => [...prev, cohort])}
                  style={{ cursor: "pointer", border: "1px solid #999", backgroundColor: "#fff", padding: "0.4rem 0.8rem", borderRadius: "4px", fontSize: "0.875rem" }}
                  title="Click to add"
                >
                  + {cohort}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add new cohort label"
            value={cohortInput}
            onChange={(e) => setCohortInput(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleAddCohort}>Add New</button>
        </div>
        {cohorts.length > 0 && (
          <div className="chip-row" style={{ marginTop: "0.5rem" }}>
            {cohorts.map((cohort) => (
              <span
                key={cohort}
                className="chip chip--activity"
                onClick={() => setCohorts((prev) => prev.filter((c) => c !== cohort))}
                style={{ cursor: "pointer" }}
                title="Click to remove"
              >
                {cohort}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-row">
        <label className="muted">Connected Activities</label>
        <select
          multiple
          size={3}
          value={connectedActivities}
          onChange={(e) =>
            setConnectedActivities(Array.from(e.target.selectedOptions, (opt) => opt.value))
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
        <div className="chips" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(["grade6", "grade7", "grade8", "grade9", "bahai"] as const).map((grade) => (
            <div key={grade}>
              <strong style={{ fontSize: "0.75rem", color: "#666" }}>
                {grade === "bahai" ? "Bahá'í-related subjects" : `Grade ${grade.replace("grade", "")}`}:
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {JY_TEXTS[grade].map((text) => (
                  <label key={text} style={{ fontSize: "0.875rem" }}>
                    <input
                      type="checkbox"
                      checked={jyTexts.some((j) => j.bookName === text)}
                      onChange={() => handleJyTextToggle(text)}
                    />
                    {text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label className="muted">CC Grades Completed</label>
        <div className="chips" style={{ fontSize: "0.875rem" }}>
          {[1, 2, 3, 4, 5].map((gradeNum) => (
            <label key={gradeNum}>
              <input
                type="checkbox"
                checked={ccGrades.some((g) => g.gradeNumber === gradeNum)}
                onChange={() => handleCcGradeToggle(gradeNum)}
              />
              Grade {gradeNum}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label className="muted">Study Circle Books</label>
        <div className="chips" style={{ fontSize: "0.875rem" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
            <label key={num}>
              <input
                type="checkbox"
                checked={studyCircleBooks.some((b) => b.bookNumber === num)}
                onChange={() => {
                  setStudyCircleBooks((prev) => {
                    const exists = prev.some((b) => b.bookNumber === num);
                    if (exists) return prev.filter((b) => b.bookNumber !== num);
                    return [...prev, { bookNumber: num, bookName: `Ruhi Book ${num}`, dateCompleted: new Date().toISOString() }];
                  });
                }}
              />
              Book {num}
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
          {editingPersonId ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
};
