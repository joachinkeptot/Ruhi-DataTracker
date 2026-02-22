import React, { useState } from "react";
import { useApp } from "../../context";
import {
  FormSubmission,
  FormType,
  HomeVisit,
  VisitPurpose,
  AgeGroup,
  EmploymentStatus,
} from "../../types";
import {
  validateRequired,
  validateEmail,
  notifySuccess,
  notifyError,
  notifyWarning,
} from "../../utils";

export const Forms: React.FC = () => {
  const { people, addPerson, updatePerson } = useApp();

  // Form submissions stored in localStorage
  const [submissions, setSubmissions] = useState<FormSubmission[]>(() => {
    try {
      const stored = localStorage.getItem("formSubmissions");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load form submissions:", error);
      return [];
    }
  });

  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [submitterName, setSubmitterName] = useState("");

  // Person Form State
  const [personName, setPersonName] = useState("");
  const [personArea, setPersonArea] = useState("");
  const [personAge, setPersonAge] = useState<AgeGroup>("adult");
  const [personPhone, setPersonPhone] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personNotes, setPersonNotes] = useState("");
  const [personEmployment, setPersonEmployment] =
    useState<EmploymentStatus>("employed");

  // Home Visit Form State
  const [visitPerson, setVisitPerson] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitors, setVisitors] = useState("");
  const [purpose, setPurpose] = useState<VisitPurpose>("Social");
  const [visitNotes, setVisitNotes] = useState("");
  const [relationshipsDiscovered, setRelationshipsDiscovered] = useState("");
  const [interestsExpressed, setInterestsExpressed] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const saveSubmissions = (subs: FormSubmission[]) => {
    try {
      setSubmissions(subs);
      localStorage.setItem("formSubmissions", JSON.stringify(subs));
    } catch (error) {
      console.error("Failed to save submissions:", error);
      notifyError("Storage error", "Could not save form submission");
    }
  };

  const handlePersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!validateRequired(submitterName)) {
      notifyWarning("Please enter your name before submitting");
      return;
    }
    if (!validateRequired(personName)) {
      notifyWarning("Person name is required");
      return;
    }
    if (!validateRequired(personArea)) {
      notifyWarning("Area is required");
      return;
    }
    if (personEmail && !validateEmail(personEmail)) {
      notifyWarning("Please enter a valid email address");
      return;
    }

    // Save submission
    const submission: FormSubmission = {
      id: `form-${Date.now()}`,
      formType: "person",
      submittedBy: submitterName.trim(),
      submittedAt: new Date().toISOString(),
      data: {
        name: personName.trim(),
        area: personArea.trim(),
        ageGroup: personAge,
        phone: personPhone.trim() || undefined,
        email: personEmail.trim() || undefined,
        notes: personNotes.trim() || undefined,
        employmentStatus: personEmployment,
      },
      processed: false,
    };

    saveSubmissions([...submissions, submission]);

    // Auto-process: Add the person immediately
    try {
      addPerson({
        name: personName.trim(),
        area: personArea.trim(),
        ageGroup: personAge,
        employmentStatus: personEmployment,
        notes: personNotes.trim() || undefined,
        connectedActivities: [],
        connections: [],
        jyTexts: [],
        studyCircleBooks: [],
        ccGrades: [],
        homeVisits: [],
        conversations: [],
        ruhiLevel: 0,
        dateAdded: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      });

      // Mark as processed
      submission.processed = true;
      submission.processedAt = new Date().toISOString();
      saveSubmissions([...submissions, submission]);

      notifySuccess("Person added successfully!", 3000);
      resetPersonForm();
      setActiveFormType(null);
    } catch (error) {
      notifyError(
        "Error adding person. Please try again.",
        error instanceof Error ? error : undefined,
      );
      // Keep form open so user can retry
    }
  };

  const handleHomeVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!validateRequired(submitterName)) {
      notifyWarning("Please enter your name before submitting");
      return;
    }
    if (!visitPerson) {
      notifyWarning("Please select a person for the visit");
      return;
    }
    if (!validateRequired(visitDate)) {
      notifyWarning("Visit date is required");
      return;
    }
    if (!validateRequired(visitors)) {
      notifyWarning("Please enter who made the visit");
      return;
    }

    const person = people.find((p) => p.id === visitPerson);
    if (!person) {
      notifyError("Selected person not found in database");
      return;
    }

    const submission: FormSubmission = {
      id: `form-${Date.now()}`,
      formType: "homevisit",
      submittedBy: submitterName.trim(),
      submittedAt: new Date().toISOString(),
      data: {
        personId: visitPerson,
        personName: person.name,
        date: visitDate,
        visitors: visitors.trim(),
        purpose: purpose,
        notes: visitNotes.trim() || undefined,
        relationshipsDiscovered: relationshipsDiscovered.trim() || undefined,
        interestsExpressed: interestsExpressed.trim() || undefined,
        followUp: followUp.trim() || undefined,
        followUpDate: followUpDate || undefined,
      },
      processed: false,
    };

    saveSubmissions([...submissions, submission]);

    // Auto-process: Add the home visit immediately
    try {
      const newVisit: HomeVisit = {
        date: visitDate,
        visitors: visitors.split(",").map((v) => v.trim()),
        purpose: purpose,
        notes: visitNotes,
        relationshipsDiscovered: relationshipsDiscovered,
        interestsExpressed: interestsExpressed,
        followUp: followUp,
        followUpDate: followUpDate,
        completed: false,
      };

      const updatedPerson = {
        ...person,
        homeVisits: [...(person.homeVisits || []), newVisit],
        lastContact: visitDate,
        lastModified: new Date().toISOString(),
      };

      updatePerson(person.id, updatedPerson);

      // Mark as processed
      submission.processed = true;
      submission.processedAt = new Date().toISOString();
      saveSubmissions([...submissions, submission]);

      notifySuccess("Home visit recorded successfully!", 3000);
      resetHomeVisitForm();
      setActiveFormType(null);
    } catch (error) {
      notifyError(
        "Error recording home visit. Please try again.",
        error instanceof Error ? error : undefined,
      );
      // Keep form open so user can retry
    }
  };

  const resetPersonForm = () => {
    setPersonName("");
    setPersonArea("");
    setPersonAge("adult");
    setPersonPhone("");
    setPersonEmail("");
    setPersonNotes("");
    setPersonEmployment("employed");
  };

  const resetHomeVisitForm = () => {
    setVisitPerson("");
    setVisitDate("");
    setVisitors("");
    setPurpose("Social");
    setVisitNotes("");
    setRelationshipsDiscovered("");
    setInterestsExpressed("");
    setFollowUp("");
    setFollowUpDate("");
  };

  const deleteSubmission = (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      const updated = submissions.filter((s) => s.id !== id);
      saveSubmissions(updated);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="forms-container">
      <div className="forms-header">
        <h2>📝 Data Collection Forms</h2>
        <p className="forms-subtitle">
          Simple forms for collecting information from community members
        </p>
      </div>

      {/* Form Selection */}
      {!activeFormType && (
        <div className="form-selection">
          <h3>Select a Form to Fill Out</h3>
          <div className="form-cards">
            <button
              className="form-card"
              onClick={() => setActiveFormType("person")}
            >
              <div className="form-card-icon">👤</div>
              <div className="form-card-title">New Person</div>
              <div className="form-card-desc">
                Add a new person to the community
              </div>
            </button>

            <button
              className="form-card"
              onClick={() => setActiveFormType("homevisit")}
            >
              <div className="form-card-icon">🏠</div>
              <div className="form-card-title">Home Visit Report</div>
              <div className="form-card-desc">
                Record details of a home visit
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Active Form */}
      {activeFormType && (
        <div className="active-form">
          <button
            className="btn btn--secondary"
            onClick={() => setActiveFormType(null)}
            style={{ marginBottom: "1rem" }}
          >
            ← Back to Form Selection
          </button>

          {/* Submitter Name (required for all forms) */}
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="Who is filling out this form?"
              required
              className="form-input"
            />
          </div>

          {/* Person Form */}
          {activeFormType === "person" && (
            <form onSubmit={handlePersonSubmit} className="data-form">
              <h3>👤 New Person Information</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="First and Last Name"
                />
              </div>

              <div className="form-group">
                <label>Area/Neighborhood *</label>
                <input
                  type="text"
                  value={personArea}
                  onChange={(e) => setPersonArea(e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g., Northside, Downtown"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age Group *</label>
                  <select
                    value={personAge}
                    onChange={(e) => setPersonAge(e.target.value as AgeGroup)}
                    className="form-select"
                  >
                    <option value="child">Child</option>
                    <option value="JY">Junior Youth</option>
                    <option value="youth">Youth</option>
                    <option value="adult">Adult</option>
                    <option value="parents">Parents</option>
                    <option value="elder">Elder</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Employment Status</label>
                  <select
                    value={personEmployment}
                    onChange={(e) =>
                      setPersonEmployment(e.target.value as EmploymentStatus)
                    }
                    className="form-select"
                  >
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={personPhone}
                    onChange={(e) => setPersonPhone(e.target.value)}
                    className="form-input"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={personEmail}
                    onChange={(e) => setPersonEmail(e.target.value)}
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={personNotes}
                  onChange={(e) => setPersonNotes(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Any additional information..."
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                disabled={!submitterName || !personName || !personArea}
              >
                Submit Person Information
              </button>
            </form>
          )}

          {/* Home Visit Form */}
          {activeFormType === "homevisit" && (
            <form onSubmit={handleHomeVisitSubmit} className="data-form">
              <h3>🏠 Home Visit Report</h3>

              <div className="form-group">
                <label>Person Visited *</label>
                <select
                  value={visitPerson}
                  onChange={(e) => setVisitPerson(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select a person...</option>
                  {people
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.area}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Visit Date *</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Purpose *</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
                    className="form-select"
                  >
                    <option value="Introduction">Introduction</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Social">Social</option>
                    <option value="Teaching">Teaching</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Visitors *</label>
                <input
                  type="text"
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Who made the visit? (comma separated)"
                />
              </div>

              <div className="form-group">
                <label>Visit Notes</label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="What happened during the visit?"
                />
              </div>

              <div className="form-group">
                <label>Relationships Discovered</label>
                <textarea
                  value={relationshipsDiscovered}
                  onChange={(e) => setRelationshipsDiscovered(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Any family or community connections discovered?"
                />
              </div>

              <div className="form-group">
                <label>Interests Expressed</label>
                <textarea
                  value={interestsExpressed}
                  onChange={(e) => setInterestsExpressed(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="What interests did they express?"
                />
              </div>

              <div className="form-group">
                <label>Follow-up Needed</label>
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="What needs to be followed up on?"
                />
              </div>

              {followUp && (
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={
                  !submitterName || !visitPerson || !visitDate || !visitors
                }
              >
                Submit Home Visit Report
              </button>
            </form>
          )}
        </div>
      )}

      {/* Submissions History */}
      <div className="submissions-section">
        <h3>
          📊 Submissions History ({submissions.length} total,{" "}
          {submissions.filter((s) => s.processed).length} processed)
        </h3>

        {submissions.length === 0 ? (
          <p className="no-data">No form submissions yet</p>
        ) : (
          <div className="submissions-list">
            {submissions
              .sort(
                (a, b) =>
                  new Date(b.submittedAt).getTime() -
                  new Date(a.submittedAt).getTime(),
              )
              .map((sub) => (
                <div
                  key={sub.id}
                  className={`submission-card ${sub.processed ? "processed" : "pending"}`}
                >
                  <div className="submission-header">
                    <div className="submission-type">
                      {sub.formType === "person" && "👤 New Person"}
                      {sub.formType === "homevisit" && "🏠 Home Visit"}
                      {sub.formType === "activity" && "🎯 Activity"}
                    </div>
                    <div className="submission-status">
                      {sub.processed ? "✅ Processed" : "⏳ Pending"}
                    </div>
                  </div>

                  <div className="submission-details">
                    <div className="submission-meta">
                      <strong>Submitted by:</strong> {sub.submittedBy}
                    </div>
                    <div className="submission-meta">
                      <strong>Submitted:</strong> {formatDate(sub.submittedAt)}
                    </div>
                    {sub.processed && sub.processedAt && (
                      <div className="submission-meta">
                        <strong>Processed:</strong>{" "}
                        {formatDate(sub.processedAt)}
                      </div>
                    )}
                  </div>

                  <div className="submission-data">
                    {sub.formType === "person" && (
                      <div>
                        <strong>Name:</strong> {sub.data.name}
                        <br />
                        <strong>Area:</strong> {sub.data.area}
                        <br />
                        <strong>Age:</strong> {sub.data.ageGroup}
                      </div>
                    )}
                    {sub.formType === "homevisit" && (
                      <div>
                        <strong>Visited:</strong> {sub.data.personName}
                        <br />
                        <strong>Date:</strong> {sub.data.date}
                        <br />
                        <strong>Visitors:</strong> {sub.data.visitors}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn--sm btn--danger"
                    onClick={() => deleteSubmission(sub.id)}
                    style={{ marginTop: "0.5rem" }}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
