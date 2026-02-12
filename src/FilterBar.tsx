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
  const { people, viewMode } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const areas = getAreaList(people);

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
            {viewMode !== "activities" && (
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
                    <option value="JY">JY</option>
                    <option value="CC">CC</option>
                    <option value="Youth">Youth</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="muted">Ruhi Level</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max="12"
                      placeholder="Min"
                      className="filter-input"
                      value={filters.ruhiMin ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "ruhiMin",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                    />
                    <span className="muted">–</span>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      placeholder="Max"
                      className="filter-input"
                      value={filters.ruhiMax ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "ruhiMax",
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="muted">JY Text</label>
                  <select
                    value={filters.jyText}
                    onChange={(e) => handleChange("jyText", e.target.value)}
                  >
                    <option value="">All</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={`Book ${num}`}>
                        Book {num}
                      </option>
                    ))}
                  </select>
                </div>
              </>
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
