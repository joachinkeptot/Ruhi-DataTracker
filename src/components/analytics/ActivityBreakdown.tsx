import { memo, useMemo } from "react";
import { safePercentage } from "../../utils/dataValidation";

interface ActivityBreakdownProps {
  activityCounts: Record<string, number>;
  total: number;
}

export const ActivityBreakdown = memo(
  ({ activityCounts, total }: ActivityBreakdownProps) => {
    const sortedActivities = useMemo(() => {
      return Object.entries(activityCounts).sort(([, a], [, b]) => b - a);
    }, [activityCounts]);

    if (sortedActivities.length === 0) {
      return <p className="analytics-empty">No activity data available</p>;
    }

    return (
      <div className="breakdown-list">
        {sortedActivities.map(([type, count]) => {
          const percentage = safePercentage(count, total, 1);

          return (
            <div key={type} className="breakdown-item">
              <span>{type}</span>
              <div className="breakdown-values">
                <strong>{count}</strong>
                <span className="breakdown-percentage">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

ActivityBreakdown.displayName = "ActivityBreakdown";
