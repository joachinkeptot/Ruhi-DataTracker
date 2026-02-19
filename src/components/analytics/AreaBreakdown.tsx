import { memo, useMemo } from "react";

interface AreaBreakdownProps {
  areaCounts: Record<string, number>;
  total: number;
}

export const AreaBreakdown = memo(
  ({ areaCounts, total }: AreaBreakdownProps) => {
    const sortedAreas = useMemo(() => {
      return Object.entries(areaCounts).sort(([, a], [, b]) => b - a);
    }, [areaCounts]);

    if (sortedAreas.length === 0) {
      return <p className="analytics-empty">No area data available</p>;
    }

    return (
      <div className="area-breakdown">
        {sortedAreas.map(([area, count]) => {
          const percentage = (count / total) * 100;

          return (
            <div key={area} className="area-item">
              <div className="area-name">{area}</div>
              <div className="area-bar">
                <div
                  className="area-bar-fill"
                  style={{ width: `${percentage}%` }}
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  role="progressbar"
                />
              </div>
              <div className="area-count">{count}</div>
            </div>
          );
        })}
      </div>
    );
  },
);

AreaBreakdown.displayName = "AreaBreakdown";
