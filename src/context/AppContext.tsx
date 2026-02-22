import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  AppState,
  Person,
  Activity,
  Family,
  ProgramEvent,
  LearningObject,
  Reflection,
  SelectedItem,
  ViewMode,
  CohortViewMode,
  Position,
  SavedQuery,
} from "../types";
import { generateId, saveToLocalStorage, loadFromLocalStorage } from "../utils";

interface AppContextType extends AppState {
  addProgramEvent: (event: Omit<ProgramEvent, "id">) => void;
  updateProgramEvent: (id: string, event: Partial<ProgramEvent>) => void;
  deleteProgramEvent: (id: string) => void;
  addLearningObject: (obj: Omit<LearningObject, "id">) => void;
  updateLearningObject: (id: string, obj: Partial<LearningObject>) => void;
  deleteLearningObject: (id: string) => void;
  addReflection: (
    reflection: Omit<Reflection, "id" | "dateCreated" | "lastModified">,
  ) => void;
  updateReflection: (id: string, reflection: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;
  addPerson: (person: Omit<Person, "id">) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addActivity: (activity: Omit<Activity, "id">) => string;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addFamily: (family: Omit<Family, "id">) => void;
  updateFamily: (id: string, family: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  addSavedQuery: (query: Omit<SavedQuery, "id">) => void;
  deleteSavedQuery: (id: string) => void;
  setSelected: (selected: SelectedItem) => void;
  setViewMode: (mode: ViewMode) => void;
  setCohortViewMode: (mode: CohortViewMode) => void;
  setShowConnections: (show: boolean) => void;
  updatePersonPosition: (id: string, position: Position) => void;
  updateActivityPosition: (id: string, position: Position) => void;
  importData: (data: {
    people?: Person[];
    activities?: Activity[];
    families?: Family[];
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [programEvents, setProgramEvents] = useState<ProgramEvent[]>([]);
  const [learningObjects, setLearningObjects] = useState<LearningObject[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selected, setSelectedState] = useState<SelectedItem>({
    type: "people",
    id: null,
  });
  const [groupPositions, setGroupPositions] = useState<Map<string, Position>>(
    new Map(),
  );
  const [viewMode, setViewModeState] = useState<ViewMode>("people");
  const [cohortViewMode, setCohortViewModeState] =
    useState<CohortViewMode>("categories");
  const [showConnections, setShowConnectionsState] = useState<boolean>(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load initial data
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setPeople(savedData.people);
      setActivities(savedData.activities);
      setFamilies(savedData.families);
      setProgramEvents(savedData.programEvents || []);
      setLearningObjects(savedData.learningObjects || []);
      setReflections(savedData.reflections || []);
      setSavedQueries(savedData.savedQueries || []);
      setSelectedState(savedData.selected);
      setGroupPositions(new Map(Object.entries(savedData.groupPositions)));
      setViewModeState(savedData.viewMode || "people");
      setCohortViewModeState(savedData.cohortViewMode || "categories");
      setShowConnectionsState(savedData.showConnections ?? false);
    }
    setIsLoaded(true);
  }, []);

  // Save data on changes (only after initial load) — debounced to avoid thrashing
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const state = {
        people,
        activities,
        families,
        programEvents,
        learningObjects,
        reflections,
        savedQueries,
        selected,
        groupPositions: Object.fromEntries(groupPositions),
        viewMode,
        cohortViewMode,
        showConnections,
      };
      saveToLocalStorage(state);
    }, 300);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    isLoaded,
    people,
    activities,
    families,
    programEvents,
    learningObjects,
    reflections,
    savedQueries,
    selected,
    groupPositions,
    viewMode,
    cohortViewMode,
    showConnections,
  ]);

  const addProgramEvent = (event: Omit<ProgramEvent, "id">) => {
    const newEvent: ProgramEvent = { ...event, id: generateId() };
    setProgramEvents((prev) => [...prev, newEvent]);
  };

  const updateProgramEvent = (id: string, updates: Partial<ProgramEvent>) => {
    setProgramEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  };

  const deleteProgramEvent = (id: string) => {
    setProgramEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addLearningObject = (obj: Omit<LearningObject, "id">) => {
    setLearningObjects((prev) => [...prev, { ...obj, id: generateId() }]);
  };

  const updateLearningObject = (
    id: string,
    updates: Partial<LearningObject>,
  ) => {
    setLearningObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    );
  };

  const deleteLearningObject = (id: string) => {
    setLearningObjects((prev) => prev.filter((o) => o.id !== id));
  };

  const addReflection = (
    reflection: Omit<Reflection, "id" | "dateCreated" | "lastModified">,
  ) => {
    const now = new Date().toISOString();
    const newReflection: Reflection = {
      ...reflection,
      id: generateId(),
      dateCreated: now,
      lastModified: now,
    };
    setReflections((prev) => [...prev, newReflection]);
  };

  const updateReflection = (id: string, updates: Partial<Reflection>) => {
    const now = new Date().toISOString();
    setReflections((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...updates, lastModified: now } : r,
      ),
    );
  };

  const deleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  const addPerson = (person: Omit<Person, "id">) => {
    const newPerson: Person = { ...person, id: generateId() };
    setPeople((prev) => [...prev, newPerson]);
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (selected.type === "people" && selected.id === id) {
      setSelectedState({ type: "people", id: null });
    }
  };

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity: Activity = { ...activity, id: generateId() };
    setActivities((prev) => [...prev, newActivity]);
    return newActivity.id;
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (selected.type === "activities" && selected.id === id) {
      setSelectedState({ type: "activities", id: null });
    }
  };

  const addFamily = (family: Omit<Family, "id">) => {
    const newFamily: Family = { ...family, id: generateId() };
    setFamilies((prev) => [...prev, newFamily]);
  };

  const updateFamily = (id: string, updates: Partial<Family>) => {
    setFamilies((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const deleteFamily = (id: string) => {
    // Unlink people from this family
    setPeople((prev) =>
      prev.map((p) => (p.familyId === id ? { ...p, familyId: undefined } : p)),
    );
    setFamilies((prev) => prev.filter((f) => f.id !== id));
  };

  const addSavedQuery = (query: Omit<SavedQuery, "id">) => {
    const newQuery: SavedQuery = {
      ...query,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSavedQueries((prev) => [...prev, newQuery]);
  };

  const deleteSavedQuery = (id: string) => {
    setSavedQueries((prev) => prev.filter((q) => q.id !== id));
  };

  const setSelected = (newSelected: SelectedItem) => {
    setSelectedState(newSelected);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
  };

  const setCohortViewMode = (mode: CohortViewMode) => {
    setCohortViewModeState(mode);
  };

  const setShowConnections = (show: boolean) => {
    setShowConnectionsState(show);
  };

  const updatePersonPosition = (id: string, position: Position) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, position } : p)),
    );
  };

  const updateActivityPosition = (id: string, position: Position) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, position } : a)),
    );
  };

  const importData = (data: {
    people?: Person[];
    activities?: Activity[];
    families?: Family[];
  }) => {
    if (data.people) setPeople(data.people);
    if (data.activities) setActivities(data.activities);
    if (data.families) setFamilies(data.families);
  };

  const value: AppContextType = {
    people,
    activities,
    families,
    programEvents,
    learningObjects,
    reflections,
    savedQueries,
    selected,
    groupPositions,
    viewMode,
    cohortViewMode,
    showConnections,
    addPerson,
    updatePerson,
    deletePerson,
    addActivity,
    updateActivity,
    deleteActivity,
    addFamily,
    updateFamily,
    deleteFamily,
    addProgramEvent,
    updateProgramEvent,
    deleteProgramEvent,
    addLearningObject,
    updateLearningObject,
    deleteLearningObject,
    addReflection,
    updateReflection,
    deleteReflection,
    addSavedQuery,
    deleteSavedQuery,
    setSelected,
    setViewMode,
    setCohortViewMode,
    setShowConnections,
    updatePersonPosition,
    updateActivityPosition,
    importData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
