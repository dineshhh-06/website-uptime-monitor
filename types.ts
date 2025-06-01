
export enum AppStatus {
  IDLE = 'IDLE', // Ready for input or showing results of a completed job
  PROCESSING = 'PROCESSING', // Actively validating input or performing initial check
  MONITORING = 'MONITORING', // Site was down, now actively monitoring
  ERROR = 'ERROR', // An error occurred
}

export interface MonitoringJob {
  id: string;
  url: string;
  email: string;
  status: 'INITIAL_CHECK' | 'DOWN_MONITORING' | 'RECOVERED' | 'INITIALLY_UP' | 'ERROR_STATE';
  message: string;
  geminiInsight?: string;
}
