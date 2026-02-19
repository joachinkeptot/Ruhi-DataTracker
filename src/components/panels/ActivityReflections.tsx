import React, { useState } from "react";
import { useApp } from "../../context";

interface Reflection {
  date: string;
  text: string;
}

interface ActivityReflectionsProps {
  activityId: string;
  reflections: Reflection[];
}

export const ActivityReflections: React.FC<ActivityReflectionsProps> = ({
  activityId,
  reflections,
}) => {
  const { updateActivity } = useApp();
  const [reflectionText, setReflectionText] = useState("");

  const handleAdd = () => {
    const text = reflectionText.trim();
    if (!text) return;
    const next = [...reflections, { date: new Date().toISOString(), text }];
    updateActivity(activityId, { reflections: next });
    setReflectionText("");
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h5 style={{ marginBottom: "0.5rem" }}>Reflections Log</h5>
      <textarea
        placeholder="Add a reflection..."
        value={reflectionText}
        onChange={(e) => setReflectionText(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      <button className="btn btn--sm" onClick={handleAdd}>
        Add Reflection
      </button>
      {reflections.length === 0 ? (
        <p className="hint" style={{ marginTop: "0.5rem" }}>
          No reflections yet.
        </p>
      ) : (
        <div style={{ marginTop: "0.75rem" }}>
          {[...reflections]
            .slice(-5)
            .reverse()
            .map((entry, idx) => (
              <div
                key={`${entry.date}-${idx}`}
                style={{ background: "#111827", padding: "0.5rem", borderRadius: "4px", marginBottom: "0.5rem" }}
              >
                <div style={{ fontWeight: "bold", color: "#60a5fa" }}>
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div style={{ color: "#e5e7eb" }}>{entry.text}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
