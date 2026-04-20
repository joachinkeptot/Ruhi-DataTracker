import React, { useState } from "react";
import { Person, Activity } from "../../types";

interface ActivitiesTableProps {
  activities: Activity[];
  people: Person[];
  onSelectActivity: (id: string) => void;
}

type StatusFilter = "all" | "active" | "inactive";

export const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  activities,
  people,
  onSelectActivity,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = activities.filter((a) => {
    if (statusFilter === "active") return a.isActive !== false;
    if (statusFilter === "inactive") return a.isActive === false;
    return true;
  });

  return (
    <div className="table-wrap">
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            className={`btn btn--sm ${statusFilter === s ? "btn--primary" : ""}`}
            onClick={() => setStatusFilter(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Leader</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((activity) => {
            const isActive = activity.isActive !== false;
            return (
              <tr key={activity.id} onClick={() => onSelectActivity(activity.id)}>
                <td>
                  <div className="table-title">{activity.name}</div>
                  <div className="table-subtitle">
                    {activity.area || "No area"}
                  </div>
                </td>
                <td>
                  <span className="chip">{activity.type}</span>
                </td>
                <td>
                  <span
                    className="chip"
                    style={{
                      background: isActive ? "#dcfce7" : "#f3f4f6",
                      color: isActive ? "#16a34a" : "#6b7280",
                      border: `1px solid ${isActive ? "#bbf7d0" : "#e5e7eb"}`,
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{activity.facilitator || activity.leader || "-"}</td>
                <td>
                  <div className="chip-row">
                    {activity.participantIds.length === 0 && "-"}
                    {activity.participantIds.slice(0, 3).map((id: string) => {
                      const person = people.find((p) => p.id === id);
                      return (
                        <span key={id} className="chip chip--muted">
                          {person?.name || "Unknown"}
                        </span>
                      );
                    })}
                    {activity.participantIds.length > 3 && (
                      <span className="chip chip--muted">
                        +{activity.participantIds.length - 3}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
