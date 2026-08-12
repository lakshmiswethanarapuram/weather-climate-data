"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { WeatherDataRow } from "../lib/types";
import { TrendingUp } from "lucide-react";

interface WeatherChartProps {
  data: WeatherDataRow[];
  title?: string;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({
  data,
  title = "Temperature Trends (°C)",
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
        <TrendingUp className="w-5 h-5 text-sky-600" />
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="w-full h-72 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickMargin={8}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              unit="°C"
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                borderColor: "#cbd5e1",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: "15px", fontSize: "13px" }} />
            <Line
              type="monotone"
              dataKey="tempMax"
              name="Max Temp (°C)"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ef4444" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="tempMin"
              name="Min Temp (°C)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="apparentMax"
              name="Apparent Max (°C)"
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="apparentMin"
              name="Apparent Min (°C)"
              stroke="#06b6d4"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
