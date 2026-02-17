import {
  Person,
  Activity,
  Family,
  CSVParseResult,
  ParsedRow,
  ImportAction,
  ImportSummary,
  ImportBackup,
  HomeVisit,
  VisitPurpose,
  CCGradeCompletion,
} from "./types";
import { FuzzyMatcher } from "./fuzzyMatcher";
import { CSVParser } from "./csvParser";
import { generateId } from "./utils";

export class ImportExecutor {
  private backups: Map<string, ImportBackup> = new Map();

  /**
   * Create a backup of current state
   */
  createBackup(
    id: string,
    people: Person[],
    activities: Activity[],
    families: Family[],
    actions: ImportAction[] = [],
  ): ImportBackup {
    const backup: ImportBackup = {
      id,
      timestamp: new Date().toISOString(),
      people: JSON.parse(JSON.stringify(people)),
      activities: JSON.parse(JSON.stringify(activities)),
      families: JSON.parse(JSON.stringify(families)),
      actions,
    };

    this.backups.set(id, backup);
    return backup;
  }

  /**
   * Process family intake row
   */
  private async processFamily(
    row: ParsedRow,
    families: Family[],
  ): Promise<{
    action?: ImportAction;
    error?: { name: string; message: string };
  }> {
    const data = row.data;
    const familyName = data["Family Name"]?.trim();

    if (!familyName) {
      return {
        error: {
          name: "Unknown",
          message: "Missing required family name",
        },
      };
    }

    const existingFamily = FuzzyMatcher.findFamilyExact(familyName, families);
    if (existingFamily) {
      const updates: Partial<Family> = {};
      if (data["Primary Area"]) updates.primaryArea = data["Primary Area"];
      if (data["Phone"]) updates.phone = data["Phone"];
      if (data["Email"]) updates.email = data["Email"];
      if (data["Notes"]) updates.notes = data["Notes"];
      if (data["Date Added"]) updates.dateAdded = data["Date Added"];
      if (data["Last Contact"]) updates.lastContact = data["Last Contact"];

      return {
        action: {
          type: "update",
          entityType: "family",
          entityId: existingFamily.id,
          data: updates,
          beforeData: { ...existingFamily },
        },
      };
    }

    const newFamily: Family = {
      id: generateId(),
      familyName,
      primaryArea: data["Primary Area"] || "",
      phone: data["Phone"] || undefined,
      email: data["Email"] || undefined,
      notes: data["Notes"] || undefined,
      dateAdded: data["Date Added"] || new Date().toISOString(),
      lastContact: data["Last Contact"] || undefined,
    };

    families.push(newFamily);

    return {
      action: {
        type: "create",
        entityType: "family",
        data: newFamily,
      },
    };
  }

  /**
   * Restore from backup
   */
  restoreBackup(backupId: string): ImportBackup | null {
    return this.backups.get(backupId) || null;
  }

