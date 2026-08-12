"use client";

import React, { useState, useMemo } from "react";
import { WeatherDataRow } from "../lib/types";
import { Table, ChevronLeft, ChevronRight } from "lucide-react";

interface WeatherTableProps {
  data: WeatherDataRow[];
}

export const WeatherTable: React.FC<WeatherTableProps> = ({ data }) => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil((data?.length || 0) / pageSize) || 1;

  // Ensure current page stays within bounds if data or page size changes
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return data.slice(startIdx, startIdx + pageSize);
  }, [data, safeCurrentPage, pageSize]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-semibold text-slate-800">
            Daily Weather Data Table ({data.length} Days)
          </h3>
        </div>

        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-slate-500">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-red-600">Temp Max (°C)</th>
              <th className="px-4 py-3 text-blue-600">Temp Min (°C)</th>
              <th className="px-4 py-3 text-orange-600">Apparent Max (°C)</th>
              <th className="px-4 py-3 text-cyan-600">Apparent Min (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((row, idx) => (
              <tr
                key={row.date + idx}
                className="hover:bg-slate-50/80 transition-colors font-medium"
              >
                <td className="px-4 py-3 text-slate-900 font-semibold">{row.date}</td>
                <td className="px-4 py-3">
                  {row.tempMax !== null ? `${row.tempMax.toFixed(1)} °C` : "N/A"}
                </td>
                <td className="px-4 py-3">
                  {row.tempMin !== null ? `${row.tempMin.toFixed(1)} °C` : "N/A"}
                </td>
                <td className="px-4 py-3">
                  {row.apparentMax !== null ? `${row.apparentMax.toFixed(1)} °C` : "N/A"}
                </td>
                <td className="px-4 py-3">
                  {row.apparentMin !== null ? `${row.apparentMin.toFixed(1)} °C` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500 font-medium">
          Showing Page <span className="font-semibold text-slate-700">{safeCurrentPage}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalPages}</span> ({data.length} total entries)
        </p>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage <= 1}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={safeCurrentPage >= totalPages}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
