import React from "react";
import { CloudSun, FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  type?: "chart" | "files";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Weather Data Selected",
  description = "Select a stored weather JSON file from the panel or submit new coordinates above to view visualizations.",
  type = "chart",
}) => {
  const Icon = type === "files" ? FolderOpen : CloudSun;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/80 border border-dashed border-slate-300 rounded-xl my-4 space-y-3">
      <div className="p-3 bg-sky-100/70 text-sky-600 rounded-full">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md">{description}</p>
    </div>
  );
};
