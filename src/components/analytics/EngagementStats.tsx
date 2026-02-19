import { memo } from "react";

interface EngagementStatsProps {
  totalHomeVisits: number;
  totalConversations: number;
}

export const EngagementStats = memo(
  ({ totalHomeVisits, totalConversations }: EngagementStatsProps) => {
    const totalInteractions = totalHomeVisits + totalConversations;

    return (
      <div className="engagement-stats">
        <div className="stat-item">
          <div className="stat-value">{totalHomeVisits}</div>
          <div className="stat-label">Home Visits</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalConversations}</div>
          <div className="stat-label">Conversations</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalInteractions}</div>
          <div className="stat-label">Total Interactions</div>
        </div>
      </div>
    );
  },
);

EngagementStats.displayName = "EngagementStats";
