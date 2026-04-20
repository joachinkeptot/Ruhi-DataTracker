import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Person, Activity } from "../../types";
import { MetricsCard } from "./MetricsCard";

interface GrowthOverTimeProps {
  people: Person[];
  activities: Activity[];
}

interface MonthData {
  label: string;
  newPeople: number;
  newActivities: number;
}

function getLast6Months(people: Person[], activities: Activity[]): MonthData[] {
  const now = new Date();
  const result: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();
    const newPeople = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return added.getFullYear() === year && added.getMonth() === month;
    }).length;
    const newActivities = activities.filter((a) => {
      const created = new Date(a.dateCreated);
      return created.getFullYear() === year && created.getMonth() === month;
    }).length;
    result.push({ label, newPeople, newActivities });
  }
  return result;
}

export const GrowthOverTime = memo(
  ({ people, activities }: GrowthOverTimeProps) => {
    const data = getLast6Months(people, activities);

    const now = new Date();
    const thisMonth = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return (
        added.getFullYear() === now.getFullYear() &&
        added.getMonth() === now.getMonth()
      );
    }).length;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return (
        added.getFullYear() === lastMonthDate.getFullYear() &&
        added.getMonth() === lastMonthDate.getMonth()
      );
    }).length;

    const delta = thisMonth - lastMonth;
    const pctChange =
      lastMonth > 0 ? Math.round((delta / lastMonth) * 1000) / 10 : null;

    const activeActivities = activities.filter(
      (a) => a.isActive !== false,
    ).length;
    const last3 = data.slice(-3);

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Growth Over Time</h3>
        <div className="analytics__summary">
          {/* Real-time panel */}
          <MetricsCard title="This Month" icon="📈">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <div>
                <strong style={{ fontSize: "1.8rem" }}>{thisMonth}</strong>
                <span className="muted"> new people</span>
              </div>
              <div
                style={{
                  color:
                    delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
                {pctChange !== null
                  ? `${Math.abs(pctChange)}% vs last month`
                  : "vs last month"}
              </div>
              <div className="muted">Active activities: {activeActivities}</div>
            </div>
          </MetricsCard>

          {/* Month-to-month table */}
          <MetricsCard title="Recent Months" icon="📅">
            <table
              style={{
                width: "100%",
                fontSize: "0.85rem",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    Month
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    People
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    Activities
                  </th>
                </tr>
              </thead>
              <tbody>
                {last3.map((m, i) => {
                  const prev = i > 0 ? last3[i - 1].newPeople : null;
                  const pct =
                    prev !== null && prev > 0
                      ? Math.round(((m.newPeople - prev) / prev) * 100)
                      : null;
                  return (
                    <tr key={m.label}>
                      <td style={{ padding: "0.25rem 0" }}>{m.label}</td>
                      <td style={{ textAlign: "right" }}>
                        {m.newPeople}
                        {pct !== null && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              marginLeft: "0.3rem",
                              color: pct >= 0 ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {pct >= 0 ? `+${pct}` : pct}%
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>{m.newActivities}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </MetricsCard>

          {/* 6-month bar chart */}
          <MetricsCard title="6-Month Trend" icon="📊">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar
                  dataKey="newPeople"
                  name="People"
                  fill="#4f46e5"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="newActivities"
                  name="Activities"
                  fill="#0d9488"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </MetricsCard>
        </div>
      </div>
    );
  },
);

GrowthOverTime.displayName = "GrowthOverTime";