  /**
   * Execute import and return results
   */
  async executeImport(
    parseResult: CSVParseResult,
    people: Person[],
    activities: Activity[],
    families: Family[],
  ): Promise<ImportSummary> {
    const backupId = `backup_${Date.now()}`;
    const actions: ImportAction[] = [];
    const errors: Array<{
      rowNumber: number;
      entityName: string;
      reason: string;
    }> = [];

    let createdPeople = 0;
    let createdFamilies = 0;
    let createdActivities = 0;
    let updatedPeople = 0;
    let updatedFamilies = 0;
    let updatedActivities = 0;

    // Create backup first
    this.createBackup(backupId, people, activities, families);

    // Process based on import type
    for (const row of parseResult.rows) {
      // Skip rows with errors
      const hasErrors = row.errors.some((e) => e.severity === "error");
      if (hasErrors) {
        const errorMessages = row.errors.map((e) => e.message).join("; ");
        errors.push({
          rowNumber: row.rowNumber,
          entityName: "Row",
          reason: errorMessages,
        });
        continue;
      }

      try {
        switch (parseResult.importType) {
          case "person":
            const personResult = await this.processPerson(
              row,
              people,
              families,
              activities,
            );
            if (personResult.action) {
              actions.push(personResult.action);
              if (personResult.action.type === "create") {
                createdPeople++;
                if (personResult.createdFamily) {
                  createdFamilies++;
                }
              } else {
                updatedPeople++;
              }
            }
            if (personResult.error) {
              errors.push({
                rowNumber: row.rowNumber,
                entityName: personResult.error.name,
                reason: personResult.error.message,
              });
            }
            break;

          case "family":
            const familyResult = await this.processFamily(row, families);
            if (familyResult.action) {
              actions.push(familyResult.action);
              if (familyResult.action.type === "create") {
                createdFamilies++;
              } else {
                updatedFamilies++;
              }
            }
            if (familyResult.error) {
              errors.push({
                rowNumber: row.rowNumber,
                entityName: familyResult.error.name,
                reason: familyResult.error.message,
              });
            }
            break;

          case "homevisit":
            const homeResult = await this.processHomeVisit(
              row,
              people,
              families,
            );
            if (homeResult.action) {
              actions.push(homeResult.action);
              updatedPeople++;
            }
            if (homeResult.error) {
              errors.push({
                rowNumber: row.rowNumber,
                entityName: homeResult.error.name,
                reason: homeResult.error.message,
              });
            }
            break;
        }
      } catch (error) {
        errors.push({
          rowNumber: row.rowNumber,
          entityName: "Processing",
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary: ImportSummary = {
      successCount: parseResult.validRows,
      warningCount: parseResult.rows.filter((r) =>
        r.errors.some((e) => e.severity === "warning"),
      ).length,
      errorCount: errors.length,
      created: {
        people: createdPeople,
        families: createdFamilies,
        activities: createdActivities,
      },
      updated: {
        people: updatedPeople,
        families: updatedFamilies,
        activities: updatedActivities,
      },
      errors,
      actions,
      timestamp: new Date().toISOString(),
      backupId,
    };

    return summary;
  }

  /**
   * Process person intake row
   */
  private async processPerson(
    row: ParsedRow,
    people: Person[],
    families: Family[],
    activities: Activity[],
  ): Promise<{
    action?: ImportAction;
    createdFamily?: boolean;
    error?: { name: string; message: string };
  }> {
    const data = row.data;

    const personName = data["Person's Full Name"]?.trim();
    const familyName = data["Family Name"]?.trim();
    const area = data["Area/Street"]?.trim();
    const ageGroup = data["Age Group"]?.trim();

    if (!personName || !area || !ageGroup) {
      return {
        error: {
          name: personName || "Unknown",
          message: "Missing required fields",
        },
      };
    }

    // Check for existing person
    const existingPerson = FuzzyMatcher.findPersonExact(
      personName,
      area,
      people,
    );

    if (existingPerson) {
      // Update existing person
      const updates: Partial<Person> = {};

      if (data["Age Group"]) {
        updates.ageGroup = data["Age Group"];
      }
      if (data["Phone"]) {
        updates.phone = data["Phone"];
      }
      if (data["Email"]) {
        updates.email = data["Email"];
      }
      if (data["School Name"]) {
        updates.schoolName = data["School Name"];
      }
      if (data["Employment Status"]) {
        updates.employmentStatus = data["Employment Status"];
      }
      if (data["Is Parent"]) {
        updates.isParent = CSVParser.parseBoolean(data["Is Parent"]);
      }
      if (data["Is Elder"]) {
        updates.isElder = CSVParser.parseBoolean(data["Is Elder"]);
      }
      if (data["Notes"]) {
        updates.notes = data["Notes"];
      }

      if (familyName) {
        let family = FuzzyMatcher.findFamilyExact(familyName, families);
        if (!family) {
          family = {
            id: generateId(),
            familyName,
            primaryArea: area,
            phone: data["Phone"] || undefined,
            email: data["Email"] || undefined,
            notes: data["Notes"] || undefined,
            dateAdded: new Date().toISOString(),
          };
          families.push(family);
        }
        updates.familyId = family.id;
      }

      // Parse cohorts
      if (data["Cohorts"]) {
        const cohortLabels = CSVParser.parsePipeDelimited(data["Cohorts"]);
        updates.cohorts = cohortLabels;
      }

      // Parse connected activities
      if (data["Connected to Activities"]) {
        const actNames = CSVParser.parsePipeDelimited(
          data["Connected to Activities"],
        );
        const actIds = actNames
          .map((name) => FuzzyMatcher.findActivityExact(name, activities))
          .filter((a) => a !== null)
          .map((a) => (a as Activity).id);
        if (actIds.length > 0) {
          updates.connectedActivities = actIds;
        }
      }

      // Parse Ruhi level
      if (data["Ruhi Level"]) {
        const level = CSVParser.parseInteger(data["Ruhi Level"]);
        if (level !== null) {
          updates.ruhiLevel = level;
        }
      }
      if (data["CC Grades"]) {
        const grades = CSVParser.parsePipeDelimited(data["CC Grades"])
          .map((g) => CSVParser.parseInteger(g))
          .filter((g): g is number => g !== null);
        if (grades.length > 0) {
          const existingGrades = existingPerson.ccGrades || [];
          const nextGrades: CCGradeCompletion[] = [...existingGrades];
          grades.forEach((gradeNumber) => {
            if (!nextGrades.some((g) => g.gradeNumber === gradeNumber)) {
              nextGrades.push({
                gradeNumber,
                lessonsCompleted: 0,
                dateCompleted: new Date().toISOString(),
              });
            }
          });
          updates.ccGrades = nextGrades;
        }
      }

      return {
        action: {
          type: "update",
          entityType: "person",
          entityId: existingPerson.id,
          data: updates,
          beforeData: { ...existingPerson },
        },
      };
    }

    // Create new person
    let familyId: string | null = null;
    let createdFamily = false;

    if (familyName) {
      // Check for existing family
      let family = FuzzyMatcher.findFamilyExact(familyName, families);

      if (!family) {
        // Create new family
        family = {
          id: generateId(),
          familyName,
          primaryArea: area,
          phone: data["Phone"] || undefined,
          email: data["Email"] || undefined,
          notes: data["Notes"] || undefined,
          dateAdded: new Date().toISOString(),
        };
        families.push(family);
        createdFamily = true;
      }

      familyId = family.id;
    }

    // Build new person
    const cohorts = CSVParser.parsePipeDelimited(data["Cohorts"] || "");
    const actNames = CSVParser.parsePipeDelimited(
      data["Connected to Activities"],
    );
    const actIds = actNames
      .map((name) => FuzzyMatcher.findActivityExact(name, activities))
      .filter((a) => a !== null)
      .map((a) => (a as Activity).id);

    const ccGrades = CSVParser.parsePipeDelimited(data["CC Grades"] || "")
      .map((g) => CSVParser.parseInteger(g))
      .filter((g): g is number => g !== null)
      .map(
        (gradeNumber): CCGradeCompletion => ({
          gradeNumber,
          lessonsCompleted: 0,
          dateCompleted: new Date().toISOString(),
        }),
      );

    const newPerson: Person = {
      id: generateId(),
      name: personName,
      area,
      notes: data["Notes"] || "",
      cohorts: cohorts.length > 0 ? cohorts : [],
      connectedActivities: actIds,
      jyTexts: [],
      studyCircleBooks: [],
      ccGrades,
      ruhiLevel: CSVParser.parseInteger(data["Ruhi Level"]) || 0,
      familyId: familyId || undefined,
      ageGroup: data["Age Group"] || "child",
      isParent: CSVParser.parseBoolean(data["Is Parent"]),
      isElder: CSVParser.parseBoolean(data["Is Elder"]),
      phone: data["Phone"] || undefined,
      email: data["Email"] || undefined,
      schoolName: data["School Name"] || undefined,
      employmentStatus: data["Employment Status"] || "student",
      homeVisits: [],
      conversations: [],
      connections: [],
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      position: undefined,
    };

    people.push(newPerson);

    return {
      action: {
        type: "create",
        entityType: "person",
        data: newPerson,
      },
      createdFamily,
    };
  }

  /**
   * Process home visit row
   */
  private async processHomeVisit(
    row: ParsedRow,
    people: Person[],
    families: Family[],
  ): Promise<{
    action?: ImportAction;
    error?: { name: string; message: string };
  }> {
    const data = row.data;

    const familyOrPersonName = data["Family/Person Visited"]?.trim();
    const area = data["Area"]?.trim();
    const visitDate = data["Visit Date"]?.trim();
    const conversationTopics = data["Conversation Topics"]?.trim();
    const visitors = CSVParser.parseCommaSeparated(
      data["Your Name(s)"]?.trim(),
    );
    const purpose = (data["Purpose"]?.trim() as VisitPurpose) || "Social";
    const followUpDate = data["Follow-Up Date"]?.trim();
    const followUpCompleted =
      data["Follow-Up Completed"]?.toLowerCase() === "yes";

    if (!familyOrPersonName || !area || !visitDate || !conversationTopics) {
      return {
        error: {
          name: familyOrPersonName || "Unknown",
          message: "Missing required fields",
        },
      };
    }

    const homeVisit: HomeVisit = {
      date: visitDate,
      visitors,
      purpose,
      notes: conversationTopics,
      relationshipsDiscovered: data["Relationships Discovered"],
      interestsExpressed: data["Interests Expressed"],
      followUp: data["Next Steps"],
      followUpDate,
      completed: followUpCompleted,
    };

    // Try to find person first
    let person = people.find(
      (p) =>
        p.name.toLowerCase() === familyOrPersonName.toLowerCase() &&
        p.area.toLowerCase() === area.toLowerCase(),
    );

    if (person) {
      person.homeVisits = [...(person.homeVisits || []), homeVisit];
      return {
        action: {
          type: "update",
          entityType: "person",
          entityId: person.id,
          data: { homeVisits: person.homeVisits },
          beforeData: { ...person },
        },
      };
    }

    // Try to find family
    const family = families.find(
      (f) => f.familyName.toLowerCase() === familyOrPersonName.toLowerCase(),
    );

    if (family) {
      // Find all people in this family and update them
      const familyMembers = people.filter(
        (p) => p.familyId === family.id || p.familyId === family.familyName,
      );
      if (familyMembers.length > 0) {
        for (const member of familyMembers) {
          member.homeVisits = [...(member.homeVisits || []), homeVisit];
        }
        return {
          action: {
            type: "update",
            entityType: "person",
            entityId: familyMembers[0].id,
            data: { homeVisits: familyMembers[0].homeVisits },
            beforeData: { ...familyMembers[0] },
          },
        };
      }
    }

    return {
      error: {
        name: familyOrPersonName,
        message: `Family or person "${familyOrPersonName}" not found in system`,
      },
    };
  }
}
