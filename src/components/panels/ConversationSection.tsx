import React, { useState } from "react";
import { useApp } from "../../context";
import { Conversation } from "../../types";
import { notifyWarning } from "../../utils";

interface ConversationSectionProps {
  personId: string;
  conversations: Conversation[];
}

export const ConversationSection: React.FC<ConversationSectionProps> = ({
  personId,
  conversations,
}) => {
  const { people, updatePerson } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [convDate, setConvDate] = useState("");
  const [convTopic, setConvTopic] = useState("");
  const [convNotes, setConvNotes] = useState("");
  const [convNextSteps, setConvNextSteps] = useState("");

  const resetForm = () => {
    setConvDate("");
    setConvTopic("");
    setConvNotes("");
    setConvNextSteps("");
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!convDate || !convTopic) {
      notifyWarning("Date and topic are required");
      return;
    }

    const newConversation: Conversation = {
      date: convDate,
      topic: convTopic.trim(),
      notes: convNotes.trim(),
      nextSteps: convNextSteps.trim() || undefined,
    };

    const person = people.find((p) => p.id === personId);
    if (person) {
      updatePerson(personId, { conversations: [...person.conversations, newConversation] });
    }

    resetForm();
  };

  return (
    <div style={{ marginTop: "1.5rem", borderTop: "1px solid #374151", paddingTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h5 style={{ margin: 0 }}>Conversations</h5>
        <button
          className="btn"
          style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Log Conversation"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#1f2937", padding: "0.75rem", borderRadius: "4px", marginBottom: "0.75rem" }}>
          <div className="form-row" style={{ marginBottom: "0.5rem" }}>
            <input type="date" value={convDate} onChange={(e) => setConvDate(e.target.value)} required style={{ fontSize: "0.875rem" }} />
          </div>
          <div className="form-row" style={{ marginBottom: "0.5rem" }}>
            <input type="text" placeholder="Topic *" value={convTopic} onChange={(e) => setConvTopic(e.target.value)} required style={{ fontSize: "0.875rem" }} />
          </div>
          <div className="form-row" style={{ marginBottom: "0.5rem" }}>
            <textarea rows={2} placeholder="Notes" value={convNotes} onChange={(e) => setConvNotes(e.target.value)} style={{ fontSize: "0.875rem" }} />
          </div>
          <div className="form-row" style={{ marginBottom: "0.5rem" }}>
            <textarea rows={2} placeholder="Next Steps" value={convNextSteps} onChange={(e) => setConvNextSteps(e.target.value)} style={{ fontSize: "0.875rem" }} />
          </div>
          <button className="btn btn--primary" style={{ width: "100%", fontSize: "0.875rem" }} onClick={handleAdd}>
            Log Conversation
          </button>
        </div>
      )}

      {conversations.length > 0 && (
        <div style={{ fontSize: "0.875rem" }}>
          {conversations
            .slice(-3)
            .reverse()
            .map((conv, idx) => (
              <div
                key={`conv-${conversations.length - idx - 1}-${conv.date}`}
                style={{ background: "#111827", padding: "0.5rem", borderRadius: "4px", marginBottom: "0.5rem" }}
              >
                <div style={{ fontWeight: "bold", color: "#60a5fa" }}>
                  {new Date(conv.date).toLocaleDateString()}
                </div>
                <div style={{ color: "#34d399" }}>{conv.topic}</div>
                {conv.notes && <div style={{ marginTop: "0.25rem" }}>{conv.notes}</div>}
                {conv.nextSteps && (
                  <div style={{ marginTop: "0.25rem", color: "#fbbf24" }}>
                    Next: {conv.nextSteps}
                  </div>
                )}
              </div>
            ))}
          {conversations.length > 3 && (
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              + {conversations.length - 3} more conversations
            </div>
          )}
        </div>
      )}
    </div>
  );
};
