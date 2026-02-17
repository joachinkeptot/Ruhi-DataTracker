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
const searchInput = document.getElementById("searchInput");
const statsBreakdown = document.getElementById("statsBreakdown");
const statsContent = document.getElementById("statsContent");
const viewTabs = document.querySelectorAll("[data-view]");

const STORAGE_KEY = "roommap_ops_single_v2";
const API_BASE = "http://localhost:5001/api";
const USE_BACKEND = false; // Set to false to use localStorage only

const categories = ["JY", "CC", "Youth", "Parents"];

// Connection types enum
const CONNECTION_TYPES = [
  "family",
  "school",
  "work",
  "neighborhood",
  "activity",
  "friendship",
];
const AGE_GROUPS = ["child", "JY", "youth", "adult", "elder"];
const EMPLOYMENT_STATUSES = ["student", "employed", "unemployed", "retired"];
const PARTICIPATION_STATUSES = ["active", "occasional", "lapsed", "new"];

let filteredItems = []; // track filtered results

// Filter state
const filterState = {
  area: "",
  category: "",
  activityType: "",
  ruhiMin: null,
  ruhiMax: null,
  jyText: "",
};

function populateFilterAreaDropdown() {
  const filterArea = document.getElementById("filterArea");
  if (!filterArea) return;
  const currentVal = filterArea.value;
  const areas = getAreaList();
  filterArea.innerHTML = '<option value="">All</option>';
  areas.forEach((area) => {
    const opt = document.createElement("option");
    opt.value = area;
    opt.textContent = area;
    filterArea.appendChild(opt);
  });
  filterArea.value = currentVal;
}

function readFilterState() {
  const filterArea = document.getElementById("filterArea");
  const filterCategory = document.getElementById("filterCategory");
  const filterActivityType = document.getElementById("filterActivityType");
  const filterRuhiMin = document.getElementById("filterRuhiMin");
  const filterRuhiMax = document.getElementById("filterRuhiMax");
  const filterJYText = document.getElementById("filterJYText");

  filterState.area = filterArea ? filterArea.value : "";
  filterState.category = filterCategory ? filterCategory.value : "";
  filterState.activityType = filterActivityType ? filterActivityType.value : "";
  filterState.ruhiMin =
    filterRuhiMin && filterRuhiMin.value !== ""
      ? parseInt(filterRuhiMin.value)
      : null;
  filterState.ruhiMax =
    filterRuhiMax && filterRuhiMax.value !== ""
      ? parseInt(filterRuhiMax.value)
      : null;
  filterState.jyText = filterJYText ? filterJYText.value : "";
}

