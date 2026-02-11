const canvas = document.getElementById("canvas");
const detailPanel = document.getElementById("detailPanel");
const addItemBtn = document.getElementById("addItemBtn");
const itemModal = document.getElementById("itemModal");
const modalCancel = document.getElementById("modalCancel");
const itemForm = document.getElementById("itemForm");
const itemType = document.getElementById("itemType");
const itemName = document.getElementById("itemName");
const itemArea = document.getElementById("itemArea");
const itemNote = document.getElementById("itemNote");
const activityArea = document.getElementById("activityArea");
const activityPeople = document.getElementById("activityPeople");
const peopleFields = document.getElementById("peopleFields");
const activityFields = document.getElementById("activityFields");
const activityType = document.getElementById("activityType");
const animatorField = document.getElementById("animatorField");
const teacherField = document.getElementById("teacherField");
const tutorField = document.getElementById("tutorField");
const leaderField = document.getElementById("leaderField");
const jyFields = document.getElementById("jyFields");
const ccFields = document.getElementById("ccFields");
const studyCircleFields = document.getElementById("studyCircleFields");
const devotionalFields = document.getElementById("devotionalFields");
const exportRoomCsv = document.getElementById("exportRoomCsv");
const exportAllJson = document.getElementById("exportAllJson");
const importFile = document.getElementById("importFile");
const roomStats = document.getElementById("roomStats");
const tabButtons = document.querySelectorAll("[data-tab]");
const searchInput = document.getElementById("searchInput");
const statsBreakdown = document.getElementById("statsBreakdown");
const statsContent = document.getElementById("statsContent");

const STORAGE_KEY = "roommap_ops_single_v2";
const API_BASE = "http://localhost:5000/api";
const USE_BACKEND = true; // Set to false to use localStorage only

const categories = ["JY", "CC", "Youth", "Parents"];

let filteredItems = []; // track filtered results

const state = {
  people: [],
  activities: [],
  selected: { type: "people", id: null },
  groupPositions: new Map(), // track bubble/group center positions
};

let activeTab = "people";
let dragState = null;
let draggedBubble = null; // track which bubble is being dragged
let editingPersonId = null; // track if we're editing a person

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

async function saveState() {
  const dataToSave = {
    people: state.people,
    activities: state.activities,
    selected: state.selected,
    groupPositions: Object.fromEntries(state.groupPositions),
  };

  // Always save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

  // Also save to backend if enabled
  if (USE_BACKEND) {
    try {
      await fetch(`${API_BASE}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
    } catch (error) {
      console.warn("Backend save failed (local storage still active):", error);
    }
  }
}

async function loadState() {
  // Try to load from backend first
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${API_BASE}/data`);
      if (response.ok) {
        const data = await response.json();
        applyLoadedData(data);
        return true;
      }
    } catch (error) {
      console.warn("Backend load failed, trying localStorage:", error);
    }
  }

  // Fall back to localStorage
  const raw =
    localStorage.getItem(STORAGE_KEY) || localStorage.getItem("roommap_ops_v1");
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    applyLoadedData(data);
    return true;
  } catch (error) {
    return false;
  }
}

function applyLoadedData(data) {
  if (!data || typeof data !== "object") return;

  if (Array.isArray(data.people)) {
    state.people = data.people.map((person) => ({
      ...person,
      area: person.area || person.street || person.address || "",
    }));
    state.activities = Array.isArray(data.activities) ? data.activities : [];

    if (data.groupPositions && typeof data.groupPositions === "object") {
      state.groupPositions = new Map(Object.entries(data.groupPositions));
    }
    return;
  }

  if (data.rooms && typeof data.rooms === "object") {
    const rooms = Object.values(data.rooms);
    const activeRoom = rooms.find((room) => room.id === data.activeRoomId);
    const fallbackRoom = activeRoom || rooms[0];
    state.people = (fallbackRoom?.people || []).map((person) => ({
      ...person,
      area: person.area || person.street || person.address || "",
    }));
    state.activities = [];
  }
}

function updateStats() {
  roomStats.textContent = `People: ${state.people.length} | Activities: ${state.activities.length}`;
  updateStatsBreakdown();
}

