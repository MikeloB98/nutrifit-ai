import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const COLORS = ["#60a5fa", "#fbbf24", "#f87171"];

function formatMacroTooltip(value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const displayValue = Number.isFinite(numericValue) ? numericValue.toFixed(1) : String(value);

  return [`${displayValue}g`, ""];
}

export function MacroChart({ protein, carbs, fat }: MacroChartProps) {
  const data = [
    { name: "Proteinas", value: protein, color: COLORS[0] },
    { name: "Carbohidratos", value: carbs, color: COLORS[1] },
    { name: "Grasas", value: fat, color: COLORS[2] },
  ];

  const total = protein + carbs + fat;

  return (
    <div className="animate-fade-in bg-dark-card rounded-xl border border-dark-border p-5">
      <h3 className="text-sm font-semibold text-dark-muted mb-4 uppercase tracking-wider">
        Distribucion de Macros
      </h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1c1c1c",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={formatMacroTooltip}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-dark-muted w-28">{item.name}</span>
              <span className="text-sm font-[var(--font-mono)] text-dark-text">
                {item.value.toFixed(1)}g
              </span>
              <span className="text-xs text-dark-muted">
                ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