function clearAllFilters() {
  const ids = [
    "filterArea",
    "filterCategory",
    "filterActivityType",
    "filterJYText",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const nums = ["filterRuhiMin", "filterRuhiMax"];
  nums.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  filterState.area = "";
  filterState.category = "";
  filterState.activityType = "";
  filterState.ruhiMin = null;
  filterState.ruhiMax = null;
  filterState.jyText = "";
  renderCanvas();
  updateStats();
}

function applyFiltersToList(items, forceType) {
  const type =
    forceType || (state.viewMode === "activities" ? "activities" : "people");

  return items.filter((item) => {
    if (type === "people") {
      // Area filter
      if (filterState.area && (item.area || "").trim() !== filterState.area)
        return false;
      // Category filter
      if (
        filterState.category &&
        !(item.categories || []).includes(filterState.category)
      )
        return false;
      // Ruhi level filter
      const level = item.ruhiLevel || 0;
      if (filterState.ruhiMin !== null && level < filterState.ruhiMin)
        return false;
      if (filterState.ruhiMax !== null && level > filterState.ruhiMax)
        return false;
      // JY text filter
      if (
        filterState.jyText &&
        !(item.jyTextsCompleted || []).includes(filterState.jyText)
      )
        return false;
    } else {
      // Activity type filter
      if (filterState.activityType && item.type !== filterState.activityType)
        return false;
    }
    return true;
  });
}

const state = {
  people: [],
  activities: [],
  families: [], // NEW: families entity
  selected: { type: "people", id: null },
  groupPositions: new Map(), // track bubble/group center positions
  viewMode: "areas", // current view: 'areas', 'cohorts', or 'activities'
  cohortViewMode: "categories", // 'categories' or 'families' - for Cohorts tab
};

let dragState = null;
let draggedBubble = null; // track which bubble is being dragged
let editingPersonId = null; // track if we're editing a person

function switchView(view) {
  state.viewMode = view;

  // Update tab styling
  document.querySelectorAll("[data-view]").forEach((tab) => {
    tab.classList.toggle("tab--active", tab.dataset.view === view);
  });

  // Show/hide cohort view toggle button
  const cohortViewToggle = document.getElementById("cohortViewToggle");
  if (cohortViewToggle) {
    cohortViewToggle.style.display =
      view === "cohorts" ? "inline-block" : "none";
    cohortViewToggle.textContent = `View: ${state.cohortViewMode === "categories" ? "Categories" : "Families"}`;
  }

  // Show/hide relevant filter fields based on view
  const peopleFilters = [
    "filterArea",
    "filterCategory",
    "filterRuhiMin",
    "filterRuhiMax",
    "filterJYText",
  ];
  const activityFilters = ["filterActivityType"];

  peopleFilters.forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.closest(".filter-group").style.display =
        view === "activities" ? "none" : "";
  });
  activityFilters.forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.closest(".filter-group").style.display =
        view === "activities" ? "" : "none";
  });

  populateFilterAreaDropdown();
  renderCanvas();
  updateStats();
}

function getAreaList() {
  const areas = new Set();
  state.people.forEach((person) => {
    if (person.area && person.area.trim()) {
      areas.add(person.area.trim());
    }
  });
  return Array.from(areas).sort();
}

function updateAreaTabs() {
  // Keep this function for backwards compatibility but make it do nothing
  // since we now have fixed tabs
}

