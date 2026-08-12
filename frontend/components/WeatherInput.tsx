"use client";

import React, { useState, useMemo } from "react";
import { StoreWeatherParams } from "../lib/types";
import { MapPin, Calendar, Send, Loader2 } from "lucide-react";

interface WeatherInputProps {
  onSubmit: (params: StoreWeatherParams) => Promise<void>;
  isLoading: boolean;
}

export const WeatherInput: React.FC<WeatherInputProps> = ({ onSubmit, isLoading }) => {
  const [latitude, setLatitude] = useState<string>("17.3850");
  const [longitude, setLongitude] = useState<string>("78.4867");
  const [startDate, setStartDate] = useState<string>("2026-08-01");
  const [endDate, setEndDate] = useState<string>("2026-08-07");

  // Client-side validation calculation
  const validationError = useMemo(() => {
    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return "Latitude must be a valid number between -90 and 90.";
    }

    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      return "Longitude must be a valid number between -180 and 180.";
    }

    if (!startDate || !endDate) {
      return "Both start date and end date are required.";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date format.";
    }

    if (start > end) {
      return "Start date must be less than or equal to end date.";
    }

    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    if (diffDays > 31) {
      return `Date range cannot exceed 31 days (${diffDays} days requested).`;
    }

    return null;
  }, [latitude, longitude, startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || isLoading) return;

    await onSubmit({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
        <MapPin className="w-5 h-5 text-sky-600" />
        <h2 className="text-lg font-semibold text-slate-800">Fetch Historical Weather Data</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Latitude (-90 to 90)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 17.3850"
                className="w-full pl-3 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Longitude (-180 to 180)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="-180"
                max="180"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 78.4867"
                className="w-full pl-3 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              End Date (Max 31 days)
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 font-medium"
                required
              />
            </div>
          </div>
        </div>

        {validationError && (
          <p className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={Boolean(validationError) || isLoading}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 text-white shadow-sm transition-all ${
            Boolean(validationError) || isLoading
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700 active:scale-[0.99]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching & Storing Raw Weather JSON...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Fetch & Store Data</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
