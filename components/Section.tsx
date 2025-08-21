
import React, { useState } from 'react';
import { InfoSectionData } from '../types';

interface SectionProps extends InfoSectionData {
  defaultOpen?: boolean;
}

export const Section: React.FC<SectionProps> = ({ title, content, subsections, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-700/50 shadow-md rounded-lg p-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
      >
        <h3 className="text-xl font-semibold text-primary-400">{title}</h3>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="p-4 pt-2">
          {typeof content === 'string' ? (
            <p className="text-gray-300 leading-relaxed">{content}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed">
              {content.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
          {subsections && subsections.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-primary-500 space-y-3">
              {subsections.map((sub, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-primary-300">{sub.title}</h4>
                  {typeof sub.content === 'string' ? (
                     <p className="text-gray-300 text-sm">{sub.content}</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                        {sub.content.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