function updateStatsBreakdown() {
  if (activeTab === "people") {
    const counts = { JY: 0, CC: 0, Youth: 0, Parents: 0 };
    state.people.forEach((person) => {
      (person.categories || ["Unassigned"]).forEach((cat) => {
        if (counts.hasOwnProperty(cat)) counts[cat]++;
      });
    });
    statsContent.innerHTML = `
      <p>JY: ${counts.JY}</p>
      <p>CC: ${counts.CC}</p>
      <p>Youth: ${counts.Youth}</p>
      <p>Parents: ${counts.Parents}</p>
    `;
    statsBreakdown.classList.remove("hidden");
  } else {
    const counts = { JY: 0, CC: 0, StudyCircle: 0, Devotional: 0 };
    state.activities.forEach((activity) => {
      if (counts.hasOwnProperty(activity.type)) counts[activity.type]++;
    });
    statsContent.innerHTML = `
      <p>JY: ${counts.JY}</p>
      <p>CC: ${counts.CC}</p>
      <p>Study Circle: ${counts.StudyCircle}</p>
      <p>Devotional: ${counts.Devotional}</p>
    `;
    statsBreakdown.classList.remove("hidden");
  }
}

function getActiveItems() {
  return activeTab === "people" ? state.people : state.activities;
}

function filterItems() {
  const query = searchInput.value.toLowerCase().trim();
  const items = getActiveItems();

  if (!query) {
    filteredItems = items;
    return items;
  }

  filteredItems = items.filter((item) => {
    const name = item.name.toLowerCase();
    const area = (item.area || "").toLowerCase();
    const categories = (item.categories || []).join(" ").toLowerCase();
    const type = (item.type || "").toLowerCase();
    const leader = (item.leader || "").toLowerCase();

    return (
      name.includes(query) ||
      area.includes(query) ||
      categories.includes(query) ||
      type.includes(query) ||
      leader.includes(query)
    );
  });

  return filteredItems;
}

function ensurePositions() {
  const items = getActiveItems();
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 800;
  const height = rect.height || 520;

  items.forEach((item) => {
    if (!item.position) {
      item.position = {
        x: Math.max(12, Math.random() * (width - 180)),
        y: Math.max(12, Math.random() * (height - 120)),
      };
    }
  });
}

function renderCanvas() {
  canvas.innerHTML = "";
  ensurePositions();

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("links-layer");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  canvas.appendChild(svg);

  const items = filterItems();
  const nodeMap = new Map();
  items.forEach((item) => {
    const node = document.createElement("div");
    node.className = "node";

    // Add color-coding classes
    if (activeTab === "people") {
      const primaryCat =
        (item.categories && item.categories[0]) || "Unassigned";
      const colorClass = `node--${primaryCat.toLowerCase()}`;
      node.classList.add(colorClass);
    } else {
      const colorClass = `node--activity-${(item.type || "").toLowerCase()}`;
      node.classList.add(colorClass);
    }

    if (state.selected.id === item.id && state.selected.type === activeTab) {
      node.classList.add("node--selected");
    }
    node.dataset.id = item.id;
    node.dataset.type = activeTab;
    node.style.left = `${item.position.x}px`;
    node.style.top = `${item.position.y}px`;

    const title = document.createElement("div");
    title.className = "node__title";
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "node__meta";
    if (activeTab === "people") {
      meta.textContent = item.area || "No area";
    } else {
      meta.textContent = item.type ? `${item.type}` : "Activity";
    }

    node.appendChild(title);
    node.appendChild(meta);
    canvas.appendChild(node);
    nodeMap.set(item.id, node);
  });

  drawAreaLinks(svg, items, nodeMap);
}

