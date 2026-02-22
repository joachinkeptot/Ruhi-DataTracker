import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context";
import { Header, Tools } from "./components/common";
import { FilterBar, AdvancedFilters } from "./components/filters";
import { NetworkVisualization } from "./components/network";
import {
  DetailPanel,
  Statistics,
  HomeVisitsTracker,
  ProgramsPanel,
  Reflections,
} from "./components/panels";
import {
  ItemModal,
  FamilyModal,
  InputModal,
  ConnectionModal,
} from "./components/modals";
import { Forms, PublicForms } from "./components/forms";
import Analytics from "./components/analytics/Analytics";
import {
  AnalyticsErrorBoundary,
  GlobalErrorBoundary,
} from "./components/errors";
import {
  PeopleTable,
  ActivitiesTable,
  FamiliesTable,
} from "./components/tables";
import { notifyWarning } from "./utils";
import { FilterState, AdvancedFilterState, Person } from "./types";
import { exportToCSV } from "./utils";
import { useFilteredData, useModalState, useComputedViews } from "./hooks";
import "./styles/index.css";

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

  // Modal and editing state
  const [modalState, modalActions] = useModalState();

  // Filter state
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
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [newCohortName, setNewCohortName] = useState("");
  const [newCohortPeople, setNewCohortPeople] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [renameCohortTarget, setRenameCohortTarget] = useState<string | null>(
    null,
  );
  const [deleteCohortTarget, setDeleteCohortTarget] = useState<string | null>(
    null,
  );

  // Get filtered data
  const { filteredPeople, visiblePeople, visibleActivities, visibleFamilies } =
    useFilteredData(
      people,
      activities,
      families,
      searchQuery,
      filters,
      advancedFilters,
      useAdvancedFilters,
      viewMode,
    );

  // Get computed views
  const {
    totalPages,
    pagedPeople,
    pagedActivities,
    pagedFamilies,
    cohortGroups,
    quickStats,
  } = useComputedViews(
    people,
    activities,
    families,
    visiblePeople,
    visibleActivities,
    visibleFamilies,
    viewMode,
    currentPage,
  );

  const cohortColors = [
    "#60a5fa",
    "#f472b6",
    "#a78bfa",
    "#34d399",
    "#f59e0b",
    "#38bdf8",
  ];

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
      const next = (person.cohorts || []).filter(
        (label) => label !== deleteCohortTarget,
      );
      updatePerson(person.id, { cohorts: next });
    });
    setDeleteCohortTarget(null);
  };
  const handleLoadQuery = (queryId: string) => {
    const query = savedQueries.find((q) => q.id === queryId);
    if (query) {
      setAdvancedFilters(query.filters);
      setUseAdvancedFilters(true);
    }
  };

  const handleConfirmSaveQuery = (values: Record<string, string>) => {
    if (!values.name?.trim()) return;
    addSavedQuery({
      name: values.name.trim(),
      description: values.description?.trim() ?? "",
      filters: advancedFilters,
      createdAt: new Date().toISOString(),
    });
    modalActions.setSaveQueryModalOpen(false);
  };

  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      exportToCSV(filteredPeople, families, `roommap-export-${timestamp}.csv`);
    } catch (error) {
      console.error("Export failed:", error);
      notifyWarning(
        error instanceof Error ? error.message : "Failed to export CSV",
      );
    }
  };

  const handleEditPerson = (id: string) => {
    modalActions.handleEditPerson(id);
  };

  const handleEditActivity = (id: string) => {
    modalActions.handleEditActivity(id);
  };

  const handleEditFamily = (id: string) => {
    modalActions.handleEditFamily(id);
  };

  // Reset to first page whenever the filtered list or view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, filteredPeople, visibleActivities, visibleFamilies]);

  const cohortIndex = new Map<string, Person[]>();
  people.forEach((person) => {
    (person.cohorts || []).forEach((cohort) => {
      if (!cohortIndex.has(cohort)) cohortIndex.set(cohort, []);
      cohortIndex.get(cohort)!.push(person);
    });
  });
  const sortedCohortIndex = Array.from(cohortIndex.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="app">
      <main className="layout">
        <section className="panel panel--full">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddItem={modalActions.handleAddItem}
            onAddConnection={() => modalActions.handleAddConnection()}
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
              onSaveQuery={() => modalActions.setSaveQueryModalOpen(true)}
              onLoadQuery={handleLoadQuery}
            />
          )}

          {viewMode === "programs" ? (
            <ProgramsPanel />
          ) : viewMode === "analytics" ? (
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
          ) : viewMode === "reflections" ? (
            <div className="panel__section">
              <Reflections />
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
                      <ActivitiesTable
                        activities={pagedActivities}
                        people={people}
                        onSelectActivity={(id) =>
                          setSelected({ type: "activities", id })
                        }
                      />
                    ) : viewMode === "families" ? (
                      <FamiliesTable
                        families={pagedFamilies}
                        people={people}
                        onSelectFamily={(id) =>
                          setSelected({ type: "families", id })
                        }
                      />
                    ) : (
                      <PeopleTable
                        people={
                          viewMode === "cohorts" ? visiblePeople : pagedPeople
                        }
                        activities={activities}
                        families={families}
                        onSelectPerson={(id) =>
                          setSelected({ type: "people", id })
                        }
                        viewMode={viewMode}
                        cohortGroups={
                          viewMode === "cohorts" ? cohortGroups : []
                        }
                        cohortColors={cohortColors}
                      />
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
                        {sortedCohortIndex.length === 0 ? (
                          <p className="hint">No cohorts yet</p>
                        ) : (
                          sortedCohortIndex.map(([cohort, members]) => (
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
                    <Statistics onAddFamily={modalActions.handleAddFamily} />
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
                            modalActions.handleAddConnection(personA, personB)
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
        isOpen={modalState.isModalOpen}
        onClose={modalActions.handleClosePerson}
        editingPersonId={modalState.editingPersonId}
        editingActivityId={modalState.editingActivityId}
        onAddFamily={modalActions.handleAddFamily}
      />

      <FamilyModal
        isOpen={modalState.isFamilyModalOpen}
        onClose={modalActions.handleCloseFamily}
        editingFamilyId={modalState.editingFamilyId}
      />

      <ConnectionModal
        isOpen={modalState.isConnectionModalOpen}
        onClose={modalActions.handleCloseConnection}
        personA={modalState.connectionDraft.personA}
        personB={modalState.connectionDraft.personB}
      />

      <InputModal
        isOpen={renameCohortTarget !== null}
        title="Rename Cohort"
        fields={[
          {
            key: "name",
            label: "New name",
            defaultValue: renameCohortTarget ?? "",
            required: true,
          },
        ]}
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
        isOpen={modalState.showSaveQueryModal}
        title="Save Query"
        fields={[
          {
            key: "name",
            label: "Name",
            placeholder: "e.g., Active JY Youth",
            required: true,
          },
          {
            key: "description",
            label: "Description (optional)",
            placeholder: "What this query finds",
          },
        ]}
        confirmLabel="Save"
        onConfirm={handleConfirmSaveQuery}
        onClose={() => modalActions.setSaveQueryModalOpen(false)}
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
