import React from 'react';
import { ragInfoSections } from './constants';
import { Section } from './components/Section';
import InteractiveRagDemo from './components/InteractiveRagDemo';
import { ApiKeyStatus } from './components/ApiKeyStatus';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';

function App() {
  // Initialize theme management
  useTheme('light');

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Understanding RAG with Gemini
          </h1>
          <ThemeToggle />
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <ApiKeyStatus />
          </div>
          <div className="lg:col-span-3">
            <InteractiveRagDemo />
          </div>
          {ragInfoSections.map((section, index) => (
            <Section key={index} section={section} />
          ))}
        </main>
        <footer className="text-center mt-12 py-4 text-gray-500 dark:text-gray-400">
          <p>Built with Gemini & React. An interactive guide to Retrieval-Augmented Generation.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;