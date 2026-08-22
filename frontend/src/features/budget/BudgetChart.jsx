import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, CATEGORY_COLORS } from "../../utils/currency";

export default function BudgetChart({ byCategory }) {
  const data = Object.entries(byCategory).map(([category, total_cost]) => ({
    category,
    total_cost,
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total_cost"
            nameKey="category"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dce3df",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-ink">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
