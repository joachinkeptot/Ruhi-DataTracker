import React from "react";
import { Person, Activity } from "../../types";

interface ActivitiesTableProps {
  activities: Activity[];
  people: Person[];
  onSelectActivity: (id: string) => void;
}

/**
 * Activities table component
 * Displays a list of activities with details
 */
export const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  activities,
  people,
  onSelectActivity,
}) => {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Leader</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