function drawAreaLinks(svg, items, nodeMap) {
  svg.innerHTML = "";
  const canvasRect = canvas.getBoundingClientRect();

  // Group ONLY the visible filtered items by area
  const areaGroups = new Map();

  items.forEach((item) => {
    // Only group items that are in the nodeMap (i.e., visible in the current view)
    if (!nodeMap.has(item.id)) return;

    const areaKey = (item.area || "").trim().toLowerCase();
    if (!areaKey) return;

    if (!areaGroups.has(areaKey)) {
      areaGroups.set(areaKey, []);
    }
    areaGroups.get(areaKey).push(item);
  });

  // Draw bubbles for each area group with at least 2 visible members
  areaGroups.forEach((group, areaKey) => {
    if (group.length < 2) return; // Only show bubbles when there are 2+ items in the area

    // Calculate bubble bounds from visible nodes
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    group.forEach((item) => {
      minX = Math.min(minX, item.position.x);
      maxX = Math.max(maxX, item.position.x + 160);
      minY = Math.min(minY, item.position.y);
      maxY = Math.max(maxY, item.position.y + 100);
    });

    const padding = 30;
    const bubbleW = maxX - minX + padding * 2;
    const bubbleH = maxY - minY + padding * 2;
    const bubbleR = Math.sqrt(bubbleW * bubbleW + bubbleH * bubbleH) / 2;
    const bubbleCenterX = minX - padding + bubbleW / 2;
    const bubbleCenterY = minY - padding + bubbleH / 2;

    // Draw area circle with semi-transparent fill (BLUE)
    const areaCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    areaCircle.setAttribute("cx", bubbleCenterX);
    areaCircle.setAttribute("cy", bubbleCenterY);
    areaCircle.setAttribute("r", bubbleR);
    areaCircle.classList.add("area-bubble");
    areaCircle.dataset.area = areaKey;
    svg.appendChild(areaCircle);

    // Draw connecting lines between visible group members
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const nodeA = nodeMap.get(group[i].id);
        const nodeB = nodeMap.get(group[j].id);
        if (!nodeA || !nodeB) continue;

        const rectA = nodeA.getBoundingClientRect();
        const rectB = nodeB.getBoundingClientRect();
        const x1 = rectA.left - canvasRect.left + rectA.width / 2;
        const y1 = rectA.top - canvasRect.top + rectA.height / 2;
        const x2 = rectB.left - canvasRect.left + rectB.width / 2;
        const y2 = rectB.top - canvasRect.top + rectB.height / 2;

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.classList.add("area-link");
        svg.appendChild(line);
      }
    }
  });
}

function renderDetails() {
  if (!state.selected.id) {
    detailPanel.textContent = "Select a node to see details.";
    return;
  }

  const list =
    state.selected.type === "people" ? state.people : state.activities;
  const item = list.find((entry) => entry.id === state.selected.id);
  if (!item) {
    detailPanel.textContent = "Select a node to see details.";
    return;
  }

  if (state.selected.type === "people") {
    detailPanel.innerHTML = `
      <h4>${item.name}</h4>
      <p>Area: ${item.area || "-"}</p>
      <p>Categories: ${(item.categories || []).join(", ") || "-"}</p>
      <p>Notes: ${item.note || "-"}</p>
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button id="editPersonBtn" class="btn btn--primary" style="flex: 1;">Edit</button>
        <button id="deletePersonBtn" class="btn" style="flex: 1; background: #ef4444; color: white;">Delete</button>
      </div>
    `;

    // Add edit and delete button listeners
    const editBtn = document.getElementById("editPersonBtn");
    const deleteBtn = document.getElementById("deletePersonBtn");
    if (editBtn) {
      editBtn.addEventListener("click", () => editPerson(item.id));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deletePerson(item.id));
    }
  } else {
    const typeLabel =
      {
        JY: "Animator",
        CC: "Teacher",
        StudyCircle: "Tutor",
        Devotional: "Leader",
      }[item.type] || "Contact";

    detailPanel.innerHTML = `
      <h4>${item.name}</h4>
      <p>Type: ${item.type || "-"}</p>
      <p>${typeLabel}: ${item.leader || "-"}</p>
      <p>Notes: ${item.note || "-"}</p>
      <button id="deleteActivityBtn" class="btn" style="margin-top: 1rem; width: 100%; background: #ef4444; color: white;">Delete</button>
    `;

    const deleteBtn = document.getElementById("deleteActivityBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteActivity(item.id));
    }
  }
}

function setSelected(type, id) {
  state.selected = { type, id };
  renderCanvas();
  renderDetails();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function editPerson(personId) {
  const person = state.people.find((p) => p.id === personId);
  if (!person) return;

  editingPersonId = personId;
  itemModal.classList.remove("hidden");
  itemForm.reset();
  itemType.value = "people";
  itemName.value = person.name;
  itemArea.value = person.area || "";
  itemNote.value = person.note || "";

  // Set categories checkboxes
  peopleFields.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
    checkbox.checked = (person.categories || []).includes(checkbox.value);
  });

  toggleModalFields();
  itemName.focus();
}

function deletePerson(personId) {
  if (!confirm("Are you sure you want to delete this person?")) return;

  state.people = state.people.filter((p) => p.id !== personId);
  state.selected = { type: "people", id: null };
  renderCanvas();
  renderDetails();
  updateStats();
  saveState();
}

function deleteActivity(activityId) {
  if (!confirm("Are you sure you want to delete this activity?")) return;

  state.activities = state.activities.filter((a) => a.id !== activityId);
  state.selected = { type: "activities", id: null };
  renderCanvas();
  renderDetails();
  updateStats();
  saveState();
}

