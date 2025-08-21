
import React from 'react';
import { InteractiveRagDemo } from './components/InteractiveRagDemo';
import { ApiKeyStatus } from './components/ApiKeyStatus';
import { ragInfoSections } from './constants';
import { Section } from './components/Section';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-400">
          Retrieval-Augmented Generation (RAG)
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Explainer & Interactive Demo
        </p>
      </header>

      <ApiKeyStatus />

      <main className="max-w-5xl mx-auto space-y-12">
        <div className="bg-gray-800 shadow-xl rounded-lg p-6">
          <h2 className="text-3xl font-semibold mb-6 text-primary-300 border-b-2 border-primary-500 pb-2">Learn About RAG</h2>
          <div className="space-y-6">
            {ragInfoSections.map((section, index) => (
              <Section key={index} title={section.title} content={section.content} subsections={section.subsections} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 shadow-xl rounded-lg p-6">
          <h2 className="text-3xl font-semibold mb-6 text-primary-300 border-b-2 border-primary-500 pb-2">Interactive RAG Demo</h2>
          <InteractiveRagDemo />
        </div>
      </main>

      <footer className="text-center mt-12 py-6 border-t border-gray-700">
        <p className="text-gray-500">Built with React, TypeScript, Tailwind CSS, and Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;