function switchArea(area) {
  // Deprecated: keeping for backwards compatibility
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

async function saveState() {
  const dataToSave = {
    people: state.people,
    activities: state.activities,
    families: state.families, // NEW: persist families
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
    state.families = Array.isArray(data.families) ? data.families : [];

    if (data.groupPositions && typeof data.groupPositions === "object") {
      state.groupPositions = new Map(Object.entries(data.groupPositions));
    }
  }
}

function updateStats() {
  roomStats.textContent = `People: ${state.people.length} | Families: ${state.families.length} | Activities: ${state.activities.length}`;
  updateStatsBreakdown();
}

function updateStatsBreakdown() {
  if (state.viewMode === "areas") {
    // Show people stats by area
    const areas = getAreaList();
    const areaStats = {};
    areas.forEach((area) => {
      areaStats[area] = state.people.filter((p) => p.area === area).length;
    });

    statsContent.innerHTML = `
      <h5>People by Area</h5>
      ${areas.map((area) => `<p>${area}: ${areaStats[area]}</p>`).join("")}
      ${areas.length === 0 ? "<p>No areas defined</p>" : ""}
    `;
    statsBreakdown.classList.remove("hidden");
  } else if (state.viewMode === "cohorts") {
    // Show people stats by categories and Ruhi levels OR by families
    if (state.cohortViewMode === "families") {
      // Family view
      const familyCounts = {};
      const noFamily = state.people.filter((p) => !p.familyId).length;

      state.families.forEach((family) => {
        const count = state.people.filter(
          (p) => p.familyId === family.id,
        ).length;
        familyCounts[family.familyName] = count;
      });

      const sortedFamilies = Object.keys(familyCounts).sort();

      statsContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h5 style="margin: 0;">Families</h5>
          <button id="addFamilyBtn" class="btn btn--sm btn--primary">+ Family</button>
        </div>
        ${sortedFamilies.map((name) => `<p>${name}: ${familyCounts[name]} members</p>`).join("")}
        ${noFamily > 0 ? `<p><em>No Family: ${noFamily}</em></p>` : ""}
        ${state.families.length === 0 ? "<p>No families defined</p>" : ""}
      `;

      // Add listener for add family button
      const addFamilyBtn = document.getElementById("addFamilyBtn");
      if (addFamilyBtn) {
        addFamilyBtn.addEventListener("click", openFamilyModal);
      }
    } else {
      // Category view (original)
      const counts = { JY: 0, CC: 0, Youth: 0, Parents: 0 };
      const ruhiCounts = {};

      state.people.forEach((person) => {
        (person.categories || ["Unassigned"]).forEach((cat) => {
          if (counts.hasOwnProperty(cat)) counts[cat]++;
        });

        const level = person.ruhiLevel || 0;
        ruhiCounts[level] = (ruhiCounts[level] || 0) + 1;
      });

      const sortedRuhiLevels = Object.keys(ruhiCounts).sort(
        (a, b) => parseInt(b) - parseInt(a),
      );

      statsContent.innerHTML = `
        <h5>Cohorts</h5>
        <p>JY: ${counts.JY}</p>
        <p>CC: ${counts.CC}</p>
        <p>Youth: ${counts.Youth}</p>
        <p>Parents: ${counts.Parents}</p>
        <h5 style="margin-top: 1rem;">Ruhi Levels</h5>
        ${sortedRuhiLevels.map((level) => `<p>Level ${level}: ${ruhiCounts[level]}</p>`).join("")}
      `;
    }
    statsBreakdown.classList.remove("hidden");
  } else if (state.viewMode === "activities") {
    // Show activity stats
    const counts = { JY: 0, CC: 0, StudyCircle: 0, Devotional: 0 };
    const participationCount = new Map();

    state.activities.forEach((activity) => {
      if (counts.hasOwnProperty(activity.type)) counts[activity.type]++;

      // Count how many people are connected to each activity
      const connectedPeople = state.people.filter((p) =>
        (p.connectedActivities || []).includes(activity.id),
      ).length;
      participationCount.set(activity.id, connectedPeople);
    });

    const totalParticipation = Array.from(participationCount.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const avgParticipation =
      state.activities.length > 0
        ? (totalParticipation / state.activities.length).toFixed(1)
        : 0;

    statsContent.innerHTML = `
      <h5>Activity Types</h5>
      <p>JY: ${counts.JY}</p>
      <p>CC: ${counts.CC}</p>
      <p>Study Circle: ${counts.StudyCircle}</p>
      <p>Devotional: ${counts.Devotional}</p>
      <h5 style="margin-top: 1rem;">Participation</h5>
      <p>Total Connections: ${totalParticipation}</p>
      <p>Avg per Activity: ${avgParticipation}</p>
    `;
    statsBreakdown.classList.remove("hidden");
  } else {
    statsBreakdown.classList.add("hidden");
  }
}

function getActiveItems() {
  if (state.viewMode === "activities") {
    return state.activities;
  }
  return state.people;
}

function filterItems() {
  const query = searchInput.value.toLowerCase().trim();
  let items = getActiveItems();

  // Apply text search first
  if (query) {
    items = items.filter((item) => {
      const name = item.name.toLowerCase();
      const area = (item.area || "").toLowerCase();
      const categoriesStr = (item.categories || []).join(" ").toLowerCase();
      const type = (item.type || "").toLowerCase();
      const leader = (item.leader || "").toLowerCase();
      const studyBooks = (item.studyCircleBooks || "").toLowerCase();
      const jyTexts = (item.jyTextsCompleted || []).join(" ").toLowerCase();

      return (
        name.includes(query) ||
        area.includes(query) ||
        categoriesStr.includes(query) ||
        type.includes(query) ||
        leader.includes(query) ||
        studyBooks.includes(query) ||
        jyTexts.includes(query)
      );
    });
  }

  // Apply structured filters
  readFilterState();
  items = applyFiltersToList(items);

  filteredItems = items;
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

  // filterItems() already selects the right source list based on viewMode
  const displayItems = filterItems();

  const nodeMap = new Map();
  displayItems.forEach((item) => {
    const node = document.createElement("div");
    node.className = "node";

    // Add color-coding classes
    const isPerson = state.viewMode === "areas" || state.viewMode === "cohorts";
    if (isPerson) {
      const primaryCat =
        (item.categories && item.categories[0]) || "Unassigned";
      const colorClass = `node--${primaryCat.toLowerCase()}`;
      node.classList.add(colorClass);
    } else {
      const colorClass = `node--activity-${(item.type || "").toLowerCase()}`;
      node.classList.add(colorClass);
    }

    if (
      state.selected.id === item.id &&
      ((isPerson && state.selected.type === "people") ||
        (!isPerson && state.selected.type === "activities"))
    ) {
      node.classList.add("node--selected");
    }

    node.dataset.id = item.id;
    node.dataset.type = isPerson ? "people" : "activities";
    node.style.left = `${item.position.x}px`;
    node.style.top = `${item.position.y}px`;

    const title = document.createElement("div");
    title.className = "node__title";
    title.textContent = item.name;

    const meta = document.createElement("div");
    meta.className = "node__meta";
    if (state.viewMode === "activities") {
      meta.textContent = item.type ? `${item.type}` : "Activity";
    } else {
      meta.textContent = item.area || "No area";
    }

    node.appendChild(title);
    node.appendChild(meta);
    canvas.appendChild(node);
    nodeMap.set(item.id, node);
  });

  // Area links and bubbles disabled for now
  // drawAreaLinks(svg, displayItems, nodeMap);
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
    // Get activity names from IDs
    const activityNames =
      (item.connectedActivities || [])
        .map((actId) => {
          const activity = state.activities.find((a) => a.id === actId);
          return activity ? activity.name : null;
        })
        .filter((name) => name)
        .join(", ") || "-";

    // Get family name
    const familyName = item.familyId
      ? state.families.find((f) => f.id === item.familyId)?.familyName ||
        "Unknown Family"
      : "-";

    // Get connections count
    const connectionsCount = (item.connections || []).length;
    const homeVisitsCount = (item.homeVisits || []).length;
    const conversationsCount = (item.conversations || []).length;

    detailPanel.innerHTML = `
      <h4>${item.name}</h4>
      <p><strong>Family:</strong> ${familyName}</p>
      <p><strong>Area:</strong> ${item.area || "-"}</p>
      <p><strong>Age Group:</strong> ${item.ageGroup || "-"}</p>
      <p><strong>Categories:</strong> ${(item.categories || []).join(", ") || "-"}</p>
      <p><strong>Employment:</strong> ${item.employmentStatus || "-"}</p>
      ${item.schoolName ? `<p><strong>School:</strong> ${item.schoolName}</p>` : ""}
      <p><strong>Participation:</strong> ${item.participationStatus || "-"}</p>
      <p><strong>Connected Activities:</strong> ${activityNames}</p>
      <p><strong>Connections:</strong> ${connectionsCount} person(s)</p>
      <p><strong>Home Visits:</strong> ${homeVisitsCount}</p>
      <p><strong>Conversations:</strong> ${conversationsCount}</p>
      <p><strong>JY Texts:</strong> ${(item.jyTextsCompleted || []).join(", ") || "-"}</p>
      <p><strong>Study Circles:</strong> ${item.studyCircleBooks || "-"}</p>
      <p><strong>Ruhi Level:</strong> ${item.ruhiLevel || "0"}</p>
      <p><strong>Notes:</strong> ${item.note || "-"}</p>
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

  // Populate connected activities dropdown
  const connectedActivitiesSelect = document.getElementById(
    "connectedActivities",
  );
  connectedActivitiesSelect.innerHTML = "";
  state.activities.forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity.id;
    option.textContent = `${activity.name} (${activity.type})`;
    option.selected = (person.connectedActivities || []).includes(activity.id);
    connectedActivitiesSelect.appendChild(option);
  });

  // Set categories checkboxes (excluding JY text checkboxes)
  peopleFields
    .querySelectorAll("input[type=checkbox]:not(.jy-text-cb)")
    .forEach((checkbox) => {
      checkbox.checked = (person.categories || []).includes(checkbox.value);
    });

  // Set JY texts checkboxes
  peopleFields.querySelectorAll(".jy-text-cb").forEach((checkbox) => {
    checkbox.checked = (person.jyTextsCompleted || []).includes(checkbox.value);
  });

  // Set other new fields
  document.getElementById("studyCircleBooks").value =
    person.studyCircleBooks || "";
  document.getElementById("ruhiLevel").value = person.ruhiLevel || "";

  // Set family dropdown
  const familySelect = document.getElementById("familySelect");
  if (familySelect) familySelect.value = person.familyId || "";

  // Set new enhanced fields
  const ageGroupSelect = document.getElementById("ageGroup");
  if (ageGroupSelect) ageGroupSelect.value = person.ageGroup || "adult";

  const schoolNameInput = document.getElementById("schoolName");
  if (schoolNameInput) schoolNameInput.value = person.schoolName || "";

  const employmentSelect = document.getElementById("employmentStatus");
  if (employmentSelect)
    employmentSelect.value = person.employmentStatus || "employed";

  const participationSelect = document.getElementById("participationStatus");
  if (participationSelect)
    participationSelect.value = person.participationStatus || "active";

  toggleModalFields();
  itemName.focus();
}

function deletePerson(personId) {
  if (!confirm("Are you sure you want to delete this person?")) return;

  state.people = state.people.filter((p) => p.id !== personId);
  state.selected = { type: "people", id: null };
  updateAreaTabs();
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

// Family management functions
function openFamilyModal() {
  const familyName = prompt("Enter family name:");
  if (!familyName || !familyName.trim()) return;

  const primaryArea = prompt("Enter primary area (optional):") || "";
  const phone = prompt("Enter phone (optional):") || "";
  const email = prompt("Enter email (optional):") || "";
  const notes = prompt("Enter notes (optional):") || "";

  const family = {
    id: generateId(),
    familyName: familyName.trim(),
    primaryArea: primaryArea.trim(),
    phone: phone.trim(),
    email: email.trim(),
    notes: notes.trim(),
  };

  state.families.push(family);
  updateStats();
  saveState();
  alert(`Family "${family.familyName}" added successfully!`);
}

function deleteFamily(familyId) {
  if (
    !confirm(
      "Are you sure you want to delete this family? People will be unlinked.",
    )
  )
    return;

  // Unlink people from this family
  state.people.forEach((person) => {
    if (person.familyId === familyId) {
      person.familyId = null;
    }
  });

  state.families = state.families.filter((f) => f.id !== familyId);
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

  // Populate connected activities dropdown
  const connectedActivitiesSelect = document.getElementById(
    "connectedActivities",
  );
  connectedActivitiesSelect.innerHTML = "";
  state.activities.forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity.id;
    option.textContent = `${activity.name} (${activity.type})`;
    connectedActivitiesSelect.appendChild(option);
  });

  // Populate family dropdown
  const familySelect = document.getElementById("familySelect");
  if (familySelect) {
    familySelect.innerHTML = '<option value="">No Family</option>';
    state.families.forEach((family) => {
      const option = document.createElement("option");
      option.value = family.id;
      option.textContent = family.familyName;
      familySelect.appendChild(option);
    });
  }

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
  const rows = [
    "name,area,note,categories,connectedActivities,jyTexts,studyCircleBooks,ruhiLevel,familyId,familyName,ageGroup,schoolName,employmentStatus,participationStatus",
  ];
  state.people.forEach((person) => {
    const categoriesText = (person.categories || []).join("|");
    // Map activity IDs to names for readable export
    const activityNames = (person.connectedActivities || [])
      .map((id) => {
        const act = state.activities.find((a) => a.id === id);
        return act ? act.name : id;
      })
      .join("|");
    const jyTexts = (person.jyTextsCompleted || []).join("|");
    const familyName = person.familyId
      ? state.families.find((f) => f.id === person.familyId)?.familyName || ""
      : "";
    const row = [
      person.name,
      person.area || "",
      person.note || "",
      categoriesText,
      activityNames,
      jyTexts,
      person.studyCircleBooks || "",
      person.ruhiLevel || 0,
      person.familyId || "",
      familyName,
      person.ageGroup || "",
      person.schoolName || "",
      person.employmentStatus || "",
      person.participationStatus || "",
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

    // Parse new fields
    const jyTextsText = record.jyTexts || "";
    const jyTextsList = jyTextsText
      ? jyTextsText
          .split("|")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Try to match activity names back to IDs
    const actNamesText = record.connectedActivities || "";
    const connectedActivities = actNamesText
      ? actNamesText
          .split("|")
          .map((name) => {
            const match = state.activities.find(
              (a) => a.name.toLowerCase() === name.trim().toLowerCase(),
            );
            return match ? match.id : null;
          })
          .filter(Boolean)
      : [];

    state.people.push({
      id: generateId(),
      name: record.name || "Unknown",
      area: record.area || record.street || record.address || "",
      note: record.note || "",
      categories: categoriesList,
      position: null,
      connectedActivities: connectedActivities,
      jyTextsCompleted: jyTextsList,
      studyCircleBooks: record.studyCircleBooks || "",
      ruhiLevel: parseInt(record.ruhiLevel) || 0,
      familyId: record.familyId || null,
      ageGroup: record.ageGroup || "adult",
      schoolName: record.schoolName || null,
      employmentStatus: record.employmentStatus || "employed",
      participationStatus: record.participationStatus || "active",
      homeVisits: [],
      conversations: [],
      connections: [],
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
      // Ensure new fields have default values
      familyId: person.familyId || null,
      ageGroup: person.ageGroup || "adult",
      schoolName: person.schoolName || null,
      employmentStatus: person.employmentStatus || "employed",
      participationStatus: person.participationStatus || "active",
      homeVisits: person.homeVisits || [],
      conversations: person.conversations || [],
      connections: person.connections || [],
    }));
    state.activities = Array.isArray(data.activities) ? data.activities : [];
    state.families = Array.isArray(data.families) ? data.families : [];
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
      peopleFields.querySelectorAll(
        "input[type=checkbox]:checked:not(.jy-text-cb)",
      ),
    ).map((input) => input.value);

    // Get new fields
    const connectedActivitiesSelect = document.getElementById(
      "connectedActivities",
    );
    const connectedActivities = Array.from(
      connectedActivitiesSelect.selectedOptions,
    ).map((opt) => opt.value);

    const jyTextsCompleted = Array.from(
      peopleFields.querySelectorAll(".jy-text-cb:checked"),
    ).map((input) => input.value);

    const studyCircleBooks = document
      .getElementById("studyCircleBooks")
      .value.trim();
    const ruhiLevel = parseInt(document.getElementById("ruhiLevel").value) || 0;

    // Get new enhanced fields
    const familyId = document.getElementById("familySelect")?.value || null;
    const ageGroup = document.getElementById("ageGroup")?.value || "adult";
    const schoolName =
      document.getElementById("schoolName")?.value.trim() || null;
    const employmentStatus =
      document.getElementById("employmentStatus")?.value || "employed";
    const participationStatus =
      document.getElementById("participationStatus")?.value || "active";

    if (editingPersonId) {
      // Edit existing person
      const person = state.people.find((p) => p.id === editingPersonId);
      if (person) {
        person.name = name;
        person.area = itemArea.value.trim();
        person.note = note;
        person.categories = cats.length ? cats : ["Unassigned"];
        person.connectedActivities = connectedActivities;
        person.jyTextsCompleted = jyTextsCompleted;
        person.studyCircleBooks = studyCircleBooks;
        person.ruhiLevel = ruhiLevel;
        person.familyId = familyId;
        person.ageGroup = ageGroup;
        person.schoolName = schoolName;
        person.employmentStatus = employmentStatus;
        person.participationStatus = participationStatus;
        // Preserve existing homeVisits, conversations, connections if not editing them
        person.homeVisits = person.homeVisits || [];
        person.conversations = person.conversations || [];
        person.connections = person.connections || [];
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
        connectedActivities: connectedActivities,
        jyTextsCompleted: jyTextsCompleted,
        studyCircleBooks: studyCircleBooks,
        ruhiLevel: ruhiLevel,
        familyId: familyId,
        ageGroup: ageGroup,
        schoolName: schoolName,
        employmentStatus: employmentStatus,
        participationStatus: participationStatus,
        homeVisits: [],
        conversations: [],
        connections: [],
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
  updateAreaTabs();
  populateFilterAreaDropdown();
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
  updateAreaTabs();
  populateFilterAreaDropdown();
  renderCanvas();
  renderDetails();
  updateStats();
  saveState();
});

// Setup view tab click handlers
document.querySelectorAll("[data-view]").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchView(tab.dataset.view);
  });
});

