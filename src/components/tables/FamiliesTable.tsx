import React, { useMemo } from "react";
import { Family, Person } from "../../types";

interface FamiliesTableProps {
  families: Family[];
  people: Person[];
  onSelectFamily: (id: string) => void;
}

/**
 * Families table component
 * Displays a list of families with member counts and contact info
 */
export const FamiliesTable: React.FC<FamiliesTableProps> = ({
  families,
  people,
  onSelectFamily,
}) => {
  // Create a map of family members count for O(1) lookup
  const memberCounts = useMemo(() => {
    const counts = new Map<string, number>();
    people.forEach((person) => {
      if (person.familyId) {
        const count = counts.get(person.familyId) || 0;
        counts.set(person.familyId, count + 1);
      }
    });
    return counts;
  }, [people]);

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Family</th>
            <th>Area</th>
            <th>Members</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {families.map((family) => {
            const memberCount =
              memberCounts.get(family.id) ||
              memberCounts.get(family.familyName) ||
              0;
            return (
              <tr key={family.id} onClick={() => onSelectFamily(family.id)}>
                <td>
                  <div className="table-title">{family.familyName}</div>
                  <div className="table-subtitle">
                    {family.notes || "No notes"}
                  </div>
                </td>
                <td>{family.primaryArea || "-"}</td>
                <td>{memberCount}</td>
                <td>
                  {(family.phone || family.email) && (
                    <div className="chip-row">
                      {family.phone && (
                        <span className="chip">{family.phone}</span>
                      )}
                      {family.email && (
                        <span className="chip chip--muted">{family.email}</span>
                      )}
                    </div>
                  )}
                  {!family.phone && !family.email && "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
