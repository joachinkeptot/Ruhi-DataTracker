import React, { useMemo } from "react";
import { Person } from "./types";

interface NetworkStatsProps {
  people: Person[];
  showConnections: boolean;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  people,
  showConnections,
}) => {
  const stats = useMemo(() => {
    const totalConnections =
      people.reduce((sum, p) => sum + p.connections.length, 0) / 2;

    const connectionCounts = people.map((p) => ({
      name: p.name,
      count: p.connections.length,
    }));

    const topConnected = connectionCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const isolated = people.filter((p) => p.connections.length === 0).length;
    const avgConnections =
      people.length > 0
        ? (
            people.reduce((sum, p) => sum + p.connections.length, 0) /
            people.length
          ).toFixed(1)
        : "0";

    return {
      totalConnections,
      topConnected,
      isolated,
      avgConnections,
    };
  }, [people]);

  if (!showConnections) return null;

  return (
    <div
      style={{
        background: "rgba(18, 26, 47, 0.6)",
        border: "1px solid #1d2a44",
        borderRadius: "8px",
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <h4 style={{ marginBottom: "1rem", color: "#4cc9f0" }}>
        📊 Network Stats
      </h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(76, 201, 240, 0.1)",
            padding: "0.75rem",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#8aa3c2",
              marginBottom: "0.25rem",
            }}
          >
            Total Connections
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#4cc9f0",
            }}
          >
            {stats.totalConnections}
          </div>
        </div>

        <div
          style={{
            background: "rgba(76, 201, 240, 0.1)",
            padding: "0.75rem",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#8aa3c2",
              marginBottom: "0.25rem",
            }}
          >
            Avg Per Person
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#4cc9f0",
            }}
          >
            {stats.avgConnections}
          </div>
        </div>

        <div
          style={{
            background: "rgba(76, 201, 240, 0.1)",
            padding: "0.75rem",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#8aa3c2",
              marginBottom: "0.25rem",
            }}
          >
            Isolated People
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#ef4444",
            }}
          >
            {stats.isolated}
          </div>
        </div>
      </div>

      {stats.topConnected.length > 0 && (
        <div>
          <h5
            style={{
              fontSize: "0.9rem",
              color: "#fbbf24",
              marginBottom: "0.5rem",
            }}
          >
            Top 5 Most Connected
          </h5>
          <div style={{ fontSize: "0.85rem", color: "#e6eef8" }}>
            {stats.topConnected.map((person, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.35rem 0",
                  borderBottom:
                    idx < stats.topConnected.length - 1
                      ? "1px solid #1d2a44"
                      : "none",
                }}
              >
                <span>
                  {idx + 1}. {person.name.substring(0, 20)}
                  {person.name.length > 20 ? "..." : ""}
                </span>
                <span style={{ color: "#4cc9f0", fontWeight: "bold" }}>
                  {person.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
