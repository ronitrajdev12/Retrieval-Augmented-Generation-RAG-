
import React from 'react';
import { GEMINI_API_KEY } from '../constants';

export const ApiKeyStatus: React.FC = () => {
  const isApiKeySet = GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '';

  if (isApiKeySet) {
    return (
      <div className="mb-6 p-3 bg-green-800/50 border border-green-700 text-green-300 rounded-md text-sm text-center max-w-3xl mx-auto">
        <p>Gemini API Key detected. Interactive demo should be functional.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-yellow-800/50 border border-yellow-700 text-yellow-300 rounded-md max-w-3xl mx-auto">
      <h3 className="font-semibold text-yellow-200">Gemini API Key Not Configured</h3>
      <p className="text-sm mt-1">
        The interactive RAG demo requires a Google Gemini API key.
        Please ensure you have an environment variable named <code>API_KEY</code> (or <code>REACT_APP_API_KEY</code> / <code>VITE_API_KEY</code> depending on your setup)
        set with your valid API key. You might need to rebuild or restart your development server after setting it.
      </p>
      <p className="text-xs mt-2 text-yellow-400">
        This application attempts to read the API key from <code>process.env.API_KEY</code> at build time.
      </p>
    </div>
  );
};