function openModal() {
  editingPersonId = null;
  itemModal.classList.remove("hidden");
  itemForm.reset();
  itemType.value = "people";
  activityType.value = "";
  toggleModalFields();
  itemName.focus();
}

function closeModal() {
  itemModal.classList.add("hidden");
}

function toggleModalFields() {
  const isPeople = itemType.value === "people";
  peopleFields.classList.toggle("hidden", !isPeople);
  activityFields.classList.toggle("hidden", isPeople);

  // Reset activity fields when switching types
  if (isPeople) {
    activityType.value = "";
    jyFields.classList.add("hidden");
    ccFields.classList.add("hidden");
    studyCircleFields.classList.add("hidden");
    devotionalFields.classList.add("hidden");
  }
}

function toggleActivityFields() {
  const type = activityType.value;
  jyFields.classList.toggle("hidden", type !== "JY");
  ccFields.classList.toggle("hidden", type !== "CC");
  studyCircleFields.classList.toggle("hidden", type !== "StudyCircle");
  devotionalFields.classList.toggle("hidden", type !== "Devotional");
}

function handlePointerDown(event) {
  const bubbleElement = event.target.closest(".area-bubble");
  if (bubbleElement) {
    // Bubble drag
    const areaKey = bubbleElement.dataset.area;
    const rect = canvas.getBoundingClientRect();
    const groupPos = state.groupPositions.get(areaKey);
    draggedBubble = {
      areaKey,
      offsetX: event.clientX - rect.left - groupPos.x,
      offsetY: event.clientY - rect.top - groupPos.y,
    };
    bubbleElement.setPointerCapture(event.pointerId);
    return;
  }

  const node = event.target.closest(".node");
  if (!node) return;

  const id = node.dataset.id;
  const type = node.dataset.type;
  const itemList = type === "people" ? state.people : state.activities;
  const item = itemList.find((entry) => entry.id === id);
  if (!item) return;

  const rect = canvas.getBoundingClientRect();
  dragState = {
    id,
    type,
    offsetX: event.clientX - rect.left - item.position.x,
    offsetY: event.clientY - rect.top - item.position.y,
    moved: false,
  };

  node.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  // Handle bubble drag
  if (draggedBubble) {
    const rect = canvas.getBoundingClientRect();
    const groupPos = state.groupPositions.get(draggedBubble.areaKey);
    const newX = event.clientX - rect.left - draggedBubble.offsetX;
    const newY = event.clientY - rect.top - draggedBubble.offsetY;

    // Calculate delta
    const deltaX = newX - groupPos.x;
    const deltaY = newY - groupPos.y;

    // Move all nodes in this area by delta
    const areaKey = draggedBubble.areaKey;
    const items = getActiveItems();
    items.forEach((item) => {
      const itemAreaKey = (item.area || "").trim().toLowerCase();
      if (itemAreaKey === areaKey) {
        item.position.x = item.position.x + deltaX;
        item.position.y = item.position.y + deltaY;
      }
    });

    // Update bubble position
    groupPos.x = newX;
    groupPos.y = newY;
    renderCanvas();
    return;
  }

  if (!dragState) return;
  const itemList =
    dragState.type === "people" ? state.people : state.activities;
  const item = itemList.find((entry) => entry.id === dragState.id);
  if (!item) return;

  const rect = canvas.getBoundingClientRect();
  item.position.x = event.clientX - rect.left - dragState.offsetX;
  item.position.y = event.clientY - rect.top - dragState.offsetY;
  dragState.moved = true;
  renderCanvas();
}

