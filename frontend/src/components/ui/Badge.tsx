import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { JourneyStatus } from '../../types';

interface DelayBadgeProps {
  status: JourneyStatus;
  delayMinutes: number;
  className?: string;
}

export const DelayBadge: React.FC<DelayBadgeProps> = ({ status, delayMinutes, className = '' }) => {
  if (status === 'ON_TIME' || delayMinutes === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>ON TIME</span>
      </span>
    );
  }

  if (status === 'DELAYED' || delayMinutes > 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300/70 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>+{delayMinutes} MIN DELAY</span>
      </span>
    );
  }

  if (status === 'EARLY') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200/60 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-cyan-600" />
        <span>{Math.abs(delayMinutes)} MIN EARLY</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
      <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
      <span>STATUS UNKNOWN</span>
    </span>
  );
};
