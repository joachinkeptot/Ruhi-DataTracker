import React, { useRef } from "react";
import { useApp } from "../../context";
import { validateJSONStructure, notifySuccess, notifyError } from "../../utils";

export const Tools: React.FC = () => {
  const { people, activities, families, importData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPeopleToCsv = () => {
    const rows = [
      "name,area,note,connectedActivities,jyTexts,studyCircleBooks,ruhiLevel,familyId,familyName,ageGroup,schoolName,employmentStatus",
    ];

    people.forEach((person) => {
      const activityNames = person.connectedActivities
        .map((id) => activities.find((a) => a.id === id)?.name || id)
        .join("|");
      const jyTexts = (person.jyTexts || [])
        .map((j) =>
          j.bookName
            ? j.bookName
            : typeof j === "string"
              ? j
              : `Book ${j.bookNumber}`,
        )
        .join("|");
      const familyName = person.familyId
        ? families.find((f) => f.id === person.familyId)?.familyName || ""
        : "";
      const studyCircles = (person.studyCircleBooks || [])
        .map((b) => b.bookName || `Book ${b.bookNumber}`)
        .join("|");

      const row = [
        person.name,
        person.area,
        person.notes || "",
        activityNames,
        jyTexts,
        studyCircles,
        person.ruhiLevel,
        person.familyId || "",
        familyName,
        person.ageGroup,
        person.schoolName || "",
        person.employmentStatus,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");

      rows.push(row);
    });

    downloadFile("people.csv", rows.join("\n"), "text/csv");
  };

  const exportFamiliesToCsv = () => {
    const rows = [
      "familyName,primaryArea,phone,email,memberCount,lastContact,notes",
    ];

    families.forEach((family) => {
      const row = [
        family.familyName,
        family.primaryArea || "",
        family.phone || "",
        family.email || "",
        family.memberCount || 0,
        family.lastContact || "",
        family.notes || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");

      rows.push(row);
    });

    downloadFile("families.csv", rows.join("\n"), "text/csv");
  };

  const exportActivitiesToCsv = () => {
    const rows = [
      "name,type,area,facilitator,lastSessionDate,participants,averageAttendance,materials,notes",
    ];

    activities.forEach((activity) => {
      const participantIds = Array.isArray(activity.participantIds)
        ? activity.participantIds
        : [];
      const participantNames = participantIds
        .map((id: string) => people.find((p) => p.id === id)?.name || id)
        .join("|");

      const row = [
        activity.name,
        activity.type,
        activity.area || "",
        activity.facilitator || activity.leader || "",
        activity.lastSessionDate || "",
        participantNames,
        activity.averageAttendance || 0,
        activity.materials || "",
        activity.notes || activity.note || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");

      rows.push(row);
    });

    downloadFile("activities.csv", rows.join("\n"), "text/csv");
  };

  const exportHomeVisitsToCsv = () => {
    const rows = [
      "personName,familyName,area,visitDate,visitors,purpose,notes,followUpDate,completed",
    ];

    people.forEach((person) => {
      const familyName = person.familyId
        ? families.find((f) => f.id === person.familyId)?.familyName || ""
        : "";

      (person.homeVisits || []).forEach((visit) => {
        const visitorsList = Array.isArray(visit.visitors)
          ? visit.visitors.join("|")
          : String(visit.visitors || "");

        const row = [
          person.name,
          familyName,
          person.area,
          visit.date,
          visitorsList,
          visit.purpose || "",
          visit.notes || "",
          visit.followUpDate || "",
          visit.completed ? "Yes" : "No",
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",");

        rows.push(row);
      });
    });

    downloadFile("home_visits.csv", rows.join("\n"), "text/csv");
  };

  const exportConversationsToCsv = () => {
    const rows = [
      "personName,familyName,area,conversationDate,topic,notes,followUpDate",
    ];

    people.forEach((person) => {
      const familyName = person.familyId
        ? families.find((f) => f.id === person.familyId)?.familyName || ""
        : "";

      (person.conversations || []).forEach((conv) => {
        const row = [
          person.name,
          familyName,
          person.area,
          conv.date,
          conv.topic || "",
          conv.notes || "",
          conv.followUpDate || "",
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",");

        rows.push(row);
      });
    });

    downloadFile("conversations.csv", rows.join("\n"), "text/csv");
  };

  const exportAllToJson = () => {
    const data = { people, activities, families };
    downloadFile(
      "roommap_ops.json",
      JSON.stringify(data, null, 2),
      "application/json",
    );
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      if (file.name.endsWith(".json")) {
        try {
          const data = JSON.parse(text);

          // Validate JSON structure
          const validation = validateJSONStructure(data);
          if (!validation.valid) {
            notifyError(
              "Invalid JSON structure",
              validation.error || "Unknown validation error",
            );
            return;
          }

          // Attempt import
          try {
            importData(data);
            notifySuccess("Data imported successfully!", 3000);
          } catch (importError) {
            notifyError(
              "Failed to import data",
              importError instanceof Error ? importError : undefined,
            );
          }
        } catch (parseError) {
          notifyError(
            "Invalid JSON format",
            "The file does not contain valid JSON. Please check the file and try again.",
          );
        }
      } else {
        notifyError(
          "Invalid file type",
          "Please select a .json file to import",
        );
      }
    } catch (readError) {
      notifyError(
        "Failed to read file",
        "Could not read the selected file. Please try again with a different file.",
      );
    } finally {
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="panel__section">
      <h2>Tools</h2>

      <h3
        style={{ marginTop: "1rem", marginBottom: "0.5rem", fontSize: "1rem" }}
      >
        Export CSV Files
      </h3>
      <div
        className="form-row"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <button className="btn" onClick={exportPeopleToCsv}>
          📄 Export People
        </button>
        <button className="btn" onClick={exportFamiliesToCsv}>
          👨‍👩‍👧 Export Families
        </button>
        <button className="btn" onClick={exportActivitiesToCsv}>
          🎯 Export Activities
        </button>
        <button className="btn" onClick={exportHomeVisitsToCsv}>
          🏠 Export Home Visits
        </button>
        <button className="btn" onClick={exportConversationsToCsv}>
          💬 Export Conversations
        </button>
        <button className="btn" onClick={exportAllToJson}>
          📦 Export All (JSON)
        </button>
      </div>

      <h3
        style={{
          marginTop: "1.5rem",
          marginBottom: "0.5rem",
          fontSize: "1rem",
        }}
      >
        Import JSON Backup
      </h3>
      <div className="form-row">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
        />
      </div>
      <p className="hint">
        Import a complete backup JSON file exported from this application.
      </p>
    </div>
  );
};
