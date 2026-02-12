// RoomMap Ops - Data Type Definitions

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
export interface Connection {
  personId: string;
  connectionType: ConnectionType;
  strength: number; // 1-10 scale
}

// Enhanced People entity
export interface Person {
  id: string;
  name: string;
  area?: string;
  note?: string;
  categories: Category[];
  position: { x: number; y: number } | null;

  // Existing fields
  connectedActivities: string[]; // array of Activity ids
  jyTextsCompleted: string[]; // e.g., ["Book 1", "Book 2"]
  studyCircleBooks?: string;
  ruhiLevel: number; // 0-12

  // New enhanced fields
  familyId?: string; // links to Families
  ageGroup: AgeGroup;
  schoolName?: string;
  employmentStatus: EmploymentStatus;
  participationStatus: ParticipationStatus;
  homeVisits: HomeVisit[];
  conversations: Conversation[];
  connections: Connection[];
}

// Activities entity
export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  leader?: string; // animator, teacher, tutor, or devotional leader
  note?: string;
  position: { x: number; y: number } | null;
}

// Application state
export interface AppState {
  people: Person[];
  activities: Activity[];
  families: Family[];
  selected: {
    type: "people" | "activities";
    id: string | null;
  };
  groupPositions: Map<string, { x: number; y: number }>;
  viewMode: "areas" | "cohorts" | "activities";
  cohortViewMode: "categories" | "families";
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
