import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface LiveIndicatorProps {
  updatedAt: string;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ updatedAt, onRefresh, isFetching }) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateDiff = () => {
      if (!updatedAt) return;
      const diff = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000));
      setSecondsAgo(diff);
    };

    updateDiff();
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, [updatedAt]);

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-secondary px-3 py-1.5 rounded-full border border-surface-tertiary">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}</span>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="ml-1 p-1 hover:bg-black/5 rounded-full transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
          title="Manual refresh"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin text-accent' : ''}`} />
        </button>
      )}
    </div>
  );
};
