import { memo } from "react";
import { safePercentage } from "../../utils/dataValidation";

interface AgeGroupBreakdownProps {
  ageGroups: string[];
  ageGroupCounts: Record<string, number>;
  total: number;
}

export const AgeGroupBreakdown = memo(
  ({ ageGroups, ageGroupCounts, total }: AgeGroupBreakdownProps) => {
    if (total === 0) {
      return <p className="analytics-empty">No age group data available</p>;
    }

    return (
      <div className="breakdown-list">
        {ageGroups.map((age) => {
          const count = ageGroupCounts[age] || 0;
          const percentage = safePercentage(count, total, 1);

          return (
            <div key={age} className="breakdown-item">
              <span className={`chip chip--age-${age}`}>
                {age === "JY"
                  ? "JY"
                  : age.charAt(0).toUpperCase() + age.slice(1)}
              </span>
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

AgeGroupBreakdown.displayName = "AgeGroupBreakdown";
