import React, { useState, useMemo } from "react";
import { useApp } from "./AppContext";
import { Person, HomeVisit, Conversation, VisitPurpose } from "./types";

export const HomeVisitsTracker: React.FC = () => {
  const { people, updatePerson } = useApp();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showAddConversation, setShowAddConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterParent, setFilterParent] = useState<string>("");
  const [showFollowUpsOnly, setShowFollowUpsOnly] = useState(false);

  // Form states for Home Visit
  const [visitDate, setVisitDate] = useState("");
  const [visitors, setVisitors] = useState("");
  const [purpose, setPurpose] = useState<VisitPurpose>("Social");
  const [visitNotes, setVisitNotes] = useState("");
  const [relationshipsDiscovered, setRelationshipsDiscovered] = useState("");
  const [interestsExpressed, setInterestsExpressed] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Form states for Conversation
  const [convDate, setConvDate] = useState("");
  const [convTopic, setConvTopic] = useState("");
  const [convNotes, setConvNotes] = useState("");
  const [convNextSteps, setConvNextSteps] = useState("");
  const [convFollowUpDate, setConvFollowUpDate] = useState("");

  // Get unique areas for filtering
  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    people.forEach((p) => {
      if (p.area) areaSet.add(p.area);
    });
    return Array.from(areaSet).sort();
  }, [people]);

  // Calculate engagement metrics for each person
  const peopleWithMetrics = useMemo(() => {
    return people.map((person) => {
      const visits = person.homeVisits || [];
      const convs = person.conversations || [];
      const lastVisit = visits.length > 0 ? visits[visits.length - 1] : null;
      const lastConv = convs.length > 0 ? convs[convs.length - 1] : null;

      let lastContact = person.lastContact;
      if (lastVisit && lastVisit.date > (lastContact || "")) {
        lastContact = lastVisit.date;
      }
      if (lastConv && lastConv.date > (lastContact || "")) {
        lastContact = lastConv.date;
      }

      // Check for pending follow-ups
      const hasPendingFollowUp =
        visits.some((v) => v.followUpDate && !v.completed) ||
        convs.some(
          (c) => c.followUpDate && new Date(c.followUpDate) >= new Date(),
        );

      return {
        ...person,
        visitCount: visits.length,
        conversationCount: convs.length,
        lastContact,
        hasPendingFollowUp,
      };
    });
  }, [people]);

  // Filter people
  const filteredPeople = useMemo(() => {
    let filtered = peopleWithMetrics;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          (p.notes || "").toLowerCase().includes(query),
      );
    }

    if (filterArea) {
      filtered = filtered.filter((p) => p.area === filterArea);
    }

    if (filterParent) {
      if (filterParent === "yes") {
        filtered = filtered.filter((p) => p.isParent === true);
      } else if (filterParent === "no") {
        filtered = filtered.filter((p) => !p.isParent);
      }
    }

    if (showFollowUpsOnly) {
      filtered = filtered.filter((p) => p.hasPendingFollowUp);
    }

    return filtered.sort((a, b) => {
      // Sort by pending follow-ups first, then by last contact (recent first)
      if (a.hasPendingFollowUp && !b.hasPendingFollowUp) return -1;
      if (!a.hasPendingFollowUp && b.hasPendingFollowUp) return 1;
      if (!a.lastContact && !b.lastContact) return 0;
      if (!a.lastContact) return 1;
      if (!b.lastContact) return -1;
      return b.lastContact.localeCompare(a.lastContact);
    });
  }, [peopleWithMetrics, searchQuery, filterArea, showFollowUpsOnly]);

  const resetVisitForm = () => {
    setVisitDate("");
    setVisitors("");
    setPurpose("Social");
    setVisitNotes("");
    setRelationshipsDiscovered("");
    setInterestsExpressed("");
    setFollowUp("");
    setFollowUpDate("");
  };

  const resetConvForm = () => {
    setConvDate("");
    setConvTopic("");
    setConvNotes("");
    setConvNextSteps("");
    setConvFollowUpDate("");
  };

  const handleAddVisit = () => {
    if (!selectedPerson || !visitDate || !visitNotes) {
      alert("Please fill in date and notes");
      return;
    }

    const newVisit: HomeVisit = {
      date: visitDate,
      visitors: visitors
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      purpose,
      notes: visitNotes,
      relationshipsDiscovered: relationshipsDiscovered || undefined,
      interestsExpressed: interestsExpressed || undefined,
      followUp: followUp || undefined,
      followUpDate: followUpDate || undefined,
      completed: false,
    };

    updatePerson(selectedPerson.id, {
      homeVisits: [...selectedPerson.homeVisits, newVisit],
      lastContact: visitDate,
    });

    resetVisitForm();
    setShowAddVisit(false);
    setSelectedPerson(people.find((p) => p.id === selectedPerson.id) || null);
  };

  const handleAddConversation = () => {
    if (!selectedPerson || !convDate || !convTopic) {
      alert("Please fill in date and topic");
      return;
    }

    const newConv: Conversation = {
      date: convDate,
      topic: convTopic,
      notes: convNotes,
      nextSteps: convNextSteps || undefined,
      followUpDate: convFollowUpDate || undefined,
    };

    updatePerson(selectedPerson.id, {
      conversations: [...selectedPerson.conversations, newConv],
      lastContact: convDate,
    });

    resetConvForm();
    setShowAddConversation(false);
    setSelectedPerson(people.find((p) => p.id === selectedPerson.id) || null);
  };

  const handleMarkVisitComplete = (visitIndex: number) => {
    if (!selectedPerson) return;

    const updatedVisits = [...selectedPerson.homeVisits];
    updatedVisits[visitIndex] = {
      ...updatedVisits[visitIndex],
      completed: true,
    };

    updatePerson(selectedPerson.id, {
      homeVisits: updatedVisits,
    });

    setSelectedPerson(people.find((p) => p.id === selectedPerson.id) || null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  return (
    <div className="home-visits-tracker">
      <div className="tracker-header">
        <div className="header-title">
          <h2>🏠 Home Visits & Conversations</h2>
          <p className="header-subtitle">
            Track engagement and follow-ups with {people.length} people
          </p>
        </div>
        <div className="tracker-filters">
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="filter-select"
          >
            <option value="">All Areas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="filter-select"
          >
            <option value="">All Parents</option>
            <option value="yes">Parents Only</option>
            <option value="no">Non-Parents</option>
          </select>
          <button
            className={`btn btn--sm ${showFollowUpsOnly ? "btn--primary" : ""}`}
            onClick={() => setShowFollowUpsOnly(!showFollowUpsOnly)}
          >
            {showFollowUpsOnly ? "✓ " : ""}Follow-ups Only
          </button>
        </div>
      </div>

      <div className="tracker-layout">
        <div className="tracker-main">
          <div className="tracker-table-card">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Area</th>
                  <th>Visits</th>
                  <th>Conversations</th>
                  <th>Last Contact</th>
                  <th>Follow-ups</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      No people found
                    </td>
                  </tr>
                ) : (
                  filteredPeople.map((person) => {
                    const daysSince = person.lastContact
                      ? getDaysSince(person.lastContact)
                      : 999;

                    return (
                      <tr
                        key={person.id}
                        className={`tracker-row ${
                          selectedPerson?.id === person.id ? "selected" : ""
                        } ${person.hasPendingFollowUp ? "has-followup" : ""} ${
                          daysSince > 30 ? "needs-attention" : ""
                        }`}
                        onClick={() => setSelectedPerson(person)}
                      >
                        <td className="person-cell">
                          <div className="person-info">
                            <div className="person-name">{person.name}</div>
                            <div className="person-meta">
                              <span className="age-badge age-badge--{person.ageGroup}">
                                {person.ageGroup}
                              </span>
                              {person.familyId && (
                                <span className="family-indicator">👨‍👩‍👧</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="area-cell">
                          <span className="area-tag">{person.area}</span>
                        </td>
                        <td className="metric-cell">
                          <div className="metric-display">
                            <span className="metric-value metric-visits">
                              {person.visitCount}
                            </span>
                            <span className="metric-label">visits</span>
                          </div>
                        </td>
                        <td className="metric-cell">
                          <div className="metric-display">
                            <span className="metric-value metric-convs">
                              {person.conversationCount}
                            </span>
                            <span className="metric-label">convs</span>
                          </div>
                        </td>
                        <td className="contact-cell">
                          {person.lastContact ? (
                            <div className="contact-info">
                              <div className="contact-date">
                                {formatDate(person.lastContact)}
                              </div>
                              <div
                                className={`days-indicator ${
                                  daysSince === 0
                                    ? "today"
                                    : daysSince <= 7
                                      ? "recent"
                                      : daysSince <= 30
                                        ? "moderate"
                                        : "old"
                                }`}
                              >
                                {daysSince === 0
                                  ? "Today"
                                  : daysSince === 1
                                    ? "Yesterday"
                                    : `${daysSince}d ago`}
                              </div>
                            </div>
                          ) : (
                            <span className="no-contact">Never contacted</span>
                          )}
                        </td>
                        <td className="followup-cell">
                          {person.hasPendingFollowUp ? (
                            <span className="status-badge status-pending">
                              ⚠️ Pending
                            </span>
                          ) : (
                            <span className="status-badge status-clear">
                              ✓ Clear
                            </span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              className="action-btn action-btn--visit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPerson(person);
                                setShowAddVisit(true);
                                setShowAddConversation(false);
                              }}
                              title="Add Home Visit"
                            >
                              🏠 Visit
                            </button>
                            <button
                              className="action-btn action-btn--conv"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPerson(person);
                                setShowAddConversation(true);
                                setShowAddVisit(false);
                              }}
                              title="Add Conversation"
                            >
                              💬 Talk
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tracker-sidebar">
          {selectedPerson ? (
            <>
              <div className="sidebar-header">
                <h3>{selectedPerson.name}</h3>
                <div className="person-meta">
                  {selectedPerson.area} • {selectedPerson.ageGroup}
                </div>
              </div>

              {showAddVisit && (
                <div className="form-card">
                  <h4>Add Home Visit</h4>
                  <div className="form-row">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Visitors (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="John, Mary"
                      value={visitors}
                      onChange={(e) => setVisitors(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) =>
                        setPurpose(e.target.value as VisitPurpose)
                      }
                    >
                      <option value="Introduction">Introduction</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Social">Social</option>
                      <option value="Teaching">Teaching</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Notes *</label>
                    <textarea
                      rows={3}
                      placeholder="What was discussed..."
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Relationships Discovered</label>
                    <input
                      type="text"
                      placeholder="New connections found..."
                      value={relationshipsDiscovered}
                      onChange={(e) =>
                        setRelationshipsDiscovered(e.target.value)
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label>Interests Expressed</label>
                    <input
                      type="text"
                      placeholder="Topics of interest..."
                      value={interestsExpressed}
                      onChange={(e) => setInterestsExpressed(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Follow-up Actions</label>
                    <input
                      type="text"
                      placeholder="Next steps..."
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn--sm"
                      onClick={() => {
                        setShowAddVisit(false);
                        resetVisitForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={handleAddVisit}
                    >
                      Save Visit
                    </button>
                  </div>
                </div>
              )}

              {showAddConversation && (
                <div className="form-card">
                  <h4>Add Conversation</h4>
                  <div className="form-row">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={convDate}
                      onChange={(e) => setConvDate(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Topic *</label>
                    <input
                      type="text"
                      placeholder="Main discussion topic..."
                      value={convTopic}
                      onChange={(e) => setConvTopic(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Details of conversation..."
                      value={convNotes}
                      onChange={(e) => setConvNotes(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Next Steps</label>
                    <input
                      type="text"
                      placeholder="Action items..."
                      value={convNextSteps}
                      onChange={(e) => setConvNextSteps(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      value={convFollowUpDate}
                      onChange={(e) => setConvFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn--sm"
                      onClick={() => {
                        setShowAddConversation(false);
                        resetConvForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={handleAddConversation}
                    >
                      Save Conversation
                    </button>
                  </div>
                </div>
              )}

              {!showAddVisit && !showAddConversation && (
                <>
                  <div className="history-section">
                    <div className="section-header">
                      <h4>Home Visits ({selectedPerson.homeVisits.length})</h4>
                      <button
                        className="btn btn--xs btn--primary"
                        onClick={() => {
                          setShowAddVisit(true);
                          setShowAddConversation(false);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                    <div className="history-list">
                      {selectedPerson.homeVisits.length === 0 ? (
                        <p className="muted">No visits recorded</p>
                      ) : (
                        selectedPerson.homeVisits
                          .slice()
                          .reverse()
                          .map((visit, idx) => (
                            <div
                              key={idx}
                              className={`history-item ${visit.followUpDate && !visit.completed ? "pending" : ""}`}
                            >
                              <div className="history-header">
                                <strong>{formatDate(visit.date)}</strong>
                                <span className="purpose-badge">
                                  {visit.purpose}
                                </span>
                              </div>
                              {visit.visitors.length > 0 && (
                                <div className="history-meta">
                                  Visitors: {visit.visitors.join(", ")}
                                </div>
                              )}
                              <p>{visit.notes}</p>
                              {visit.relationshipsDiscovered && (
                                <div className="history-detail">
                                  <strong>Relationships:</strong>{" "}
                                  {visit.relationshipsDiscovered}
                                </div>
                              )}
                              {visit.interestsExpressed && (
                                <div className="history-detail">
                                  <strong>Interests:</strong>{" "}
                                  {visit.interestsExpressed}
                                </div>
                              )}
                              {visit.followUp && (
                                <div className="history-detail">
                                  <strong>Follow-up:</strong> {visit.followUp}
                                  {visit.followUpDate && (
                                    <>
                                      {" "}
                                      (by {formatDate(visit.followUpDate)})
                                      {!visit.completed && (
                                        <button
                                          className="btn btn--xs"
                                          style={{ marginLeft: "0.5rem" }}
                                          onClick={() =>
                                            handleMarkVisitComplete(
                                              selectedPerson.homeVisits.length -
                                                1 -
                                                idx,
                                            )
                                          }
                                        >
                                          Mark Complete
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="history-section">
                    <div className="section-header">
                      <h4>
                        Conversations ({selectedPerson.conversations.length})
                      </h4>
                      <button
                        className="btn btn--xs btn--primary"
                        onClick={() => {
                          setShowAddConversation(true);
                          setShowAddVisit(false);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                    <div className="history-list">
                      {selectedPerson.conversations.length === 0 ? (
                        <p className="muted">No conversations recorded</p>
                      ) : (
                        selectedPerson.conversations
                          .slice()
                          .reverse()
                          .map((conv, idx) => (
                            <div key={idx} className="history-item">
                              <div className="history-header">
                                <strong>{formatDate(conv.date)}</strong>
                              </div>
                              <div className="history-topic">{conv.topic}</div>
                              {conv.notes && <p>{conv.notes}</p>}
                              {conv.nextSteps && (
                                <div className="history-detail">
                                  <strong>Next Steps:</strong> {conv.nextSteps}
                                </div>
                              )}
                              {conv.followUpDate && (
                                <div className="history-detail">
                                  <strong>Follow-up Date:</strong>{" "}
                                  {formatDate(conv.followUpDate)}
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="sidebar-empty">
              <p>Select a person to view and add visits/conversations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
