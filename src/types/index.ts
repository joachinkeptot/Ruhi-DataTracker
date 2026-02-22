// RoomMap Ops - TypeScript Type Definitions
// Based on official RoomMapOps_DataSchema.ts (Single Source of Truth)

// ============================================================================
// ENUMS & TYPES - From Official Schema
// ============================================================================

export type AgeGroup = "child" | "JY" | "youth" | "adult" | "parents" | "elder";

export type EmploymentStatus =
  | "student"
  | "employed"
  | "unemployed"
  | "retired";

export type ParticipationStatus = "active" | "occasional" | "lapsed" | "new";

export type Category = "JY" | "CC" | "Youth" | "Parents";

export type ActivityType = "JY" | "CC" | "Study Circle" | "Devotional";

export type FollowUpStatus = "Yes" | "No" | "Scheduled";

export type VisitPurpose = "Introduction" | "Follow-up" | "Social" | "Teaching";

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

// Position on canvas
export interface Position {
  x: number;
  y: number;
}

// Learning Completion Records
export interface JYTextCompletion {
  bookNumber?: number; // Legacy: 1-7 (deprecated, use bookName)
  bookName: string; // Name of the JY text (e.g., "Breezes of Confirmation")
  dateCompleted: string; // ISO 8601 date
  animator?: string; // Name of animator
  notes?: string;
}

export interface RuhiBookCompletion {
  bookNumber: number; // 1-12
  bookName: string; // e.g., "Reflections on the Life of the Spirit"
  dateCompleted: string; // ISO 8601 date
  tutor?: string; // Name of tutor
  notes?: string;
}

export interface CCGradeCompletion {
  gradeNumber: number; // 1-5
  lessonsCompleted: number; // How many lessons in this grade
  dateCompleted?: string; // When grade was finished (if completed)
  teacher?: string; // Name of teacher
  notes?: string;
}

// Home visit record
export interface HomeVisit {
  date: string; // ISO 8601 date: YYYY-MM-DD
  visitors: string[]; // Array of visitor names
  purpose: VisitPurpose; // Type of visit
  notes: string; // Conversation topics and details
  relationshipsDiscovered?: string; // Connections found during visit
  interestsExpressed?: string; // What the person/family is interested in
  followUp?: string; // Next steps agreed upon
  followUpDate?: string; // ISO 8601 date for next contact
  completed: boolean; // Whether follow-up was completed
}

// Conversation record
export interface Conversation {
  date: string; // ISO 8601 date
  topic: string; // Main subject discussed
  notes: string; // Detailed notes
  nextSteps?: string; // Action items
  followUpDate?: string; // When to reconnect
}

// Person connection/relationship
export interface PersonConnection {
  personId: string; // ID of the connected person
  description?: string; // Optional details
  dateAdded: string; // When connection was recorded
}

// FAMILY ENTITY
export interface Family {
  id: string; // UUID
  familyName: string; // e.g., "Garcia Family"
  primaryArea: string; // Geographic area
  phone?: string; // Optional: (555) 123-4567
  email?: string; // Optional: family@email.com
  notes?: string; // Additional information
  dateAdded: string; // ISO 8601 timestamp
  lastContact?: string; // ISO 8601 timestamp of last interaction
  memberCount?: number; // Auto-calculated from people linking to this family
}

// PERSON ENTITY (Primary entity - enhanced version from schema)
export interface Person {
  // Basic Info
  id: string; // UUID
  name: string; // Full name: "First Last"
  area: string; // Geographic area/neighborhood
  familyId?: string; // Link to Family entity

  // Demographics
  ageGroup: AgeGroup; // child, JY, youth, adult, elder
  isParent?: boolean;
  isElder?: boolean;
  phone?: string;
  email?: string;
  schoolName?: string; // If student
  employmentStatus?: EmploymentStatus;

  // Activity Connections
  connectedActivities: string[]; // Array of Activity IDs

  // Learning Progress
  ruhiLevel: number; // 0-12 (highest book completed)
  jyTexts: JYTextCompletion[]; // Array of completed JY books with dates
  studyCircleBooks: RuhiBookCompletion[]; // Array of Ruhi books with details
  ccGrades: CCGradeCompletion[]; // Array of CC grade progress

  // Engagement Tracking
  homeVisits: HomeVisit[]; // Array of all home visits
  conversations: Conversation[]; // Array of meaningful conversations
  lastContact?: string; // ISO 8601 date of most recent interaction

  // Relationships
  connections: PersonConnection[]; // Array of relationships to other people

  // Cohorts
  cohorts?: string[]; // User-defined cohort labels

  // Metadata
  notes?: string; // General notes
  dateAdded: string; // ISO 8601 timestamp when added to system
  lastModified: string; // ISO 8601 timestamp of last update

  // Canvas Position (for visual layout)
  position?: Position;
}

