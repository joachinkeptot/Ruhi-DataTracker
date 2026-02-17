import React, { useMemo } from "react";
import { useApp } from "./AppContext";

const Analytics: React.FC = () => {
  const { people, activities, families } = useApp();

  const metrics = useMemo(() => {
    const ageGroupCounts: Record<string, number> = {};
    people.forEach((p) => {
      ageGroupCounts[p.ageGroup] = (ageGroupCounts[p.ageGroup] || 0) + 1;
    });

    const activityCounts: Record<string, number> = {};
    activities.forEach((a) => {
      activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
    });

    const connectedPeople = people.filter(
      (p) => p.connectedActivities.length > 0,
    ).length;

    const totalHomeVisits = people.reduce(
      (sum, p) => sum + (p.homeVisits?.length || 0),
      0,
    );
    const totalConversations = people.reduce(
      (sum, p) => sum + (p.conversations?.length || 0),
      0,
    );

    const peopleWithRuhi = people.filter(
      (p) => (p.studyCircleBooks?.length || 0) > 0,
    ).length;
    const peopleWithJY = people.filter(
      (p) => (p.jyTexts?.length || 0) > 0,
    ).length;

    const areaCounts: Record<string, number> = {};
    people.forEach((p) => {
      areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
    });

    return {
      totalPeople: people.length,
      totalActivities: activities.length,
      totalFamilies: families.length,
      ageGroupCounts,
      activityCounts,
      connectedPeople,
      disconnectedPeople: people.length - connectedPeople,
      totalHomeVisits,
      totalConversations,
      peopleWithRuhi,
      peopleWithJY,
      areaCounts,
    };
  }, [people, activities, families]);

  return (
    <div className="analytics">
      <h2>Community Overview</h2>

      <div className="analytics__summary">
        <div className="summary-card">
          <h3>📊 Totals</h3>
          <div className="summary-grid">
            <div>
              <strong>{metrics.totalPeople}</strong> People
            </div>
            <div>
              <strong>{metrics.totalFamilies}</strong> Families
            </div>
            <div>
              <strong>{metrics.totalActivities}</strong> Activities
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>👥 Age Groups</h3>
          <div className="breakdown-list">
            {Object.entries(metrics.ageGroupCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([age, count]) => (
                <div key={age} className="breakdown-item">
                  <span className={`chip chip--age-${age}`}>
                    {age === "JY"
                      ? "JY"
                      : age.charAt(0).toUpperCase() + age.slice(1)}
                  </span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </div>

        <div className="summary-card">
          <h3>🎯 Activities</h3>
          <div className="breakdown-list">
            {Object.entries(metrics.activityCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <span>{type}</span>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </div>

        <div className="summary-card">
          <h3>🔗 Connections</h3>
          <div className="summary-grid">
            <div>
              <strong>{metrics.connectedPeople}</strong> Connected
            </div>
            <div>
              <strong>{metrics.disconnectedPeople}</strong> Not Connected
            </div>
            <div className="summary-percentage">
              {metrics.totalPeople > 0
                ? Math.round(
                    (metrics.connectedPeople / metrics.totalPeople) * 100,
                  )
                : 0}
              % participation
            </div>
          </div>
        </div>
      </div>

      <div className="analytics__section">
        <h3>📝 Engagement</h3>
        <div className="engagement-stats">
          <div className="stat-item">
            <div className="stat-value">{metrics.totalHomeVisits}</div>
            <div className="stat-label">Home Visits</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{metrics.totalConversations}</div>
            <div className="stat-label">Conversations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {metrics.totalHomeVisits + metrics.totalConversations}
            </div>
            <div className="stat-label">Total Interactions</div>
          </div>
        </div>
      </div>

      <div className="analytics__section">
        <h3>📚 Learning Progress</h3>
        <div className="learning-stats">
          <div className="stat-item">
            <div className="stat-value">{metrics.peopleWithRuhi}</div>
            <div className="stat-label">People with Ruhi Books</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{metrics.peopleWithJY}</div>
            <div className="stat-label">People with JY Texts</div>
          </div>
        </div>
      </div>

      <div className="analytics__section">
        <h3>📍 By Area</h3>
        <div className="area-breakdown">
          {Object.entries(metrics.areaCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([area, count]) => (
              <div key={area} className="area-item">
                <div className="area-name">{area}</div>
                <div className="area-bar">
                  <div
                    className="area-bar-fill"
                    style={{
                      width: `${(count / metrics.totalPeople) * 100}%`,
                    }}
                  />
                </div>
                <div className="area-count">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
