import { useMemo } from "react";
import { Person, Activity, Family } from "../types";

interface ComputedViewsResult {
  totalItems: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  pagedPeople: Person[];
  pagedActivities: Activity[];
  pagedFamilies: Family[];
  cohortGroups: Array<[string, Person[]]>;
  quickStats: {
    totalPeople: number;
    totalActivities: number;
    totalFamilies: number;
    connectedPeople: number;
    totalConnections: number;
  };
}

const ITEMS_PER_PAGE = 50;

/**
 * Hook for computing view-related data
 * Handles pagination, cohorts, and quick stats
 */
export const useComputedViews = (
  people: Person[],
  activities: Activity[],
  families: Family[],
  visiblePeople: Person[],
  visibleActivities: Activity[],
  visibleFamilies: Family[],
  viewMode: string,
  currentPage: number,
): ComputedViewsResult => {
  const totalItems = useMemo(() => {
    if (viewMode === "activities") return visibleActivities.length;
    if (viewMode === "families") return visibleFamilies.length;
    return visiblePeople.length;
  }, [
    viewMode,
    visibleActivities.length,
    visibleFamilies.length,
    visiblePeople.length,
  ]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
    [totalItems],
  );

  const pageStart = useMemo(
    () => (currentPage - 1) * ITEMS_PER_PAGE,
    [currentPage],
  );

  const pageEnd = useMemo(() => pageStart + ITEMS_PER_PAGE, [pageStart]);

  const pagedPeople = useMemo(
    () => visiblePeople.slice(pageStart, pageEnd),
    [visiblePeople, pageStart, pageEnd],
  );

  const pagedActivities = useMemo(
    () => visibleActivities.slice(pageStart, pageEnd),
    [visibleActivities, pageStart, pageEnd],
  );

  const pagedFamilies = useMemo(
    () => visibleFamilies.slice(pageStart, pageEnd),
    [visibleFamilies, pageStart, pageEnd],
  );

  const cohortGroups = useMemo(() => {
    const groups = new Map<string, Person[]>();
    const unassigned: Person[] = [];

    visiblePeople.forEach((person) => {
      const cohorts = person.cohorts || [];
      if (cohorts.length === 0) {
        unassigned.push(person);
        return;
      }
      cohorts.forEach((cohort) => {
        if (!groups.has(cohort)) {
          groups.set(cohort, []);
        }
        const groupArray = groups.get(cohort);
        if (groupArray) {
          groupArray.push(person);
        }
      });
    });

    if (unassigned.length > 0) {
      groups.set("Unassigned", unassigned);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visiblePeople]);

  const quickStats = useMemo(() => {
    const totalPeople = people.length;
    const totalActivities = activities.length;
    const totalFamilies = families.length;
    const connectedPeople = people.filter(
      (p) => p.connectedActivities.length > 0,
    ).length;
    const totalConnections = people.reduce(
      (sum, p) => sum + p.connections.length,
      0,
    );

    return {
      totalPeople,
      totalActivities,
      totalFamilies,
      connectedPeople,
      totalConnections,
    };
  }, [people, activities, families]);

  return {
    totalItems,
    totalPages,
    pageStart,
    pageEnd,
    pagedPeople,
    pagedActivities,
    pagedFamilies,
    cohortGroups,
    quickStats,
  };
};
