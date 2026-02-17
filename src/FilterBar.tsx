import React, { useState } from "react";
import { FilterState } from "./types";
import { useApp } from "./AppContext";
import { getAreaList } from "./utils";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
}) => {
  const { people, families, viewMode } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const areas = getAreaList(people);
  const familyAreas = Array.from(
    new Set(
      families
        .map((family) => family.primaryArea)
        .filter((area) => area && area.trim()),
    ),
  ).sort();

  const handleChange = (
    field: keyof FilterState,
    value: string | number | null,
  ) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearAll = () => {
    onFilterChange({
      area: "",
      category: "",
      activityType: "",
      ruhiMin: null,
      ruhiMax: null,
      jyText: "",
    });
  };

  return (
    <div className="panel__section filter-section">
      <button
        className="btn btn--sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "⏷" : "⏶"} Filters
      </button>
      {!isCollapsed && (
        <div className="filter-bar">
          <div className="filter-row">
            {viewMode !== "activities" && viewMode !== "families" && (
              <>
                <div className="filter-group">
                  <label className="muted">Area</label>
                  <select
                    value={filters.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                  >
                    <option value="">All</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="muted">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="child">Child</option>
                    <option value="JY">JY</option>
                    <option value="youth">Youth</option>
                    <option value="adult">Adult</option>
                    <option value="parents">Parents</option>
                    <option value="elder">Elder</option>
                  </select>
                </div>
              </>
            )}

            {viewMode === "families" && (
              <div className="filter-group">
                <label className="muted">Area</label>
                <select
                  value={filters.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                >
                  <option value="">All</option>
                  {familyAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === "activities" && (
              <div className="filter-group">
                <label className="muted">Activity Type</label>
                <select
                  value={filters.activityType}
                  onChange={(e) => handleChange("activityType", e.target.value)}
                >
                  <option value="">All</option>
                  <option value="JY">JY</option>
                  <option value="CC">CC</option>
                  <option value="StudyCircle">Study Circle</option>
                  <option value="Devotional">Devotional</option>
                </select>
              </div>
            )}
          </div>
          <button className="btn btn--sm" onClick={clearAll}>
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
