
import React, { useState, useEffect, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { StatusDisplay } from './components/StatusDisplay';
import { Loader } from './components/Loader';
import { type MonitoringJob, AppStatus } from './types';
import { GEMINI_MODEL_TEXT, MONITORING_INTERVAL_MS, SIMULATED_RECOVERY_CHANCE, SIMULATED_INITIAL_DOWN_CHANCE } from './constants';
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon, ZapIcon } from './components/IconComponents';
import { GeminiService } from './services/geminiService';

// Simulated Monitoring Service (would be a backend service in a real app)
const simulatedMonitoringService = {
  checkWebsiteStatus: async (url: string): Promise<'up' | 'down'> => {
    console.log(`Simulating status check for: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // For demo, let's make some common sites "up" and others random
    if (url.includes('google.com') || url.includes('example.com') || url.includes('github.com')) {
      return 'up';
    }
    return Math.random() > SIMULATED_INITIAL_DOWN_CHANCE ? 'up' : 'down';
  },
};

const App: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [currentJob, setCurrentJob] = useState<MonitoringJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [appMessage, setAppMessage] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(false);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);

  useEffect(() => {
    // Check for API_KEY on mount and initialize GeminiService
    // In a real app, process.env.API_KEY would be set in the environment
    const key = process.env.API_KEY;
    if (key) {
      setApiKeyAvailable(true);
      setGeminiService(new GeminiService(key));
    } else {
      setApiKeyAvailable(false);
      console.warn("API_KEY environment variable not found. Gemini features will be limited.");
      // Create a mock GeminiService if key is not present
      setGeminiService(new GeminiService('MOCK_API_KEY_FRONTEND_ONLY')); 
    }
  }, []);
  
  const getGeminiInsight = useCallback(async (prompt: string): Promise<string> => {
    if (!geminiService) return "Gemini Service not available.";
    try {
      const insight = await geminiService.generateText(prompt);
      return insight;
    } catch (error) {
      console.error("Error fetching Gemini insight:", error);
      return "Could not fetch additional insights at this time.";
    }
  }, [geminiService]);


  const handleFormSubmit = async (url: string, email: string) => {
    setIsLoading(true);
    setAppStatus(AppStatus.PROCESSING);
    setAppMessage('Validating inputs and checking website status...');
    setCurrentJob(null); // Clear previous job details

    // Basic validation
    if (!url.trim() || !email.trim() || !email.includes('@')) {
      setAppStatus(AppStatus.ERROR);
      setAppMessage('Invalid URL or Email. Please check your input.');
      setIsLoading(false);
      return;
    }
    
    const newJobId = Date.now().toString();
    let jobDetails: MonitoringJob = { id: newJobId, url, email, status: 'INITIAL_CHECK', message: 'Checking website status...' };
    setCurrentJob(jobDetails);

    try {
      const initialStatus = await simulatedMonitoringService.checkWebsiteStatus(url);
      let insightPrompt = '';
      let userMessage = '';

      if (initialStatus === 'up') {
        userMessage = `Good news! ${url} is currently UP.`;
        insightPrompt = `The website ${url} was just checked and it's online. Briefly describe what type of website this might be based on its URL, in a friendly tone.`;
        jobDetails = { ...jobDetails, status: 'INITIALLY_UP', message: userMessage };
      } else {
        userMessage = `${url} appears to be DOWN. We will start monitoring it.`;
        insightPrompt = `The website ${url} was just checked and it seems to be down. Offer a brief, reassuring, and slightly empathetic comment about this situation.`;
        jobDetails = { ...jobDetails, status: 'DOWN_MONITORING', message: userMessage };
      }
      
      setAppMessage(userMessage + " Fetching insights...");
      setCurrentJob(jobDetails);

      if (apiKeyAvailable && geminiService) {
        const insight = await getGeminiInsight(insightPrompt);
        jobDetails = { ...jobDetails, geminiInsight: insight };
        setCurrentJob(jobDetails);
        setAppMessage(userMessage); // Update message after insight
      } else {
         jobDetails = { ...jobDetails, geminiInsight: "Gemini insights are unavailable (API key might be missing)." };
         setCurrentJob(jobDetails);
         setAppMessage(userMessage);
      }
      
      setAppStatus(initialStatus === 'up' ? AppStatus.IDLE : AppStatus.MONITORING);

    } catch (error) {
      console.error("Error during initial check:", error);
      setAppStatus(AppStatus.ERROR);
      const errorMsg = `Error checking ${url}. Please try again.`;
      setAppMessage(errorMsg);
      setCurrentJob({ ...jobDetails, status: 'ERROR_STATE', message: errorMsg, geminiInsight: "Error occurred before insights could be fetched." });
    } finally {
      setIsLoading(false);
      setUrlInput(''); // Clear inputs after submission attempt
      setEmailInput('');
    }
  };

  // Effect for continuous monitoring if site is down
  useEffect(() => {
    let intervalId: number | undefined;

    if (currentJob && currentJob.status === 'DOWN_MONITORING' && appStatus === AppStatus.MONITORING) {
      setAppMessage(`${currentJob.url} is being monitored. We'll notify ${currentJob.email} when it's back up.`);
      
      intervalId = window.setInterval(async () => { // Use window.setInterval for clarity in browser environment
        console.log(`Simulating background check for ${currentJob.url}`);
        // Simulate chance of recovery
        if (Math.random() < SIMULATED_RECOVERY_CHANCE) {
          if(intervalId) clearInterval(intervalId); // Clear interval before state updates
          const recoveryMessage = `${currentJob.url} is back UP! A notification would be sent to ${currentJob.email}.`;
          setAppStatus(AppStatus.IDLE); // Or a new "RECOVERED" status
          setAppMessage(recoveryMessage);
          
          let updatedJob = { ...currentJob, status: 'RECOVERED' as const, message: recoveryMessage };
          setCurrentJob(updatedJob);

          if (apiKeyAvailable && geminiService) {
            const insightPrompt = `The website ${currentJob.url}, which was previously down, is now back online. Provide a brief, positive remark about its recovery.`;
            const insight = await getGeminiInsight(insightPrompt);
            updatedJob = { ...updatedJob, geminiInsight: insight };
            setCurrentJob(updatedJob);
          } else {
            updatedJob = { ...updatedJob, geminiInsight: "Gemini insights are unavailable." };
            setCurrentJob(updatedJob);
          }
          console.log(`SIMULATED EMAIL: Notification sent to ${currentJob.email} for ${currentJob.url} being back up.`);
        } else {
          // Still down, update message slightly or just log
          const stillDownMessage = `${currentJob.url} is still down. Continuing to monitor... (Last check: ${new Date().toLocaleTimeString()})`;
          setCurrentJob(prev => prev ? {...prev, message: stillDownMessage } : null);
          console.log(stillDownMessage);
        }
      }, MONITORING_INTERVAL_MS);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentJob, appStatus, apiKeyAvailable, getGeminiInsight, geminiService]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 flex items-center justify-center">
          <ZapIcon className="w-12 h-12 mr-3 text-sky-400" />
          Website Uptime Monitor
        </h1>
        <p className="text-slate-400 mt-3 text-lg">
          Enter a URL and email. We'll check its status and notify you if it's down and comes back up.
        </p>
         {!apiKeyAvailable && (
          <p className="mt-2 text-sm text-amber-400 bg-amber-900/50 px-3 py-1 rounded-md inline-flex items-center">
            <AlertTriangleIcon className="w-4 h-4 mr-2"/>
            Gemini API key not detected. Insights will be limited.
          </p>
        )}
      </header>

      <main className="w-full max-w-2xl bg-slate-800 shadow-2xl rounded-xl p-8 ">
        <InputForm
          url={urlInput}
          email={emailInput}
          onUrlChange={setUrlInput}
          onEmailChange={setEmailInput}
          onSubmit={handleFormSubmit}
          isLoading={isLoading || appStatus === AppStatus.PROCESSING}
        />

        {isLoading && appStatus === AppStatus.PROCESSING && (
          <div className="mt-6 flex flex-col items-center text-center">
            <Loader />
            <p className="text-sky-300 mt-3 animate-pulse">{appMessage || 'Processing...'}</p>
          </div>
        )}

        {appStatus === AppStatus.ERROR && appMessage && (
          <div className="mt-6 p-4 bg-red-700/30 border border-red-500 rounded-lg text-red-300 flex items-start">
            <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-200">Error</h3>
              <p>{appMessage}</p>
            </div>
          </div>
        )}
        
        {currentJob && (appStatus === AppStatus.IDLE || appStatus === AppStatus.MONITORING) && (
           <StatusDisplay job={currentJob} />
        )}

      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Uptime Monitor Inc. Powered by React & Tailwind CSS.</p>
        <p>This is a demo application. Email notifications and background checks are simulated.</p>
      </footer>
    </div>
  );
};

export default App;
