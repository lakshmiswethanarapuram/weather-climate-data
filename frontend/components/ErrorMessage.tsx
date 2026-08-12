import React from "react";
import { AlertCircle, XCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between p-4 my-3 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <span className="text-sm font-medium leading-relaxed">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-md"
          aria-label="Dismiss error"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
