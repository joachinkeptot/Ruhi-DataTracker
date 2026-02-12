// RoomMap Ops - TypeScript Type Definitions

// Connection types enum
export type ConnectionType =
  | "family"
  | "school"
  | "work"
  | "neighborhood"
  | "activity"
  | "friendship";

// Age groups
export type AgeGroup = "child" | "JY" | "youth" | "adult" | "elder";

// Employment statuses
export type EmploymentStatus =
  | "student"
  | "employed"
  | "unemployed"
  | "retired";

// Participation statuses
export type ParticipationStatus = "active" | "occasional" | "lapsed" | "new";

// Category types
export type Category = "JY" | "CC" | "Youth" | "Parents";

// Activity types
export type ActivityType = "JY" | "CC" | "StudyCircle" | "Devotional";

// View modes
export type ViewMode = "areas" | "cohorts" | "activities";

// Cohort view modes
export type CohortViewMode = "categories" | "families";

// Position on canvas
export interface Position {
  x: number;
  y: number;
}

// Families entity
export interface Family {
  id: string;
  familyName: string;
  primaryArea: string;
  phone: string;
  email: string;
  notes?: string;
}

// Home visit record
export interface HomeVisit {
  date: string;
  visitors: string[];
  notes?: string;
  followUp?: string;
}

// Conversation record
export interface Conversation {
  date: string;
  topic: string;
  notes?: string;
  nextSteps?: string;
}

// Connection between people
export interface PersonConnection {
  personId: string;
  connectionType: ConnectionType;
  strength: number; // 1-10 scale
}

// Enhanced People entity
export interface Person {
  id: string;
  name: string;
  area: string;
  note: string;
  categories: Category[];
  position: Position | null;

  // Activity connections
  connectedActivities: string[]; // array of Activity ids
  jyTextsCompleted: string[]; // e.g., ["Book 1", "Book 2"]
  studyCircleBooks: string;
  ruhiLevel: number; // 0-12

  // Enhanced fields
  familyId: string | null; // links to Families
  ageGroup: AgeGroup;
  schoolName: string | null;
  employmentStatus: EmploymentStatus;
  participationStatus: ParticipationStatus;
  homeVisits: HomeVisit[];
  conversations: Conversation[];
  connections: PersonConnection[];
}

// Activities entity
export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  leader: string; // animator, teacher, tutor, or devotional leader
  note: string;
  position: Position | null;
}

// Selected item state
export interface SelectedItem {
  type: "people" | "activities";
  id: string | null;
}

// Application state
export interface AppState {
  people: Person[];
  activities: Activity[];
  families: Family[];
  savedQueries: SavedQuery[];
  selected: SelectedItem;
  groupPositions: Map<string, Position>;
  viewMode: ViewMode;
  cohortViewMode: CohortViewMode;
  showConnections: boolean;
}

// Filter state
export interface FilterState {
  area: string;
  category: string;
  activityType: string;
  ruhiMin: number | null;
  ruhiMax: number | null;
  jyText: string;
}

// Advanced filter state
export interface AdvancedFilterState {
  // Basic filters
  areas: string[];
  categories: Category[];
  ageGroups: AgeGroup[];

  // Family filters
  familyIds: string[];

  // Activity filters
  hasConnections: boolean | null; // null = no filter, true = has, false = none
  connectedActivityTypes: ActivityType[];

  // Learning filters
  ruhiMin: number | null;
  ruhiMax: number | null;
  jyTexts: string[]; // e.g., ["Book 1", "Book 2"]

  // Engagement filters
  homeVisitDays: number | null; // last X days
  conversationDays: number | null; // last X days

  // Employment filters
  employmentStatuses: EmploymentStatus[];
  inSchool: boolean | null; // null = no filter

  // Participation filters
  participationStatuses: ParticipationStatus[];
}

// Saved query
export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  filters: AdvancedFilterState;
  createdAt: string;
}

// Serializable state for storage
export interface SerializableState {
  people: Person[];
  activities: Activity[];
  families: Family[];
  selected: SelectedItem;
  groupPositions: Record<string, Position>;
  savedQueries: SavedQuery[];
}
