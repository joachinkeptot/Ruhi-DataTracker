import { useMemo } from "react";
import {
  Person,
  Activity,
  Family,
  FilterState,
  AdvancedFilterState,
  ActivityType,
  EmploymentStatus,
} from "../types";

interface FilteredDataResult {
  filteredPeople: Person[];
  filteredItems: (Person | Activity | Family)[];
  visiblePeople: Person[];
  visibleActivities: Activity[];
  visibleFamilies: Family[];
}

/**
 * Hook for filtering people and activities based on filter state
 * Handles both basic and advanced filter logic with proper memoization
 */
export const useFilteredData = (
  people: Person[],
  activities: Activity[],
  families: Family[],
  searchQuery: string,
  filters: FilterState,
  advancedFilters: AdvancedFilterState,
  useAdvancedFilters: boolean,
  viewMode: string,
): FilteredDataResult => {
  // Get active items based on view mode
  const activeItems = useMemo(() => {
    if (viewMode === "activities") return activities;
    if (viewMode === "families") return families;
    return people;
  }, [viewMode, people, families, activities]);

  // Apply advanced filters with AND logic
  const filteredPeople = useMemo(() => {
    let filtered = [...people];

    // Areas filter
    if (advancedFilters.areas.length > 0) {
      filtered = filtered.filter((p) => advancedFilters.areas.includes(p.area));
    }

    // Age groups filter
    if (advancedFilters.ageGroups.length > 0) {
      filtered = filtered.filter((p) =>
        advancedFilters.ageGroups.includes(p.ageGroup),
      );
    }

    // Family filter
    if (advancedFilters.familyIds.length > 0) {
      filtered = filtered.filter(
        (p) => p.familyId && advancedFilters.familyIds.includes(p.familyId),
      );
    }

    // Has connections filter
    if (advancedFilters.hasConnections !== null) {
      filtered = filtered.filter((p) =>
        advancedFilters.hasConnections
          ? p.connectedActivities.length > 0
          : p.connectedActivities.length === 0,
      );
    }

    // Connected activity types filter
    if (advancedFilters.connectedActivityTypes.length > 0) {
      filtered = filtered.filter((p) => {
        const personActivities = p.connectedActivities
          .map((actId) => activities.find((a) => a.id === actId))
          .filter((a): a is Activity => a !== undefined);

        return personActivities.some((act) =>
          advancedFilters.connectedActivityTypes.includes(
            act.type as ActivityType,
          ),
        );
      });
    }

    // Ruhi level range filter
    if (advancedFilters.ruhiMin !== null) {
      filtered = filtered.filter(
        (p) => p.ruhiLevel >= advancedFilters.ruhiMin!,
      );
    }
    if (advancedFilters.ruhiMax !== null) {
      filtered = filtered.filter(
        (p) => p.ruhiLevel <= advancedFilters.ruhiMax!,
      );
    }

    // Home visit engagement filter
    if (advancedFilters.homeVisitDays !== null) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - advancedFilters.homeVisitDays);

      filtered = filtered.filter((p) =>
        p.homeVisits.some((visit) => new Date(visit.date) >= cutoffDate),
      );
    }

    // Conversation engagement filter
    if (advancedFilters.conversationDays !== null) {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - advancedFilters.conversationDays,
      );

      filtered = filtered.filter((p) =>
        p.conversations.some((conv) => new Date(conv.date) >= cutoffDate),
      );
    }

    // Employment status filter
    if (advancedFilters.employmentStatuses.length > 0) {
      filtered = filtered.filter(
        (p) =>
          p.employmentStatus &&
          advancedFilters.employmentStatuses.includes(
            p.employmentStatus as EmploymentStatus,
          ),
      );
    }

    // In school filter
    if (advancedFilters.inSchool !== null) {
      filtered = filtered.filter((p) =>
        advancedFilters.inSchool
          ? p.schoolName !== undefined && p.schoolName.trim() !== ""
          : !p.schoolName || p.schoolName.trim() === "",
      );
    }

    return filtered;
  }, [people, activities, advancedFilters]);

  // Apply basic filters and search (legacy support)
  const filteredItems = useMemo(() => {
    let items: (Person | Activity | Family)[] = activeItems as (
      | Person
      | Activity
      | Family
    )[];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const name = (
          "familyName" in item ? item.familyName : item.name
        ).toLowerCase();

        if ("ageGroup" in item) {
          const person = item as Person;
          const notes = (person.notes || "").toLowerCase();
          const area = person.area.toLowerCase();
          const jyTexts = person.jyTexts
            ? person.jyTexts
                .map((j) =>
                  typeof j === "string"
                    ? j
                    : j.bookName || `Book ${j.bookNumber}`,
                )
                .join(" ")
                .toLowerCase()
            : "";
          return (
            name.includes(query) ||
            area.includes(query) ||
            jyTexts.includes(query) ||
            notes.includes(query)
          );
        } else if ("type" in item) {
          const activity = item as Activity;
          const type = activity.type.toLowerCase();
          const leader = (
            activity.facilitator ||
            activity.leader ||
            ""
          ).toLowerCase();
          const activityNotes = (activity.notes || "").toLowerCase();
          return (
            name.includes(query) ||
            type.includes(query) ||
            leader.includes(query) ||
            activityNotes.includes(query)
          );
        } else {
          const family = item as Family;
          const area = (family.primaryArea || "").toLowerCase();
          const notes = (family.notes || "").toLowerCase();
          const phone = (family.phone || "").toLowerCase();
          const email = (family.email || "").toLowerCase();
          return (
            name.includes(query) ||
            area.includes(query) ||
            notes.includes(query) ||
            phone.includes(query) ||
            email.includes(query)
          );
        }
      });
    }

    // Structured filters
    if (viewMode !== "activities" && viewMode !== "families") {
      items = items.filter((item) => {
        if (!("ageGroup" in item)) return true;
        const person = item as Person;

        if (filters.area && person.area !== filters.area) return false;
        if (filters.category && person.ageGroup !== filters.category)
          return false;
        return true;
      });
    } else if (viewMode === "activities") {
      items = items.filter((item) => {
        if ("ageGroup" in item) return true;
        const activity = item as Activity;
        if (filters.activityType && activity.type !== filters.activityType)
          return false;
        return true;
      });
    } else {
      items = items.filter((item) => {
        if ("ageGroup" in item || "type" in item) return true;
        const family = item as Family;
        if (filters.area && family.primaryArea !== filters.area) return false;
        return true;
      });
    }

    return items;
  }, [activeItems, searchQuery, filters, viewMode]);

  // Get visible items based on filter mode
  const visiblePeople = useMemo(() => {
    if (viewMode === "activities" || viewMode === "families")
      return [] as Person[];
    return useAdvancedFilters ? filteredPeople : (filteredItems as Person[]);
  }, [viewMode, useAdvancedFilters, filteredPeople, filteredItems]);

  const visibleActivities = useMemo(() => {
    if (viewMode !== "activities") return activities;
    return filteredItems as Activity[];
  }, [viewMode, activities, filteredItems]);

  const visibleFamilies = useMemo(() => {
    if (viewMode !== "families") return families;
    return filteredItems as Family[];
  }, [viewMode, families, filteredItems]);

  return {
    filteredPeople,
    filteredItems,
    visiblePeople,
    visibleActivities,
    visibleFamilies,
  };
};
