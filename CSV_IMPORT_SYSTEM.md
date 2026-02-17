# CSV Import System for RoomMap Ops

## Overview

The CSV Import System is a comprehensive 6-step wizard that allows bulk importing of data into RoomMap Ops from CSV files. It supports four import types with full validation, fuzzy matching, and rollback capability.

## Features

✅ **6-Step Wizard Interface**

- Step 1: Select import type
- Step 2: Upload CSV file with drag-and-drop
- Step 3: Preview & validate data
- Step 4: Column mapping & matching
- Step 5: Execute import with progress tracking
- Step 6: Review results and undo if needed

✅ **Four Import Types**

1. **People Intake** - Import people records
2. **Family Intake** - Import family records
3. **Activity Attendance** - Log activity sessions and attendees
4. **Home Visits & Conversations** - Record visits and interactions

✅ **Advanced Validation**

- Real-time CSV parsing with papa parse
- Column header validation
- Data type checking (enums, dates, numbers)
- Required field validation
- Error and warning highlighting
- Preview first 10 rows before import

✅ **Intelligent Matching**

- Fuzzy matching for person names using Levenshtein distance
- Fuzzy matching for activities and families
- "Similar matches" suggestions for manual review
- Similarity scoring (0-100%)
- Batch matching for multiple names

✅ **Comprehensive Error Handling**

- Row-by-row validation with specific error messages
- Three severity levels: errors (block import), warnings (for review)
- Failed row report with downloadable CSV
- Line number references for easy correction
- Processing stops on critical errors, continues on warnings

✅ **Import Execution**

- Progress tracking
- Live count of processed rows
- Detailed summary of created/updated/failed entities
- Backup before import for undo functionality
- Transaction-like behavior

✅ **Undo Capability**

- Full rollback to pre-import state
- Backup ID tracking
- Restore state from backup

## Installation

The system requires `papaparse` for CSV parsing:

