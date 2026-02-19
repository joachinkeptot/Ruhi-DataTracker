import React, { memo } from "react";

interface MetricsCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}

export const MetricsCard = memo(
  ({ title, icon, children, className = "" }: MetricsCardProps) => {
    return (
      <div className={`summary-card ${className}`}>
        <h3>
          {icon} {title}
        </h3>
        {children}
      </div>
    );
  },
);

MetricsCard.displayName = "MetricsCard";
