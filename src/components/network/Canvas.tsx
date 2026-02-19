import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../../context";
import { Person, Activity, Position } from "../../types";

interface CanvasProps {
  filteredItems: (Person | Activity)[];
  highlightedIds?: Set<string>;
}

export const Canvas: React.FC<CanvasProps> = ({
  filteredItems,
  highlightedIds,
}) => {
  const {
    selected,
    setSelected,
    updatePersonPosition,
    updateActivityPosition,
    people,
    activities,
  } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    id: string;
    type: "people" | "activities";
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Ensure all items have positions
  useEffect(() => {
    filteredItems.forEach((item) => {
      if (!item.position) {
        const newPosition: Position = {
          x: Math.max(12, Math.random() * 700),
          y: Math.max(12, Math.random() * 400),
        };
        if ("ageGroup" in item) {
          updatePersonPosition(item.id, newPosition);
        } else {
          updateActivityPosition(item.id, newPosition);
        }
      }
    });
  }, [filteredItems, updatePersonPosition, updateActivityPosition]);

  const handlePointerDown = (
    e: React.PointerEvent,
    item: Person | Activity,
  ) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const type = "ageGroup" in item ? "people" : "activities";

    setDragState({
      id: item.id,
      type,
      offsetX: e.clientX - rect.left - (item.position?.x || 0),
      offsetY: e.clientY - rect.top - (item.position?.y || 0),
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newPosition: Position = {
      x: e.clientX - rect.left - dragState.offsetX,
      y: e.clientY - rect.top - dragState.offsetY,
    };

    if (dragState.type === "people") {
      updatePersonPosition(dragState.id, newPosition);
    } else {
      updateActivityPosition(dragState.id, newPosition);
    }
  };

  const handlePointerUp = (_e: React.PointerEvent, item: Person | Activity) => {
    if (!dragState) {
      // Click without drag - select item
      const type = "ageGroup" in item ? "people" : "activities";
      setSelected({ type, id: item.id });
    }
    setDragState(null);
  };

  const getNodeColor = (item: Person | Activity): string => {
    if ("ageGroup" in item) {
      return `node--${item.ageGroup}`;
    } else {
      return `node--activity-${item.type.toLowerCase()}`;
    }
  };

  const isSelected = (item: Person | Activity): boolean => {
    const type = "ageGroup" in item ? "people" : "activities";
    return selected.type === type && selected.id === item.id;
  };

  const getHighlightClass = (item: Person | Activity): string => {
    if (!highlightedIds || highlightedIds.size === 0) return "";
    return highlightedIds.has(item.id) ? "highlighted" : "dimmed";
  };

  // Show all items (not just filtered) if highlighting is active
  const itemsToShow =
    highlightedIds && highlightedIds.size > 0
      ? [...people, ...activities]
      : filteredItems;

  return (
    <div className="canvas-wrapper">
      <div className="canvas" ref={canvasRef}>
        <svg className="links-layer" width="100%" height="100%">
          {/* Links could be drawn here */}
        </svg>
        {itemsToShow.map((item) => (
          <div
            key={item.id}
            className={`node ${getNodeColor(item)} ${isSelected(item) ? "node--selected" : ""} ${getHighlightClass(item)}`}
            style={{
              left: `${item.position?.x || 0}px`,
              top: `${item.position?.y || 0}px`,
            }}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(e, item)}
          >
            <div className="node__title">{item.name}</div>
            <div className="node__meta">
              {"ageGroup" in item
                ? item.area || "No area"
                : item.type || "Activity"}
            </div>
          </div>
        ))}
      </div>
      <p className="hint">
        Drag nodes to move. Click to view details. Scroll to explore the
        infinite canvas.
      </p>
    </div>
  );
};
