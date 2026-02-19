import React from "react";
import { useApp } from "../../context";
import { getAreaList, notifySuccess } from "../../utils";
import { NetworkVisualization } from "../network";
import { NetworkStats } from "../network";

export const Statistics: React.FC = () => {
  const {
    people,
    activities,
    families,
    viewMode,
    cohortViewMode,
    addFamily,
    showConnections,
  } = useApp();

  const handleAddFamily = () => {
    const familyName = prompt("Enter family name:");
    if (!familyName?.trim()) return;

    const primaryArea = prompt("Enter primary area (optional):") || "";
    const phone = prompt("Enter phone (optional):") || "";
    const email = prompt("Enter email (optional):") || "";
    const notes = prompt("Enter notes (optional):") || "";

    addFamily({
      familyName: familyName.trim(),
      primaryArea: primaryArea.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim() || undefined,
      dateAdded: new Date().toISOString(),
    });

    notifySuccess(`Family "${familyName.trim()}" added successfully!`);
  };

  if (viewMode === "people") {
    const areas = getAreaList(people);
    const areaStats: Record<string, number> = {};
    areas.forEach((area) => {
      areaStats[area] = people.filter((p) => p.area === area).length;
    });

    return (
      <div className="stats-breakdown">
        <h4>Statistics</h4>
        <div>
          <h5>People by Area</h5>
          {areas.length === 0 ? (
            <p>No areas defined</p>
          ) : (
            areas.map((area) => (
              <p key={area}>
                {area}: {areaStats[area]}
              </p>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewMode === "cohorts") {
    if (showConnections) {
      return (
        <div className="stats-breakdown">
          <h4>Network Visualization</h4>
          <NetworkVisualization
            people={people}
            showConnections={showConnections}
          />
          <NetworkStats people={people} showConnections={showConnections} />
        </div>
      );
    }

    if (cohortViewMode === "families") {
      const familyCounts: Record<string, number> = {};
      const noFamily = people.filter((p) => !p.familyId).length;

      families.forEach((family) => {
        familyCounts[family.familyName] = people.filter(
          (p) => p.familyId === family.id || p.familyId === family.familyName,
        ).length;
      });

      const sortedFamilies = Object.keys(familyCounts).sort();

      return (
        <div className="stats-breakdown">
          <h4>Statistics</h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h5 style={{ margin: 0 }}>Families</h5>
            <button
              className="btn btn--sm btn--primary"
              onClick={handleAddFamily}
            >
              + Family
            </button>
          </div>
          {families.length === 0 ? (
            <p>No families defined</p>
          ) : (
            <>
              {sortedFamilies.map((name) => (
                <p key={name}>
                  {name}: {familyCounts[name]} members
                </p>
              ))}
              {noFamily > 0 && (
                <p>
                  <em>No Family: {noFamily}</em>
                </p>
              )}
            </>
          )}
        </div>
      );
    } else {
      const ageGroupCounts: Record<string, number> = {};
      const ruhiCounts: Record<number, number> = {};

      people.forEach((person) => {
        const age = person.ageGroup;
        ageGroupCounts[age] = (ageGroupCounts[age] || 0) + 1;

        const level = person.ruhiLevel;
        ruhiCounts[level] = (ruhiCounts[level] || 0) + 1;
      });

      const sortedRuhiLevels = Object.keys(ruhiCounts)
        .map(Number)
        .sort((a, b) => b - a);

      return (
        <div className="stats-breakdown">
          <h4>Statistics</h4>
          <div>
            <h5>Age Groups</h5>
            {Object.entries(ageGroupCounts).map(([age, count]) => (
              <p key={age}>
                {age.charAt(0).toUpperCase() + age.slice(1)}: {count}
              </p>
            ))}
            <h5 style={{ marginTop: "1rem" }}>Ruhi Levels</h5>
            {sortedRuhiLevels.map((level) => (
              <p key={level}>
                Level {level}: {ruhiCounts[level]}
              </p>
            ))}
          </div>
        </div>
      );
    }
  }

  if (viewMode === "families") {
    const familyCounts: Record<string, number> = {};
    families.forEach((family) => {
      familyCounts[family.familyName] = people.filter(
        (p) => p.familyId === family.id || p.familyId === family.familyName,
      ).length;
    });

    const sortedFamilies = Object.keys(familyCounts).sort();

    return (
      <div className="stats-breakdown">
        <h4>Statistics</h4>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h5 style={{ margin: 0 }}>Families</h5>
          <button
            className="btn btn--sm btn--primary"
            onClick={handleAddFamily}
          >
            + Family
          </button>
        </div>
        {families.length === 0 ? (
          <p>No families defined</p>
        ) : (
          sortedFamilies.map((name) => (
            <p key={name}>
              {name}: {familyCounts[name]} members
            </p>
          ))
        )}
      </div>
    );
  }

  if (viewMode === "activities") {
    const counts = { JY: 0, CC: 0, StudyCircle: 0, Devotional: 0 };
    let totalParticipation = 0;

    activities.forEach((activity) => {
      if (activity.type in counts)
        counts[activity.type as keyof typeof counts]++;

      const connectedPeople = people.filter((p) =>
        p.connectedActivities.includes(activity.id),
      ).length;
      totalParticipation += connectedPeople;
    });

    const avgParticipation =
      activities.length > 0
        ? (totalParticipation / activities.length).toFixed(1)
        : 0;

    return (
      <div className="stats-breakdown">
        <h4>Statistics</h4>
        <div>
          <h5>Activity Types</h5>
          <p>JY: {counts.JY}</p>
          <p>CC: {counts.CC}</p>
          <p>Study Circle: {counts.StudyCircle}</p>
          <p>Devotional: {counts.Devotional}</p>
          <h5 style={{ marginTop: "1rem" }}>Participation</h5>
          <p>Total Connections: {totalParticipation}</p>
          <p>Avg per Activity: {avgParticipation}</p>
        </div>
      </div>
    );
  }

  return null;
};
