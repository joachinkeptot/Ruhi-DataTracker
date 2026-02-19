import { useMemo } from "react";
import { Person, Activity, Family } from "../types";
import { AnalyticsMetrics } from "../types/AnalyticsTypes";

export const useAnalyticsMetrics = (
  people: Person[],
  activities: Activity[],
  families: Family[],
): AnalyticsMetrics => {
  return useMemo(() => {
    // Safely cast and validate input data
    const validPeople = Array.isArray(people) ? people : [];
    const validActivities = Array.isArray(activities) ? activities : [];
    const validFamilies = Array.isArray(families) ? families : [];

    const ageGroups = ["child", "JY", "youth", "adult", "parents", "elder"];
    const ageGroupCounts: Record<string, number> = Object.fromEntries(
      ageGroups.map((age) => [age, 0]),
    );

    // Calculate age group distribution with validation
    validPeople.forEach((p) => {
      const age = p?.ageGroup || "unknown";
      ageGroupCounts[age] = (ageGroupCounts[age] || 0) + 1;
    });

    // Calculate activity type distribution with validation
    const activityCounts: Record<string, number> = {};
    validActivities.forEach((a) => {
      const type = a?.type || "unknown";
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });

    // Calculate connections with safe array access
    const connectedPeople = validPeople.filter(
      (p) =>
        Array.isArray(p?.connectedActivities) &&
        p.connectedActivities.length > 0,
    ).length;

    // Calculate engagement metrics with safe array access
    const totalHomeVisits = validPeople.reduce((sum, p) => {
      const visits = Array.isArray(p?.homeVisits) ? p.homeVisits.length : 0;
      return sum + visits;
    }, 0);

    const totalConversations = validPeople.reduce((sum, p) => {
      const conversations = Array.isArray(p?.conversations)
        ? p.conversations.length
        : 0;
      return sum + conversations;
    }, 0);

    // Calculate learning progress with safe array access
    const peopleWithRuhi = validPeople.filter(
      (p) =>
        Array.isArray(p?.studyCircleBooks) && p.studyCircleBooks.length > 0,
    ).length;

    const peopleWithJY = validPeople.filter(
      (p) => Array.isArray(p?.jyTexts) && p.jyTexts.length > 0,
    ).length;

    // Calculate area distribution with validation
    const areaCounts: Record<string, number> = {};
    validPeople.forEach((p) => {
      const area = p?.area || "unknown";
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    return {
      totalPeople: validPeople.length,
      totalActivities: validActivities.length,
      totalFamilies: validFamilies.length,
      ageGroups,
      ageGroupCounts,
      activityCounts,
      connectedPeople,
      disconnectedPeople: validPeople.length - connectedPeople,
      totalHomeVisits,
      totalConversations,
      peopleWithRuhi,
      peopleWithJY,
      areaCounts,
    };
  }, [people, activities, families]);
};
