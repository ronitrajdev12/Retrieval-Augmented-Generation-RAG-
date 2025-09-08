import React from 'react';
import { InfoSectionData } from '../types';

export const Section: React.FC<{ section: InfoSectionData }> = ({ section }) => {
  const { icon: Icon, title, content, subsections } = section;

  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-inside space-y-2">
          {content.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      );
    }
    return <p>{content}</p>;
  };

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Icon className="w-8 h-8 mr-4 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="text-gray-600 dark:text-gray-300 space-y-3">
        {renderContent(content)}
        {subsections && (
          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            {subsections.map((sub, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{sub.title}</h3>
                {renderContent(sub.content)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};