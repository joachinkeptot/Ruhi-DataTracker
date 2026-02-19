import { memo } from "react";

interface LearningProgressProps {
  peopleWithRuhi: number;
  peopleWithJY: number;
}

export const LearningProgress = memo(
  ({ peopleWithRuhi, peopleWithJY }: LearningProgressProps) => {
    return (
      <div className="learning-stats">
        <div className="stat-item">
          <div className="stat-value">{peopleWithRuhi}</div>
          <div className="stat-label">People with Ruhi Books</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{peopleWithJY}</div>
          <div className="stat-label">People with JY Texts</div>
        </div>
      </div>
    );
  },
);

LearningProgress.displayName = "LearningProgress";