// ACTIVITY ENTITY
export interface Activity {
  id: string; // UUID
  name: string; // e.g., "Northside JY Group"
  type: ActivityType; // JY, CC, Study Circle, Devotional
  facilitator?: string; // Name of animator/teacher/tutor/leader
  leader?: string; // Alternative name for facilitator (for backward compatibility)
  area?: string; // Where it happens

  // Participation Tracking
  participantIds: string[]; // Array of Person IDs (derived from Person.connectedActivities)
  averageAttendance?: number; // Auto-calculated from attendance logs
  lastSessionDate?: string; // ISO 8601 date of most recent meeting

  // Details
  notes?: string;
  note?: string; // Alternative name for notes (for backward compatibility)
  materials?: string; // What's being studied

  // Reflections log
  reflections?: ActivityReflection[];

  // Metadata
  dateCreated: string; // ISO 8601 timestamp
  lastModified: string;

  // Canvas Position
  position?: Position;
}

export interface ActivityReflection {
  date: string; // ISO 8601 date
  text: string;
}

// Attendance Log (for detailed tracking)
export interface AttendanceRecord {
  id: string; // UUID
  activityId: string; // Which activity
  date: string; // ISO 8601 date
  attendees: string[]; // Array of Person IDs who attended
  newAttendees?: string[]; // First-timers (Person IDs)
  facilitator?: string; // Who led the session
  materialsCovered?: string; // What was studied/discussed
  highlights?: string; // Notes about the session
  totalCount: number; // Number of attendees
}

// ============================================================================
// UI & APPLICATION STATE
// ============================================================================

export type ReflectionType =
  | "meeting"
  | "call"
  | "one-on-one"
  | "team"
  | "other";

export interface Reflection {
  id: string; // UUID
  title: string; // Brief title of the reflection
  type: ReflectionType; // Type of interaction
  date: string; // ISO 8601 date
  attendees?: string[]; // Names of people involved
  personIds?: string[]; // IDs of connected people from the database
  notes: string; // Detailed reflection text
  keyTakeaways?: string; // Main points/learnings
  nextSteps?: string; // Action items
  followUpDate?: string; // When to reconnect
  tags?: string[]; // Custom tags for organization
  dateCreated: string; // ISO 8601 timestamp
  lastModified: string; // ISO 8601 timestamp
}

export type ViewMode =
  | "people"
  | "cohorts"
  | "families"
  | "activities"
  | "homevisits"
  | "analytics"
  | "forms"
  | "programs"
  | "reflections";

// ============================================================================
// PROGRAMS — Children's Festivals, JY Intensives, Study Circles
// ============================================================================

export type ProgramKind = "children-festival" | "jy-intensive" | "study-circle";

export type ProgramStatus = "planned" | "ongoing" | "completed" | "cancelled";

export interface ProgramTeamMember {
  personId?: string; // optional link to a Person in the db
  name: string;
  role?: string; // e.g. "Coordinator", "Tutor", "Animator"
}

export interface ProgramNote {
  id: string;
  date: string; // ISO 8601
  text: string;
}

export interface ProgramEvent {
  id: string;
  kind: ProgramKind;
  title: string;
  date: string; // primary event date (ISO 8601)
  endDate?: string; // optional end date for multi-day events
  location?: string;
  status: ProgramStatus;
  team: ProgramTeamMember[];
  reflections: string; // free-form reflection block
  trackingNotes: ProgramNote[]; // timestamped tracking log
  dateAdded: string; // ISO 8601, used for sort order
}

// Objects of Learning
export type LearningObjectStatus = "active" | "completed";

export interface LearningObject {
  id: string;
  statement: string; // e.g. "We are learning how to raise capacity for..."
  notes?: string;
  status: LearningObjectStatus;
  dateAdded: string; // ISO 8601
}

/**
 * How to display/organize cohorts within the cohorts view
 * - "categories": Group by cohort categories
 * - "groups": Group by family connections/groupings
 * Note: This is different from ViewMode: "families" which shows Family entities
 */
export type CohortViewMode = "categories" | "groups";

// Selected item state
export interface SelectedItem {
  type: "people" | "families" | "activities";
  id: string | null;
}

// Canvas Positions storage
export interface CanvasPositions {
  people: Record<string, Position>;
  activities: Record<string, Position>;
}

// Application state
export interface AppState {
  families: Family[];
  people: Person[];
  activities: Activity[];
  programEvents: ProgramEvent[];
  learningObjects: LearningObject[];
  reflections: Reflection[];
  attendanceRecords?: AttendanceRecord[];

  // UI State
  selected: SelectedItem;
  viewMode: ViewMode;
  cohortViewMode: CohortViewMode;
  showConnections: boolean;

  // Queries
  savedQueries: SavedQuery[];

  // Canvas positions
  canvasPositions?: CanvasPositions;
  groupPositions?: Map<string, Position>;
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
  ageGroups: AgeGroup[];

  // Family filters
  familyIds: string[];

  // Activity filters
  hasConnections: boolean | null; // null = no filter, true = has, false = none
  connectedActivityTypes: ActivityType[];

