import React, { useState } from "react";
import {
  FormSubmission,
  FormType,
  VisitPurpose,
  AgeGroup,
  EmploymentStatus,
} from "./types";

export const PublicForms: React.FC = () => {
  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [submitterName, setSubmitterName] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
  const [visitPersonName, setVisitPersonName] = useState("");
  const [visitArea, setVisitArea] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitors, setVisitors] = useState("");
  const [purpose, setPurpose] = useState<VisitPurpose>("Social");
  const [visitNotes, setVisitNotes] = useState("");
  const [relationshipsDiscovered, setRelationshipsDiscovered] = useState("");
  const [interestsExpressed, setInterestsExpressed] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const handlePersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: FormSubmission = {
      id: `form-${Date.now()}`,
      formType: "person",
      submittedBy: submitterName,
      submittedAt: new Date().toISOString(),
      data: {
        name: personName,
        area: personArea,
        ageGroup: personAge,
        phone: personPhone,
        email: personEmail,
        notes: personNotes,
        employmentStatus: personEmployment,
      },
      processed: false,
    };

    // Store in localStorage for admin to review
    const existing = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]",
    );
    localStorage.setItem(
      "formSubmissions",
      JSON.stringify([...existing, submission]),
    );

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      resetPersonForm();
      setActiveFormType(null);
    }, 3000);
  };

  const handleHomeVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: FormSubmission = {
      id: `form-${Date.now()}`,
      formType: "homevisit",
      submittedBy: submitterName,
      submittedAt: new Date().toISOString(),
      data: {
        personName: visitPersonName,
        area: visitArea,
        date: visitDate,
        visitors: visitors,
        purpose: purpose,
        notes: visitNotes,
        relationshipsDiscovered: relationshipsDiscovered,
        interestsExpressed: interestsExpressed,
        followUp: followUp,
        followUpDate: followUpDate,
      },
      processed: false,
    };

    // Store in localStorage for admin to review
    const existing = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]",
    );
    localStorage.setItem(
      "formSubmissions",
      JSON.stringify([...existing, submission]),
    );

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      resetHomeVisitForm();
      setActiveFormType(null);
    }, 3000);
  };

  const resetPersonForm = () => {
    setSubmitterName("");
    setPersonName("");
    setPersonArea("");
    setPersonAge("adult");
    setPersonPhone("");
    setPersonEmail("");
    setPersonNotes("");
    setPersonEmployment("employed");
  };

  const resetHomeVisitForm = () => {
    setSubmitterName("");
    setVisitPersonName("");
    setVisitArea("");
    setVisitDate("");
    setVisitors("");
    setPurpose("Social");
    setVisitNotes("");
    setRelationshipsDiscovered("");
    setInterestsExpressed("");
    setFollowUp("");
    setFollowUpDate("");
  };

  if (submitSuccess) {
    return (
      <div className="forms-container">
        <div
          className="success-message"
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--panel)",
            borderRadius: "16px",
            border: "2px solid var(--success)",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "var(--success)", marginBottom: "1rem" }}>
            Thank You!
          </h2>
          <p style={{ color: "var(--text)", fontSize: "1.1rem" }}>
            Your submission has been received successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="forms-container">
      <div className="forms-header">
        <h2>📝 Community Information Form</h2>
        <p className="forms-subtitle">
          Please fill out the form below to share your information with us
        </p>
      </div>

      {/* Form Selection */}
      {!activeFormType && (
        <div className="form-selection">
          <h3>Select a Form</h3>
          <div className="form-cards">
            <button
              className="form-card"
              onClick={() => setActiveFormType("person")}
            >
              <div className="form-card-icon">👤</div>
              <div className="form-card-title">Personal Information</div>
              <div className="form-card-desc">
                Share your contact and basic information
              </div>
            </button>

            <button
              className="form-card"
              onClick={() => setActiveFormType("homevisit")}
            >
              <div className="form-card-icon">🏠</div>
              <div className="form-card-title">Home Visit Report</div>
              <div className="form-card-desc">
                Report details about a community visit
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
              placeholder="Your full name"
              required
              className="form-input"
            />
          </div>

          {/* Person Form */}
          {activeFormType === "person" && (
            <form onSubmit={handlePersonSubmit} className="data-form">
              <h3>👤 Personal Information</h3>

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
                <label>Additional Notes</label>
                <textarea
                  value={personNotes}
                  onChange={(e) => setPersonNotes(e.target.value)}
                  className="form-textarea"
                  rows={4}
                  placeholder="Any additional information you'd like to share..."
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                disabled={!submitterName || !personName || !personArea}
              >
                Submit Information
              </button>
            </form>
          )}

          {/* Home Visit Form */}
          {activeFormType === "homevisit" && (
            <form onSubmit={handleHomeVisitSubmit} className="data-form">
              <h3>🏠 Home Visit Report</h3>

              <div className="form-group">
                <label>Person Visited (Name) *</label>
                <input
                  type="text"
                  value={visitPersonName}
                  onChange={(e) => setVisitPersonName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Full name of person visited"
                />
              </div>

              <div className="form-group">
                <label>Area/Neighborhood *</label>
                <input
                  type="text"
                  value={visitArea}
                  onChange={(e) => setVisitArea(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Where the visit took place"
                />
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
                <label>Who Made the Visit? *</label>
                <input
                  type="text"
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Names of visitors (comma separated)"
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
                  !submitterName ||
                  !visitPersonName ||
                  !visitArea ||
                  !visitDate ||
                  !visitors
                }
              >
                Submit Home Visit Report
              </button>
            </form>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          color: "var(--muted)",
        }}
      >
        <p>Thank you for contributing to our community records! 🙏</p>
      </div>
    </div>
  );
};
