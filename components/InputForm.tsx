
import React from 'react';
import { UrlIcon, EmailIcon, SendIcon } from './IconComponents';

interface InputFormProps {
  url: string;
  email: string;
  onUrlChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (url: string, email: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ url, email, onUrlChange, onEmailChange, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url, email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="website-url" className="block text-sm font-medium text-sky-300 mb-1">
          Website URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UrlIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="url"
            name="website-url"
            id="website-url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-3 placeholder-slate-400 shadow-sm"
            placeholder="https://example.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-sky-300 mb-1">
          Email for Notifications
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EmailIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-3 placeholder-slate-400 shadow-sm"
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out group"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <SendIcon className="w-5 h-5 mr-2 transform transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
              Monitor Website
            </>
          )}
        </button>
      </div>
    </form>
  );
};
