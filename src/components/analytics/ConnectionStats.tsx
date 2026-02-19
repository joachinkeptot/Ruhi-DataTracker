import { memo } from "react";
import { safePercentage } from "../../utils/dataValidation";

interface ConnectionStatsProps {
  connectedPeople: number;
  disconnectedPeople: number;
  total: number;
}

export const ConnectionStats = memo(
  ({ connectedPeople, disconnectedPeople, total }: ConnectionStatsProps) => {
    const participationRate = safePercentage(connectedPeople, total, 1);

    return (
      <div className="summary-grid">
        <div>
          <strong>{connectedPeople}</strong> Connected
        </div>
        <div>
          <strong>{disconnectedPeople}</strong> Not Connected
        </div>
        <div className="summary-percentage">
          {participationRate}% participation
        </div>
      </div>
    );
  },
);

ConnectionStats.displayName = "ConnectionStats";
