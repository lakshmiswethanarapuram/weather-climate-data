import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading weather data...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 bg-white/50 backdrop-blur border border-slate-200/80 rounded-xl shadow-sm my-4">
      <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