function handlePointerUp(event) {
  if (draggedBubble) {
    draggedBubble = null;
    saveState();
    return;
  }

  if (!dragState) return;
  const node = event.target.closest(".node");
  const { id, type, moved } = dragState;
  dragState = null;

  if (!moved && node) {
    setSelected(type, id);
  } else {
    saveState();
  }
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportPeopleToCsv() {
  const rows = ["name,area,note,categories"];
  state.people.forEach((person) => {
    const categoriesText = (person.categories || []).join("|");
    const row = [
      person.name,
      person.area || "",
      person.note || "",
      categoriesText,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
    rows.push(row);
  });
  downloadFile("people.csv", rows.join("\n"), "text/csv");
}

function exportAllToJson() {
  downloadFile(
    "roommap_ops.json",
    JSON.stringify(state, null, 2),
    "application/json",
  );
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const [header, ...rows] = lines;
  const headers = header
    .split(",")
    .map((cell) => cell.replace(/(^\"|\"$)/g, "").trim());
  return rows.map((line) => {
    const cells = line
      .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
      .map((cell) => cell.replace(/(^\"|\"$)/g, "").replace(/\"\"/g, '"'));
    const entry = {};
    headers.forEach((key, index) => {
      entry[key] = cells[index] || "";
    });
    return entry;
  });
}

function importFromCsv(text) {
  const records = parseCsv(text);
  records.forEach((record) => {
    const categoriesText = record.categories || "";
    const categoriesList = categoriesText
      ? categoriesText
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
      : ["Unassigned"];
    state.people.push({
      id: generateId(),
      name: record.name || "Unknown",
      area: record.area || record.street || record.address || "",
      note: record.note || "",
      categories: categoriesList,
      position: null,
    });
  });
}

function importFromJson(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object") return;
  if (Array.isArray(data.people)) {
    state.people = data.people.map((person) => ({
      ...person,
      area: person.area || person.street || person.address || "",
    }));
    state.activities = Array.isArray(data.activities) ? data.activities : [];
  }
}

addItemBtn.addEventListener("click", openModal);
modalCancel.addEventListener("click", closeModal);
itemType.addEventListener("change", toggleModalFields);
activityType.addEventListener("change", toggleActivityFields);
searchInput.addEventListener("input", () => {
  renderCanvas();
});

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = itemType.value;
  const name = itemName.value.trim();
  const note = itemNote.value.trim();
  if (!name) return;

  if (type === "people") {
    const cats = Array.from(
      peopleFields.querySelectorAll("input[type=checkbox]:checked"),
    ).map((input) => input.value);

    if (editingPersonId) {
      // Edit existing person
      const person = state.people.find((p) => p.id === editingPersonId);
      if (person) {
        person.name = name;
        person.area = itemArea.value.trim();
        person.note = note;
        person.categories = cats.length ? cats : ["Unassigned"];
      }
      editingPersonId = null;
    } else {
      // Create new person
      const person = {
        id: generateId(),
        name,
        area: itemArea.value.trim(),
        note,
        categories: cats.length ? cats : ["Unassigned"],
        position: null,
      };
      state.people.push(person);
      state.selected = { type: "people", id: person.id };
    }
  } else {
    const actType = activityType.value;
    if (!actType) {
      alert("Please select an activity type");
      return;
    }

    let leader = null;
    if (actType === "JY") leader = animatorField.value.trim();
    else if (actType === "CC") leader = teacherField.value.trim();
    else if (actType === "StudyCircle") leader = tutorField.value.trim();
    else if (actType === "Devotional") leader = leaderField.value.trim();

    const activity = {
      id: generateId(),
      name,
      type: actType,
      leader,
      note,
      position: null,
    };
    state.activities.push(activity);
    state.selected = { type: "activities", id: activity.id };
  }

  closeModal();
  renderCanvas();
  renderDetails();
  updateStats();
  saveState();
});

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);

exportRoomCsv.addEventListener("click", () => {
  exportPeopleToCsv();
});

exportAllJson.addEventListener("click", exportAllToJson);

importFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  if (file.name.endsWith(".json")) {
    importFromJson(text);
  } else if (file.name.endsWith(".csv")) {
    importFromCsv(text);
  }
  importFile.value = "";
  renderCanvas();
  renderDetails();
  updateStats();
  saveState();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.tab;
    activeTab = target;
    tabButtons.forEach((tab) => tab.classList.remove("tab--active"));
    button.classList.add("tab--active");
    renderCanvas();
    renderDetails();
  });
});

// Auto-sync with backend every 3 seconds
let syncInterval = null;

async function startAutoSync() {
  if (!USE_BACKEND || syncInterval) return;

  syncInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE}/data`);
      if (response.ok) {
        const remoteData = await response.json();
        // Check if remote data is newer and merge
        const localState = {
          people: state.people,
          activities: state.activities,
          selected: state.selected,
          groupPositions: Object.fromEntries(state.groupPositions),
        };

        // Simple merge: prefer remote if it has more items or later timestamp
        if (
          remoteData.people.length > localState.people.length ||
          remoteData.activities.length > localState.activities.length
        ) {
          applyLoadedData(remoteData);
          renderCanvas();
          renderDetails();
          updateStats();
        }
      }
    } catch (error) {
      // Silently fail, backend might not be running
    }
  }, 3000);

  console.log("✅ Auto-sync started (every 3s)");
}

if (!loadState()) {
  state.people = [];
  state.activities = [];
}

updateStats();
renderCanvas();
renderDetails();
startAutoSync();
