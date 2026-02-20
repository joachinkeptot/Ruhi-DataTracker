import React, { useState, useMemo, useEffect } from "react";
import { AppProvider, useApp } from "./context";
import { Header, Tools } from "./components/common";
import { FilterBar, AdvancedFilters } from "./components/filters";
import { NetworkVisualization } from "./components/network";
import {
  DetailPanel,
  Statistics,
  HomeVisitsTracker,
} from "./components/panels";
import { ItemModal, FamilyModal, InputModal, ConnectionModal } from "./components/modals";
import { Forms, PublicForms } from "./components/forms";
import Analytics from "./components/analytics/Analytics";
import {
  AnalyticsErrorBoundary,
  GlobalErrorBoundary,
} from "./components/errors";
import { notifyWarning } from "./utils";
import {
  FilterState,
  AdvancedFilterState,
  Person,
  Activity,
  Family,
  ActivityType,
  EmploymentStatus,
} from "./types";
import { exportToCSV } from "./utils";
import "./styles/index.css";

const ITEMS_PER_PAGE = 50;

const AppContent: React.FC = () => {
  const {
    people,
    activities,
    families,
    viewMode,
    savedQueries,
    addSavedQuery,
    setSelected,
    showConnections,
    updatePerson,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    area: "",
    category: "",
    activityType: "",
    ruhiMin: null,
    ruhiMax: null,
    jyText: "",
  });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    areas: [],
    ageGroups: [],
    familyIds: [],
    hasConnections: null,
    connectedActivityTypes: [],
    ruhiMin: null,
    ruhiMax: null,
    homeVisitDays: null,
    conversationDays: null,
    employmentStatuses: [],
    inSchool: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [connectionDraft, setConnectionDraft] = useState<{
    personA?: Person;
    personB?: Person;
  }>({});
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortPeople, setNewCohortPeople] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [renameCohortTarget, setRenameCohortTarget] = useState<string | null>(null);
  const [deleteCohortTarget, setDeleteCohortTarget] = useState<string | null>(null);
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);

  const cohortColors = [
    "#60a5fa",
    "#f472b6",
    "#a78bfa",
    "#34d399",
    "#f59e0b",
    "#38bdf8",
  ];

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
          .filter(Boolean) as Activity[];

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
          const jyTexts = item.jyTexts
            ? item.jyTexts
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

  const handleAddItem = () => {
    setEditingPersonId(null);
    setEditingActivityId(null);
    setIsModalOpen(true);
  };

  const handleEditPerson = (id: string) => {
    setEditingPersonId(id);
    setEditingActivityId(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (id: string) => {
    setEditingActivityId(id);
    setEditingPersonId(null);
    setIsModalOpen(true);
  };

  const handleAddFamily = () => {
    setEditingFamilyId(null);
    setIsFamilyModalOpen(true);
  };

  const handleEditFamily = (id: string) => {
    setEditingFamilyId(id);
    setIsFamilyModalOpen(true);
  };

  const handleAddConnection = (personA?: Person, personB?: Person) => {
    setConnectionDraft({ personA, personB });
    setIsConnectionModalOpen(true);
  };

  const handleCreateCohort = () => {
    const name = newCohortName.trim();
    if (!name) return;
    if (newCohortPeople.length === 0) {
      notifyWarning("Select at least one person for this cohort");
      return;
    }
    newCohortPeople.forEach((personId) => {
      const person = people.find((p) => p.id === personId);
      if (!person) return;
      const nextCohorts = person.cohorts || [];
      if (!nextCohorts.includes(name)) {
        updatePerson(personId, { cohorts: [...nextCohorts, name] });
      }
    });
    setNewCohortName("");
    setNewCohortPeople([]);
  };

  const handleRenameCohort = (cohort: string) => {
    setRenameCohortTarget(cohort);
  };

  const handleConfirmRenameCohort = (values: Record<string, string>) => {
    const nextName = values.name?.trim();
    if (nextName && nextName !== renameCohortTarget) {
      people.forEach((person) => {
        if (!(person.cohorts || []).includes(renameCohortTarget!)) return;
        const next = (person.cohorts || []).map((label) =>
          label === renameCohortTarget ? nextName : label,
        );
        updatePerson(person.id, { cohorts: Array.from(new Set(next)) });
      });
    }
    setRenameCohortTarget(null);
  };

  const handleDeleteCohort = (cohort: string) => {
    setDeleteCohortTarget(cohort);
  };

  const handleConfirmDeleteCohort = (_values: Record<string, string>) => {
    if (!deleteCohortTarget) return;
    people.forEach((person) => {
      if (!(person.cohorts || []).includes(deleteCohortTarget)) return;
      const next = (person.cohorts || []).filter((label) => label !== deleteCohortTarget);
      updatePerson(person.id, { cohorts: next });
    });
    setDeleteCohortTarget(null);
  };

  const handleSaveQuery = () => {
    setShowSaveQueryModal(true);
  };

  const handleConfirmSaveQuery = (values: Record<string, string>) => {
    if (!values.name?.trim()) return;
    addSavedQuery({
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      filters: advancedFilters,
      createdAt: new Date().toISOString(),
    });
    setShowSaveQueryModal(false);
  };

  const handleLoadQuery = (queryId: string) => {
    const query = savedQueries.find((q) => q.id === queryId);
    if (query) {
      setAdvancedFilters(query.filters);
      setUseAdvancedFilters(true);
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(filteredPeople, families, `roommap-export-${timestamp}.csv`);
  };

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

  // Reset to first page whenever the filtered list or view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, filteredPeople, filteredItems]);

  const totalItems =
    viewMode === "activities"
      ? visibleActivities.length
      : viewMode === "families"
        ? visibleFamilies.length
        : visiblePeople.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;

  const pagedPeople = visiblePeople.slice(pageStart, pageEnd);
  const pagedActivities = visibleActivities.slice(pageStart, pageEnd);
  const pagedFamilies = visibleFamilies.slice(pageStart, pageEnd);

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
        if (!groups.has(cohort)) groups.set(cohort, []);
        groups.get(cohort)!.push(person);
      });
    });

    if (unassigned.length > 0) {
      groups.set("Unassigned", unassigned);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visiblePeople]);

  const cohortIndex = useMemo(() => {
    const groups = new Map<string, Person[]>();
    people.forEach((person) => {
      (person.cohorts || []).forEach((cohort) => {
        if (!groups.has(cohort)) groups.set(cohort, []);
        groups.get(cohort)!.push(person);
      });
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [people]);

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

  return (
    <div className="app">
      <main className="layout">
        <section className="panel panel--full">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddItem={handleAddItem}
            onAddConnection={() => handleAddConnection()}
          />

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0 1rem",
              marginBottom: "0.5rem",
            }}
          >
            <button
              className={`btn btn--sm ${!useAdvancedFilters ? "btn--primary" : ""}`}
              onClick={() => setUseAdvancedFilters(false)}
            >
              Basic Filters
            </button>
            <button
              className={`btn btn--sm ${useAdvancedFilters ? "btn--primary" : ""}`}
              onClick={() => setUseAdvancedFilters(true)}
            >
              Advanced Filters
            </button>
          </div>

          {!useAdvancedFilters && (
            <FilterBar filters={filters} onFilterChange={setFilters} />
          )}

          {useAdvancedFilters && (
            <AdvancedFilters
              filters={advancedFilters}
              onFilterChange={setAdvancedFilters}
              filteredPeople={filteredPeople}
              onExport={handleExport}
              onSaveQuery={handleSaveQuery}
              onLoadQuery={handleLoadQuery}
            />
          )}

          {viewMode === "analytics" ? (
            <div className="panel__section">
              <AnalyticsErrorBoundary>
                <Analytics />
              </AnalyticsErrorBoundary>
            </div>
          ) : viewMode === "homevisits" ? (
            <div className="panel__section">
              <HomeVisitsTracker />
            </div>
          ) : viewMode === "forms" ? (
            <div className="panel__section">
              <Forms />
            </div>
          ) : (
            <div className="panel__section">
              <div className="dashboard-layout">
                <div className="dashboard-main">
                  <div className="cards-row">
                    <div className="stat-card">
                      <div className="stat-card__label">People</div>
                      <div className="stat-card__value">
                        {quickStats.totalPeople}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">Activities</div>
                      <div className="stat-card__value">
                        {quickStats.totalActivities}
                      </div>
                      <div className="stat-card__meta">
                        Connected: {quickStats.connectedPeople}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">Families</div>
                      <div className="stat-card__value">
                        {quickStats.totalFamilies}
                      </div>
                      <div className="stat-card__meta">
                        Links: {quickStats.totalConnections}
                      </div>
                    </div>
                  </div>

                  <div className="data-table-card">
                    <div className="data-table-card__header">
                      <h2>
                        {viewMode === "activities"
                          ? "Activities"
                          : viewMode === "families"
                            ? "Families"
                            : "People"}
                      </h2>
                      <span className="muted">
                        {viewMode === "activities"
                          ? visibleActivities.length
                          : viewMode === "families"
                            ? visibleFamilies.length
                            : visiblePeople.length}{" "}
                        items
                      </span>
                    </div>
                    {viewMode === "activities" ? (
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Type</th>
                              <th>Leader</th>
                              <th>Participants</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedActivities.map((activity) => (
                              <tr
                                key={activity.id}
                                onClick={() =>
                                  setSelected({
                                    type: "activities",
                                    id: activity.id,
                                  })
                                }
                              >
                                <td>
                                  <div className="table-title">
                                    {activity.name}
                                  </div>
                                  <div className="table-subtitle">
                                    {activity.area || "No area"}
                                  </div>
                                </td>
                                <td>
                                  <span className="chip">{activity.type}</span>
                                </td>
                                <td>
                                  {activity.facilitator ||
                                    activity.leader ||
                                    "-"}
                                </td>
                                <td>
                                  <div className="chip-row">
                                    {activity.participantIds.length === 0 &&
                                      "-"}
                                    {activity.participantIds
                                      .slice(0, 3)
                                      .map((id) => {
                                        const person = people.find(
                                          (p) => p.id === id,
                                        );
                                        return (
                                          <span
                                            key={id}
                                            className="chip chip--muted"
                                          >
                                            {person?.name || "Unknown"}
                                          </span>
                                        );
                                      })}
                                    {activity.participantIds.length > 3 && (
                                      <span className="chip chip--muted">
                                        +{activity.participantIds.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : viewMode === "families" ? (
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Family</th>
                              <th>Area</th>
                              <th>Members</th>
                              <th>Contact</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedFamilies.map((family) => {
                              const memberCount = people.filter(
                                (p) =>
                                  p.familyId === family.id ||
                                  p.familyId === family.familyName,
                              ).length;
                              return (
                                <tr
                                  key={family.id}
                                  onClick={() =>
                                    setSelected({
                                      type: "families",
                                      id: family.id,
                                    })
                                  }
                                >
                                  <td>
                                    <div className="table-title">
                                      {family.familyName}
                                    </div>
                                    <div className="table-subtitle">
                                      {family.notes || "No notes"}
                                    </div>
                                  </td>
                                  <td>{family.primaryArea || "-"}</td>
                                  <td>{memberCount}</td>
                                  <td>
                                    {(family.phone || family.email) && (
                                      <div className="chip-row">
                                        {family.phone && (
                                          <span className="chip">
                                            {family.phone}
                                          </span>
                                        )}
                                        {family.email && (
                                          <span className="chip chip--muted">
                                            {family.email}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {!family.phone && !family.email && "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Area</th>
                              <th>Age Group</th>
                              <th>Tags</th>
                              <th>Connections</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewMode === "cohorts"
                              ? cohortGroups.flatMap(
                                  ([cohort, cohortPeople], index) => {
                                    const cohortColor =
                                      cohortColors[index % cohortColors.length];
                                    return [
                                      <tr
                                        className="group-row"
                                        key={`group-${cohort}`}
                                      >
                                        <td colSpan={6}>{cohort}</td>
                                      </tr>,
                                      ...cohortPeople.map((person) => {
                                        const familyName = person.familyId
                                          ? families.find(
                                              (f) => f.id === person.familyId,
                                            )?.familyName || ""
                                          : "";
                                        return (
                                          <tr
                                            key={`${cohort}-${person.id}`}
                                            onClick={() =>
                                              setSelected({
                                                type: "people",
                                                id: person.id,
                                              })
                                            }
                                            className="cohort-row"
                                            style={{
                                              borderLeft: `4px solid ${cohortColor}`,
                                            }}
                                          >
                                            <td>
                                              <div className="table-title">
                                                {person.name}
                                              </div>
                                              <div className="table-subtitle">
                                                {familyName || "No family"}
                                              </div>
                                              <div
                                                className="chip-row"
                                                style={{ marginTop: "0.35rem" }}
                                              >
                                                {person.connectedActivities
                                                  .map((id) =>
                                                    activities.find(
                                                      (a) => a.id === id,
                                                    ),
                                                  )
                                                  .filter(Boolean)
                                                  .map((act) => (
                                                    <span
                                                      key={act!.id}
                                                      className="chip chip--activity"
                                                    >
                                                      {act!.name}
                                                    </span>
                                                  ))}
                                              </div>
                                            </td>
                                            <td>{person.area || "-"}</td>
                                            <td>
                                              <span
                                                className={`chip chip--age-${person.ageGroup}`}
                                              >
                                                {person.ageGroup === "JY"
                                                  ? "JY"
                                                  : person.ageGroup
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    person.ageGroup.slice(1)}
                                              </span>
                                            </td>
                                            <td>
                                              <div className="chip-row">
                                                {(person.cohorts || []).map(
                                                  (label) => (
                                                    <span
                                                      key={label}
                                                      className="chip chip--activity"
                                                    >
                                                      {label}
                                                    </span>
                                                  ),
                                                )}
                                                <span
                                                  className="chip chip--group"
                                                  style={{
                                                    borderColor: cohortColor,
                                                    color: cohortColor,
                                                  }}
                                                >
                                                  Cohort
                                                </span>
                                              </div>
                                            </td>
                                            <td>
                                              <div className="chip-row">
                                                <span className="chip">
                                                  Activities:{" "}
                                                  {
                                                    person.connectedActivities
                                                      .length
                                                  }
                                                </span>
                                                <span className="chip chip--muted">
                                                  Links:{" "}
                                                  {person.connections.length}
                                                </span>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      }),
                                    ];
                                  },
                                )
                              : pagedPeople.map((person) => {
                                  const familyName = person.familyId
                                    ? families.find(
                                        (f) => f.id === person.familyId,
                                      )?.familyName || ""
                                    : "";
                                  return (
                                    <tr
                                      key={person.id}
                                      onClick={() =>
                                        setSelected({
                                          type: "people",
                                          id: person.id,
                                        })
                                      }
                                    >
                                      <td>
                                        <div className="table-title">
                                          {person.name}
                                        </div>
                                        <div className="table-subtitle">
                                          {familyName || "No family"}
                                        </div>
                                      </td>
                                      <td>{person.area || "-"}</td>
                                      <td>
                                        <span
                                          className={`chip chip--age-${person.ageGroup}`}
                                        >
                                          {person.ageGroup === "JY"
                                            ? "JY"
                                            : person.ageGroup
                                                .charAt(0)
                                                .toUpperCase() +
                                              person.ageGroup.slice(1)}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="chip-row">
                                          {(person.cohorts || []).map(
                                            (cohort) => (
                                              <span
                                                key={cohort}
                                                className="chip chip--activity"
                                              >
                                                {cohort}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </td>
                                      <td>
                                        <div className="chip-row">
                                          <span className="chip">
                                            Activities:{" "}
                                            {person.connectedActivities.length}
                                          </span>
                                          <span className="chip chip--muted">
                                            Links: {person.connections.length}
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "1rem",
                          padding: "0.75rem 0",
                          fontSize: "0.875rem",
                        }}
                      >
                        <button
                          className="btn btn--sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          ← Prev
                        </button>
                        <span className="muted">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="btn btn--sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="dashboard-side">
                  <div className="side-card">
                    <h2>Details</h2>
                    <DetailPanel
                      onEdit={handleEditPerson}
                      onEditActivity={handleEditActivity}
                      onEditFamily={handleEditFamily}
                    />
                  </div>
                  {viewMode === "cohorts" && (
                    <div className="side-card">
                      <h2>Cohort Manager</h2>
                      <div className="form-row">
                        <label className="muted">Cohort Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Northside JY"
                          value={newCohortName}
                          onChange={(e) => setNewCohortName(e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <label className="muted">Add People</label>
                        <select
                          multiple
                          size={6}
                          value={newCohortPeople}
                          onChange={(e) =>
                            setNewCohortPeople(
                              Array.from(
                                e.target.selectedOptions,
                                (opt) => opt.value,
                              ),
                            )
                          }
                        >
                          {people.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </select>
                        <small className="hint">
                          Hold Ctrl/Cmd to select multiple
                        </small>
                      </div>
                      <button
                        className="btn btn--primary"
                        onClick={handleCreateCohort}
                      >
                        Create Cohort
                      </button>

                      <div className="cohort-list">
                        {cohortIndex.length === 0 ? (
                          <p className="hint">No cohorts yet</p>
                        ) : (
                          cohortIndex.map(([cohort, members]) => (
                            <div key={cohort} className="cohort-item">
                              <div>
                                <div className="cohort-name">{cohort}</div>
                                <div className="cohort-meta">
                                  {members.length} people
                                </div>
                              </div>
                              <div className="cohort-actions">
                                <button
                                  className="btn btn--sm"
                                  onClick={() => handleRenameCohort(cohort)}
                                >
                                  Rename
                                </button>
                                <button
                                  className="btn btn--sm"
                                  onClick={() => handleDeleteCohort(cohort)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  <div className="side-card">
                    <Statistics onAddFamily={() => setIsFamilyModalOpen(true)} />
                    <div className="legend">
                      <span className="legend__title">Age Groups</span>
                      <span className="legend__item legend__item--child">
                        Child
                      </span>
                      <span className="legend__item legend__item--jy">JY</span>
                      <span className="legend__item legend__item--youth">
                        Youth
                      </span>
                      <span className="legend__item legend__item--adult">
                        Adult
                      </span>
                      <span className="legend__item legend__item--parents">
                        Parents
                      </span>
                      <span className="legend__item legend__item--elder">
                        Elder
                      </span>
                    </div>
                  </div>
                  <div className="side-card">
                    <div className="side-card__header">
                      <h3>Connections Preview</h3>
                      <span className="muted">Optional</span>
                    </div>
                    {showConnections ? (
                      <div className="mini-network">
                        <NetworkVisualization
                          people={people}
                          showConnections={showConnections}
                          onNodeClick={(personId) =>
                            setSelected({ type: "people", id: personId })
                          }
                          onAddConnection={(personA, personB) =>
                            handleAddConnection(personA, personB)
                          }
                        />
                      </div>
                    ) : (
                      <p className="hint">
                        Turn on “Show Connections” to preview the network.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )}

          <Tools />
        </section>
      </main>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPersonId(null);
          setEditingActivityId(null);
        }}
        editingPersonId={editingPersonId}
        editingActivityId={editingActivityId}
        onAddFamily={handleAddFamily}
      />

      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => {
          setIsFamilyModalOpen(false);
          setEditingFamilyId(null);
        }}
        editingFamilyId={editingFamilyId}
      />

      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        personA={connectionDraft.personA}
        personB={connectionDraft.personB}
      />

      <InputModal
        isOpen={renameCohortTarget !== null}
        title="Rename Cohort"
        fields={[{ key: "name", label: "New name", defaultValue: renameCohortTarget ?? "", required: true }]}
        confirmLabel="Rename"
        onConfirm={handleConfirmRenameCohort}
        onClose={() => setRenameCohortTarget(null)}
      />

      <InputModal
        isOpen={deleteCohortTarget !== null}
        title="Remove Cohort"
        message={`Remove cohort "${deleteCohortTarget}" from all people? This cannot be undone.`}
        confirmLabel="Remove"
        confirmDanger
        onConfirm={handleConfirmDeleteCohort}
        onClose={() => setDeleteCohortTarget(null)}
      />

      <InputModal
        isOpen={showSaveQueryModal}
        title="Save Query"
        fields={[
          { key: "name", label: "Name", placeholder: "e.g., Active JY Youth", required: true },
          { key: "description", label: "Description (optional)", placeholder: "What this query finds" },
        ]}
        confirmLabel="Save"
        onConfirm={handleConfirmSaveQuery}
        onClose={() => setShowSaveQueryModal(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  // Check if this is a public form access
  const urlParams = new URLSearchParams(window.location.search);
  const isPublic = urlParams.get("public") === "true";

  if (isPublic) {
    return <PublicForms />;
  }

  return (
    <AppProvider>
      <GlobalErrorBoundary>
        <AppContent />
      </GlobalErrorBoundary>
    </AppProvider>
  );
};

export default App;
