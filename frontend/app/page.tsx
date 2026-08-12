"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StoreWeatherParams,
  WeatherFileItem,
  OpenMeteoRawResponse,
} from "../lib/types";
import {
  storeWeatherData,
  listWeatherFiles,
  getWeatherFileContent,
} from "../lib/api";
import { transformOpenMeteoData } from "../lib/weather";
import { WeatherInput } from "../components/WeatherInput";
import { StoredFiles } from "../components/StoredFiles";
import { WeatherChart } from "../components/WeatherChart";
import { WeatherTable } from "../components/WeatherTable";
import { LoadingState } from "../components/LoadingState";
import { ErrorMessage } from "../components/ErrorMessage";
import { EmptyState } from "../components/EmptyState";
import { CloudSun, Sparkles, CheckCircle2 } from "lucide-react";

export default function WeatherExplorerPage() {
  const [files, setFiles] = useState<WeatherFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [rawData, setRawData] = useState<OpenMeteoRawResponse | null>(null);

  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(false);
  const [isFetchingContent, setIsFetchingContent] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch file list
  const fetchFilesList = useCallback(async () => {
    setIsFetchingFiles(true);
    setErrorMessage(null);
    try {
      const res = await listWeatherFiles();
      setFiles(res.files || []);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to list weather files from cloud storage.");
    } finally {
      setIsFetchingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchFilesList();
  }, [fetchFilesList]);

  // 2. Fetch specific weather file content
  const handleSelectFile = useCallback(async (fileName: string) => {
    setSelectedFile(fileName);
    setIsFetchingContent(true);
    setErrorMessage(null);
    try {
      const content = await getWeatherFileContent(fileName);
      setRawData(content);
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to load stored file content for ${fileName}`);
      setRawData(null);
    } finally {
      setIsFetchingContent(false);
    }
  }, []);

  // 3. Handle Store Weather Data form submission
  const handleStoreData = async (params: StoreWeatherParams) => {
    setIsStoring(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await storeWeatherData(params);
      setSuccessMessage(`Successfully fetched & stored weather JSON file: ${result.file}`);
      // Refresh list
      await fetchFilesList();
      // Auto select newly created file
      if (result.file) {
        await handleSelectFile(result.file);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to fetch and store weather data.");
    } finally {
      setIsStoring(false);
    }
  };

  const chartTableRows = rawData ? transformOpenMeteoData(rawData) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white border-b border-sky-700/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/20 backdrop-blur border border-sky-400/30 rounded-2xl text-sky-300">
              <CloudSun className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight">Weather Explorer</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  <Sparkles className="w-3 h-3" />
                  <span>Open-Meteo + GCS</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-2xl">
                Fetch historical daily weather metrics, archive raw JSON files in Google Cloud Storage,
                and inspect temperature trends via interactive charts and paginated tables.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Global Notifications */}
        {errorMessage && (
          <ErrorMessage message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        )}

        {successMessage && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-sm">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs text-emerald-600 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Section: Form Input & File Browser */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Weather Input Form */}
          <div className="lg:col-span-6">
            <WeatherInput onSubmit={handleStoreData} isLoading={isStoring} />
          </div>

          {/* Stored Files List Panel */}
          <div className="lg:col-span-6">
            <StoredFiles
              files={files}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              onRefresh={fetchFilesList}
              isLoading={isFetchingFiles}
            />
          </div>
        </div>

        {/* Bottom Section: Data Visualizations */}
        <section className="space-y-6 pt-2">
          {isFetchingContent ? (
            <LoadingState message={`Retrieving stored JSON content for ${selectedFile}...`} />
          ) : !selectedFile || !rawData ? (
            <EmptyState
              title="No File Selected"
              description="Click on any stored JSON file from the panel above or submit a new coordinate request to load weather data."
              type="chart"
            />
          ) : (
            <div className="space-y-6">
              {/* File Info Sub-header */}
              <div className="bg-white border border-slate-200/80 rounded-xl px-5 py-3 shadow-sm flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div>
                  <span className="font-semibold text-slate-800">Active File:</span>{" "}
                  <code className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {selectedFile}
                  </code>
                </div>
                <div className="flex items-center space-x-4 font-medium">
                  <span>
                    Location:{" "}
                    <strong className="text-slate-800">
                      {rawData.latitude}°N, {rawData.longitude}°E
                    </strong>
                  </span>
                  {rawData.timezone && (
                    <span>
                      Timezone: <strong className="text-slate-800">{rawData.timezone}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Line Chart */}
              <WeatherChart
                data={chartTableRows}
                title={`Daily Temperature Curves (${rawData.latitude}°, ${rawData.longitude}°)`}
              />

              {/* Data Table */}
              <WeatherTable data={chartTableRows} />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-500">
          Weather Explorer • Built with FastAPI, Google Cloud Storage & Next.js
        </div>
      </footer>
    </div>
  );
}