```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

## Usage

### Opening the Import Modal

Click the **📥 Import** button in the header to open the CSV Import Wizard.

### Step 1: Select Import Type

Choose from:

- **👥 People Intake** - Import people
- **🏡 Family Intake** - Import families
- **📅 Activity Attendance** - Log activity sessions
- **🏠 Home Visits & Conversations** - Record visits and interactions

### Step 2: Upload CSV File

Options:

- **Drag and drop** a CSV file onto the dropzone
- **Click to browse** and select a file from your computer

The system will automatically parse the CSV and detect the import type based on headers.

### Step 3: Preview & Validate

- View summary statistics (total rows, valid rows, error count)
- Preview the first 10 rows in table format
- Review validation issues with specific error messages
- Row numbers are provided for easy correction

Fix errors in your CSV and re-upload if needed.

### Step 4: Mapping & Matching

Column mappings are handled automatically. The system maps your CSV columns to RoomMap fields using:

- Exact column name matching
- Fuzzy matching for similar names
- Validation against expected format

No manual configuration needed for standard formats.

### Step 5: Execute Import

- Review the ready-to-import state
- Click "Next" to start the import process
- Monitor progress and live row counts
- View detailed summary:
  - **Created**: New people, families, activities
  - **Updated**: Modified entities
  - **Errors**: Failed rows with reasons
  - **Error Report**: Download CSV of failed rows

### Step 6: Review & Undo

- Review import metadata (timestamp, success rate)
- Option to **Undo Import** if needed
  - Completely rolls back all changes
  - Restores pre-import state

## CSV Format Specifications

Templates are available in `csv-templates/` for quick copy/paste into Google Sheets.

### People Intake

**Filename**: `PeopleIntake_YYYY-MM-DD.csv`

**Required Columns**:

- Person's Full Name (e.g., "Maria Garcia")
- Area/Street (geographic area)
- Age Group (child|JY|youth|adult|elder)

**Optional Columns**:

- Family Name
- Is Parent (Yes/No)
- Is Elder (Yes/No)
- Phone, Email, School Name
- Employment Status (student|employed|unemployed|retired)
- Participation Status (active|occasional|lapsed|new)
- Cohorts (pipe-delimited)
- Connected to Activities (pipe-delimited activity names)
- Ruhi Level (0-12)
- CC Grades (pipe-delimited 1-5)
- Notes

**Import Logic**:

1. Matches existing person by: Name + Area (case-insensitive)
2. Creates new Family entity if family name doesn't exist
3. Links person to family when provided
4. Parses pipe-delimited fields into arrays
5. Matches activities by name (fuzzy match)

**Example CSV**:

```
Person's Full Name,Family Name,Area/Street,Age Group,Is Parent,Is Elder,Phone,Email,School Name,Employment Status,Participation Status,Cohorts,Connected to Activities,Ruhi Level,CC Grades,Notes
Maria Garcia,Garcia Family,Northside,JY,No,No,(555) 123-4567,maria@email.com,Lincoln High,student,active,Northside|Teens,Northside JY Group|Study Circle 1,2,1|2,Notes here
```

### Family Intake

**Filename**: `FamilyIntake_YYYY-MM-DD.csv`

**Required Columns**:

- Family Name

**Optional Columns**:

- Primary Area
- Phone, Email
- Notes
- Date Added (YYYY-MM-DD)
- Last Contact (YYYY-MM-DD)

### Activity Attendance

**Filename**: `ActivityAttendance_YYYY-MM-DD.csv`

**Required Columns**:

- Activity Name (creates activity if not exists)
- Activity Type (JY|CC|Study Circle|Devotional)
- Date (YYYY-MM-DD)
- Attendee Names (comma-separated list)

**Optional Columns**:

- Timestamp, Facilitator Name, New Attendees, Highlights/Notes, Materials Covered
- Total Attendance (auto-calculated from attendees)

**Import Logic**:

1. Matches or creates Activity by name
2. Parses attendee names (comma or newline separated)
3. Fuzzy matches each attendee to existing Person
4. Flags unknown people for review
5. Creates activity connections
6. Updates participation counts

**Example CSV**:

```
Activity Name,Activity Type,Date,Attendee Names,Highlights/Notes
Northside JY Group,JY,2026-02-05,"Maria Garcia, Ali Hassan, Emma Wilson",Great energy today!
```

### Home Visits & Conversations

**Filename**: `HomeVisits_YYYY-MM-DD.csv`

**Required Columns**:

- Family/Person Visited (family or person name)
- Area (geographic area)
- Visit Date (YYYY-MM-DD)
- Purpose (Introduction|Follow-up|Social|Teaching)
- Conversation Topics (what was discussed)

**Optional Columns**:

- Your Name(s) (comma-separated list of visitors)
- Timestamp, Relationships Discovered, Interests Expressed, Next Steps, Follow-Up Date, Follow-Up Completed

**Import Logic**:

1. Tries to match Family first, then Person
2. Adds entry to homeVisits array:
   ```
   {
     date: visitDate,
     visitors: [...yourNames],
     notes: conversationTopics,
     followUp: nextSteps,
     followUpDate: followUpDate,
     completed: followUpCompleted
   }
   ```
3. Updates participationStatus if new contact

**Example CSV**:

```
Your Name(s),Family/Person Visited,Area,Visit Date,Purpose,Conversation Topics,Next Steps,Follow-Up Date
"John Smith, Sarah Johnson",Garcia Family,Northside,2026-02-01,Introduction,Education and community building,Invite to devotional,2026-02-15
```

## Date Formats

Accepted formats (in order of preference):

- `2026-02-11` (ISO 8601 - **recommended**)
- `02/11/2026` (MM/DD/YYYY)
- `2/11/26` (M/D/YY)
- `February 11, 2026`

## Validation Rules

### Data Types

| Type          | Valid Values                              | Example    |
| ------------- | ----------------------------------------- | ---------- | --- | --- |
| Age Group     | child, JY, youth, adult, elder            | JY         |
| Employment    | student, employed, unemployed, retired    | student    |
| Participation | active, occasional, lapsed, new           | active     |
| Activity Type | JY, CC, Study Circle, Devotional          | JY         |
| Purpose       | Introduction, Follow-up, Social, Teaching | Follow-up  |
| Boolean       | Yes, No, TRUE, FALSE, 1, 0                | Yes        |
| CC Grades     | 1-5 (pipe-delimited)                      | 1          | 3   | 5   |
| Number        | Positive integers                         | 42         |
| Date          | ISO 8601 or common formats                | 2026-02-11 |

### Error Messages

Common validation errors:

| Error                        | Fix                                               |
| ---------------------------- | ------------------------------------------------- |
| Missing required column "X"  | Add the column to your CSV header                 |
| Required field "X" is empty  | Fill in the value or remove the row               |
| Invalid age group "xyz"      | Use: child, JY, youth, adult, elder               |
| Invalid date format          | Use YYYY-MM-DD format                             |
| Person "John" not found      | Check spelling; system will suggest similar names |
| Invalid email "test@invalid" | Enter a valid email or leave empty                |

## Error Report

When import completes with errors, you can:

1. Review failed rows in the summary
2. Download error report as CSV for easy reference
3. Make corrections in your spreadsheet
4. Re-import the corrected rows

**Error Report Format**:

```
Row Number,Entity Name,Reason
15,John Smith,Person "John Smth" not found (similar: John Smith)
23,Maria Garcia,Invalid date format in Home Visit Date
```

## Fuzzy Matching

The system uses Levenshtein distance algorithm for intelligent matching:

- Similarity scoring: 0 (no match) to 1 (perfect match)
- Default threshold: 0.6 (60% similarity)
- Common tokens boost score by +0.2
- Returns top 3 matches for manual review if below threshold

**Examples**:

- "Maria" → "Maria Garcia" (high similarity)
- "J. Smith" → "John Smith" (token match)
- "Mike Johnson" → "Mike Jonson" (typo tolerance)

## Limitations & Notes

1. **Batch Size**: System handles unlimited rows, but performance best for < 10,000 rows
2. **Case Sensitivity**: Enums (age group, participation, activity type) are case-sensitive
3. **Uniqueness**: Names are matched (not IDs) - ensure name consistency
4. **Connections**: Unresolved activity names are silently skipped
5. **Backup Size**: Backups stored in memory - large datasets may use significant RAM
6. **No Partial Commits**: All or nothing - either all valid rows import, or none

## Troubleshooting

### "CSV parsing failed"

- Ensure file is valid CSV format
- Check for special characters or encoding issues
- Use UTF-8 encoding for best results

### "No valid rows to import"

- All rows have validation errors
- Review error messages and fix CSV data
- Ensure all required columns are present

### Import seems to hang

- Large files (10,000+ rows) take longer
- Check browser console for errors
- Try with smaller batch first

### Undo not working

- Backup may have expired (stored in session memory)
- Refresh page clears backup
- For large datasets, keep copy of original data

## Architecture

### File Structure

```
src/
├── ImportModal.tsx        # 6-step wizard UI component
├── csvParser.ts          # CSV parsing and validation
├── fuzzyMatcher.ts       # Fuzzy name matching algorithm
├── importExecutor.ts     # Import logic and backup management
├── types.ts              # TypeScript types (ImportType, ValidationError, etc.)
└── styles.css            # Import modal styling
```

### Key Classes

**CSVParser**

- `parseCSV()` - Parse CSV content
- `structureCSV()` - Parse and validate CSV
- `validateRow()` - Validate individual row
- `parsePipeDelimited()` - Parse "a|b|c" format
- `parseCommaSeparated()` - Parse "a, b, c" format

**FuzzyMatcher**

- `findSimilarPeople()` - Find similar person names
- `findSimilarFamilies()` - Find similar family names
- `findSimilarActivities()` - Find similar activity names
- `findPersonExact()` - Find exact person match
- `calculateSimilarity()` - Get similarity score

**ImportExecutor**

- `executeImport()` - Run the full import process
- `createBackup()` - Create state backup
- `restoreBackup()` - Restore from backup
- `processPerson()` - Process person intake row
- `processFamily()` - Process family intake row
- `processActivity()` - Process activity attendance row
- `processHomeVisit()` - Process home visit row

### Type Definitions

```typescript
type ImportType = "person" | "family" | "activity" | "homevisit";

interface CSVParseResult {
  importType: ImportType;
  rows: ParsedRow[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

interface ImportSummary {
  successCount: number;
  errorCount: number;
  created: { people: number; families: number; activities: number };
  updated: { people: number; families: number; activities: number };
  errors: Array<{ rowNumber: number; entityName: string; reason: string }>;
  backupId: string;
}
```

## Future Enhancements

Potential improvements:

- Batch preview before import (current: 10 rows)
- Custom column mapping UI (currently auto)
- Progress bar for large imports
- Scheduled/delayed imports
- Import history and audit log
- Custom field mapping
- Duplicate detection
- Data transformation rules
- API-based imports
- Streaming large files

## Support & Examples

For detailed CSV format examples, see the specification file included with this project or check the example CSVs in the docs folder.

Need help? Review the error messages in Step 3 (Preview & Validate) - they provide specific guidance for fixing issues.