  // Learning filters
  ruhiMin: number | null;
  ruhiMax: number | null;

  // Engagement filters
  homeVisitDays: number | null; // last X days
  conversationDays: number | null; // last X days

  // Employment filters
  employmentStatuses: EmploymentStatus[];
  inSchool: boolean | null; // null = no filter
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
  programEvents?: ProgramEvent[];
  learningObjects?: LearningObject[];
  reflections?: Reflection[];
  attendanceRecords?: AttendanceRecord[];
  selected: SelectedItem;
  canvasPositions?: CanvasPositions;
  groupPositions: { [key: string]: Position };
  savedQueries: SavedQuery[];
  viewMode?: ViewMode;
  cohortViewMode?: CohortViewMode;
  showConnections?: boolean;
}

// ============================================================================
// FORM SUBMISSION TYPES
// ============================================================================

export type FormType = "person" | "homevisit" | "activity";

export interface FormSubmission {
  id: string;
  formType: FormType;
  submittedBy: string;
  submittedAt: string;
  data: any;
  processed: boolean;
  processedAt?: string;
}

// ============================================================================
// CSV IMPORT TYPES (For import system)
// ============================================================================

export type ImportType = "person" | "family" | "homevisit";

export interface ValidationError {
  rowNumber: number;
  columnName: string;
  value: any;
  severity: "error" | "warning"; // error: blocks import, warning: for review
  message: string;
}

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: ValidationError[];
}

export interface CSVParseResult {
  importType: ImportType;
  rows: ParsedRow[];
  columnMapping: Record<string, number>; // column name to index
  headerRow: string[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

export interface FuzzyMatch {
  id: string;
  name: string;
  similarity: number; // 0-1 score
}

export interface PersonMatch {
  personId: string;
  personName: string;
  area: string;
  similarity: number;
}

export interface ActivityMatch {
  activityId: string;
  activityName: string;
  type: ActivityType;
  similarity: number;
}

export interface FamilyMatch {
  familyId: string;
  familyName: string;
  area: string;
  similarity: number;
}

export interface ColumnMapping {
  csvColumn: string;
  dataField: string;
  required: boolean;
  value?: any; // for manual override
}

export interface ImportMapping {
  importType: ImportType;
  columnMappings: ColumnMapping[];
  personMatches: Map<string, PersonMatch>; // csvRowName -> match
  activityMatches: Map<string, ActivityMatch>;
  familyMatches: Map<string, FamilyMatch>;
  manualMappings: Map<string, string>; // csv value -> system value
}

export interface ImportAction {
  type: "create" | "update";
  entityType: "person" | "activity" | "family";
  entityId?: string;
  data: any;
  beforeData?: any; // for undo
}

export interface ImportSummary {
  successCount: number;
  warningCount: number;
  errorCount: number;
  created: {
    people: number;
    families: number;
    activities: number;
  };
  updated: {
    people: number;
    families: number;
    activities: number;
  };
  errors: Array<{
    rowNumber: number;
    entityName: string;
    reason: string;
  }>;
  actions: ImportAction[];
  timestamp: string;
  backupId: string; // for undo functionality
}

export interface ImportBackup {
  id: string;
  timestamp: string;
  people: Person[];
  activities: Activity[];
  families: Family[];
  actions: ImportAction[];
}

// CSV Row types matching official schema column names
export interface PersonIntakeRow {
  timestamp?: string;
  yourName: string;
  personName: string;
  familyName?: string;
  area: string;
  ageGroup: AgeGroup;
  isParent?: boolean;
  isElder?: boolean;
  phone?: string;
  email?: string;
  schoolName?: string;
  employmentStatus?: EmploymentStatus;
  participationStatus?: ParticipationStatus;
  cohorts?: string[];
  connectedActivities?: string[];
  ruhiLevel?: number;
  ccGrades?: number[];
  notes?: string;
}

export interface FamilyIntakeRow {
  timestamp?: string;
  familyName: string;
  primaryArea?: string;
  phone?: string;
  email?: string;
  notes?: string;
  dateAdded?: string;
  lastContact?: string;
}

export interface HomeVisitRow {
  timestamp?: string;
  visitors: string[];
  familyOrPersonName: string;
  area: string;
  visitDate: string;
  purpose: VisitPurpose;
  conversationTopics: string;
  relationshipsDiscovered?: string;
  interestsExpressed?: string;
  nextSteps?: string;
  followUpDate?: string;
  followUpCompleted?: boolean;
}

// Import result from full import process
export interface ImportResult {
  success: boolean;
  summary: {
    created: {
      people: number;
      families: number;
      activities: number;
    };
    updated: {
      people: number;
      families: number;
      activities: number;
    };
    errors: Array<{
      row: number;
      field?: string;
      message: string;
      suggestion?: string;
    }>;
  };
  totalProcessed: number;
  successRate: number; // 0-100
}

// Re-export analytics types for convenience
export * from "./AnalyticsTypes";
