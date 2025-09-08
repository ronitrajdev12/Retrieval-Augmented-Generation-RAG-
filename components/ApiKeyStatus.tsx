import React from 'react';
import { GEMINI_API_KEY } from '../constants';

export const ApiKeyStatus: React.FC = () => {
  const isApiKeyAvailable = !!GEMINI_API_KEY;

  return (
    <div className={`p-4 rounded-lg mb-6 text-center ${isApiKeyAvailable ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
      {isApiKeyAvailable ? (
        <p>
          <span className="font-bold">Gemini API Key:</span> Found and loaded from environment variables.
        </p>
      ) : (
        <p>
          <span className="font-bold">Gemini API Key:</span> Not found. Please set up your <code>.env</code> file with <code>API_KEY=&lt;YOUR_API_KEY&gt;</code>.
        </p>
      )}
    </div>
  );
};