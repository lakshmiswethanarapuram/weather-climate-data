"use client";

import React from "react";
import { WeatherFileItem } from "../lib/types";
import { formatBytes, formatDate } from "../lib/weather";
import { Folder, RefreshCw, FileText, CheckCircle2, HardDrive } from "lucide-react";

interface StoredFilesProps {
  files: WeatherFileItem[];
  selectedFile: string | null;
  onSelectFile: (fileName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StoredFiles: React.FC<StoredFilesProps> = ({
  files,
  selectedFile,
  onSelectFile,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-semibold text-slate-800">Cloud Storage JSON Files</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh stored files list"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && files.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
          <span>Refreshing files...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Folder className="w-6 h-6 text-slate-300" />
          <span>No stored weather JSON files found.</span>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
          {files.map((file) => {
            const isSelected = file.name === selectedFile;

            return (
              <button
                key={file.name}
                onClick={() => onSelectFile(file.name)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between space-x-3 ${
                  isSelected
                    ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-500/20 shadow-sm"
                    : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0">
                  <FileText
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isSelected ? "text-sky-600" : "text-slate-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-sky-950" : "text-slate-700"
                      }`}
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatBytes(file.size)} • {formatDate(file.created_at)}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