// Filter toggle
const filterToggle = document.getElementById("filterToggle");
const filterBar = document.getElementById("filterBar");
if (filterToggle && filterBar) {
  filterToggle.addEventListener("click", () => {
    filterBar.classList.toggle("hidden");
    filterToggle.textContent = filterBar.classList.contains("hidden")
      ? "⏷ Filters"
      : "⏶ Filters";
  });
}

// Filter change listeners
[
  "filterArea",
  "filterCategory",
  "filterActivityType",
  "filterRuhiMin",
  "filterRuhiMax",
  "filterJYText",
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", () => {
      renderCanvas();
      updateStats();
    });
    if (el.type === "number") {
      el.addEventListener("input", () => {
        renderCanvas();
        updateStats();
      });
    }
  }
});

// Clear filters button
const clearFiltersBtn = document.getElementById("clearFilters");
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", clearAllFilters);
}

// Cohort view toggle button
const cohortViewToggle = document.getElementById("cohortViewToggle");
if (cohortViewToggle) {
  cohortViewToggle.addEventListener("click", () => {
    state.cohortViewMode =
      state.cohortViewMode === "categories" ? "families" : "categories";
    cohortViewToggle.textContent = `View: ${state.cohortViewMode === "categories" ? "Categories" : "Families"}`;
    updateStats();
  });
}

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
          updateAreaTabs();
          renderCanvas();
          renderDetails();
          updateStats();
        }
      }
    } catch (error) {
      // Silently fail, backend might not be running
    }
  }, 3000);

  // Auto-sync started
}

if (!loadState()) {
  state.people = [];
  state.activities = [];
  state.families = [];
}

populateFilterAreaDropdown();
// Initialize filter visibility for default view (areas)
const actTypeFilterInit = document.getElementById("filterActivityType");
if (actTypeFilterInit && actTypeFilterInit.closest(".filter-group")) {
  actTypeFilterInit.closest(".filter-group").style.display = "none";
}
updateStats();
updateAreaTabs();
renderCanvas();
renderDetails();
startAutoSync();
