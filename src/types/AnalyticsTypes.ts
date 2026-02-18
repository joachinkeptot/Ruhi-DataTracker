// Analytics-specific type definitions

export interface AnalyticsMetrics {
  totalPeople: number;
  totalActivities: number;
  totalFamilies: number;
  ageGroups: string[];
  ageGroupCounts: Record<string, number>;
  activityCounts: Record<string, number>;
  connectedPeople: number;
  disconnectedPeople: number;
  totalHomeVisits: number;
  totalConversations: number;
  peopleWithRuhi: number;
  peopleWithJY: number;
  areaCounts: Record<string, number>;
}

export interface SummaryCardProps {
  title: string;
  icon: string;
  content: React.ReactNode;
}

export interface BreakdownItem {
  label: string;
  value: number;
  percentage?: number;
}
