
import React from 'react';
import { type MonitoringJob } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, EyeIcon, MailIcon, SparklesIcon } from './IconComponents';

interface StatusDisplayProps {
  job: MonitoringJob;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ job }) => {
  const { url, email, status, message, geminiInsight } = job;

  let statusColorClass = 'bg-slate-700 border-slate-600';
  let textColorClass = 'text-slate-300';
  let icon: React.ReactNode | null = null;

  switch (status) {
    case 'INITIALLY_UP':
      statusColorClass = 'bg-green-700/30 border-green-500';
      textColorClass = 'text-green-300';
      icon = <CheckCircleIcon className="w-8 h-8 text-green-400" />;
      break;
    case 'DOWN_MONITORING':
      statusColorClass = 'bg-yellow-700/30 border-yellow-500';
      textColorClass = 'text-yellow-300';
      icon = <EyeIcon className="w-8 h-8 text-yellow-400 animate-pulse" />;
      break;
    case 'RECOVERED':
      statusColorClass = 'bg-sky-700/30 border-sky-500';
      textColorClass = 'text-sky-300';
      icon = <MailIcon className="w-8 h-8 text-sky-400" />;
      break;
    case 'INITIAL_CHECK':
      statusColorClass = 'bg-blue-700/30 border-blue-500';
      textColorClass = 'text-blue-300';
      icon = <EyeIcon className="w-8 h-8 text-blue-400 animate-spin" />;
      break;
    case 'ERROR_STATE':
      statusColorClass = 'bg-red-700/30 border-red-500';
      textColorClass = 'text-red-300';
      icon = <AlertTriangleIcon className="w-8 h-8 text-red-400" />;
      break;
  }

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg border ${statusColorClass} transition-all duration-500 ease-in-out`}>
      <div className="flex items-start">
        {icon && <div className="flex-shrink-0 mr-4 mt-1">{icon}</div>}
        <div>
          <h3 className={`text-xl font-semibold ${textColorClass} mb-1`}>Monitoring Status for: <span className="font-bold text-white break-all">{url}</span></h3>
          {status !== 'INITIALLY_UP' && status !== 'RECOVERED' && status !== 'ERROR_STATE' && (
            <p className="text-sm text-slate-400 mb-2">Notifications will be sent to: <span className="font-medium text-slate-300">{email}</span></p>
          )}
          <p className={`text-md ${textColorClass}`}>{message}</p>
        </div>
      </div>

      {geminiInsight && (
        <div className="mt-4 pt-4 border-t border-slate-600/50">
          <h4 className="text-sm font-semibold text-purple-400 flex items-center mb-1">
            <SparklesIcon className="w-5 h-5 mr-2 text-purple-400" />
            Gemini Insights
          </h4>
          <p className="text-sm text-slate-300 italic">{geminiInsight}</p>
        </div>
      )}
       {status === 'RECOVERED' && (
         <p className="text-sm text-green-400 mt-3">Simulated email notification sent to {email}.</p>
       )}
    </div>
  );
};
