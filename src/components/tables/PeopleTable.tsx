import React, { useMemo } from "react";
import { Person, Activity, Family } from "../../types";

interface PeopleTableProps {
  people: Person[];
  activities: Activity[];
  families: Family[];
  onSelectPerson: (id: string) => void;
  viewMode?: "people" | "cohorts";
  cohortGroups?: Array<[string, Person[]]>;
  cohortColors?: string[];
}

/**
 * Helper function to format age group text
 */
const formatAgeGroup = (ageGroup: string): string => {
  if (ageGroup === "JY") return "JY";
  return ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1);
};

/**
 * People table component
 * Displays a list of people with their details
 * Supports both regular and cohort view modes
 */
export const PeopleTable: React.FC<PeopleTableProps> = ({
  people,
  activities,
  families,
  onSelectPerson,
  viewMode = "people",
  cohortGroups = [],
  cohortColors = [],
}) => {
  // Create maps for O(1) lookups instead of O(n) array searches
  const familyMap = useMemo(
    () => new Map<string, Family>(families.map((f) => [f.id, f])),
    [families],
  );

  const activityMap = useMemo(
    () => new Map<string, Activity>(activities.map((a) => [a.id, a])),
    [activities],
  );

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Area</th>
            <th>Age Group</th>
            <th>Tags</th>
            <th>Connections</th>
            {viewMode === "cohorts" && <th>Status</th>}
          </tr>
        </thead>
        <tbody>
          {viewMode === "cohorts"
            ? cohortGroups.flatMap(([cohort, cohortPeople], index) => {
                const cohortColor = cohortColors[index % cohortColors.length];
                return [
                  <tr className="group-row" key={`group-${cohort}`}>
                    <td colSpan={6}>{cohort}</td>
                  </tr>,
                  ...cohortPeople.map((person) => {
                    const family = person.familyId
                      ? familyMap.get(person.familyId)
                      : null;
                    return (
                      <tr
                        key={`${cohort}-${person.id}`}
                        onClick={() => onSelectPerson(person.id)}
                        className="cohort-row"
                        style={{
                          borderLeft: `4px solid ${cohortColor}`,
                        }}
                      >
                        <td>
                          <div className="table-title">{person.name}</div>
                          <div className="table-subtitle">
                            {family?.familyName || "No family"}
                          </div>
                          <div
                            className="chip-row"
                            style={{ marginTop: "0.35rem" }}
                          >
                            {person.connectedActivities
                              .map((id: string) => activityMap.get(id))
                              .filter((a): a is Activity => a !== undefined)
                              .map((act: Activity) => (
                                <span
                                  key={act.id}
                                  className="chip chip--activity"
                                >
                                  {act.name}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td>{person.area || "-"}</td>
                        <td>
                          <span className={`chip chip--age-${person.ageGroup}`}>
                            {formatAgeGroup(person.ageGroup)}
                          </span>
                        </td>
                        <td>
                          <div className="chip-row">
                            {(person.cohorts || []).map((label: string) => (
                              <span key={label} className="chip chip--activity">
                                {label}
                              </span>
                            ))}
                            <span
                              className="chip chip--group"
                              style={{
                                borderColor: cohortColor,
                                color: cohortColor,
                              }}
                            >
                              Cohort
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="chip-row">
                            <span className="chip">
                              Activities: {person.connectedActivities.length}
                            </span>
                            <span className="chip chip--muted">
                              Links: {person.connections.length}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }),
                ];
              })
            : people.map((person) => {
                const family = person.familyId
                  ? familyMap.get(person.familyId)
                  : null;
                return (
                  <tr key={person.id} onClick={() => onSelectPerson(person.id)}>
                    <td>
                      <div className="table-title">{person.name}</div>
                      <div className="table-subtitle">
                        {family?.familyName || "No family"}
                      </div>
                    </td>
                    <td>{person.area || "-"}</td>
                    <td>
                      <span className={`chip chip--age-${person.ageGroup}`}>
                        {formatAgeGroup(person.ageGroup)}
                      </span>
                    </td>
                    <td>
                      <div className="chip-row">
                        {(person.cohorts || []).map((cohort: string) => (
                          <span key={cohort} className="chip chip--activity">
                            {cohort}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="chip-row">
                        <span className="chip">
                          Activities: {person.connectedActivities.length}
                        </span>
                        <span className="chip chip--muted">
                          Links: {person.connections.length}
                        </span>
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
