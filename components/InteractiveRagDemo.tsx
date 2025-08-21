
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY, GEMINI_MODEL_TEXT } from '../constants';
import { ExpandedQuery, RetrievedContext, RagStage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

// Helper to parse JSON from Gemini response, removing markdown fences and attempting recovery for malformed arrays
const parseJsonFromGemini = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = fenceRegex.exec(jsonStr);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    // First attempt: direct parsing
    return JSON.parse(jsonStr) as T;
  } catch (e1) {
    console.warn("Initial JSON.parse failed. Attempting recovery. Error:", e1);
    // console.debug("Original text for recovery (after fence removal):", jsonStr);

    // Recovery strategy: if the string looks like an array (starts with [ ends with ]),
    // try to extract and parse individual objects.
    // This is useful if there's garbage data BETWEEN valid objects in an array.
    if (jsonStr.startsWith('[') && jsonStr.endsWith(']')) {
      const contentInsideBrackets = jsonStr.substring(1, jsonStr.length - 1).trim();
      const successfullyParsedObjects: any[] = [];
      
      let balance = 0;
      let startIndex = -1;

      for (let i = 0; i < contentInsideBrackets.length; i++) {
        if (contentInsideBrackets[i] === '{') {
          if (balance === 0) {
            startIndex = i;
          }
          balance++;
        } else if (contentInsideBrackets[i] === '}') {
          balance--;
          if (balance === 0 && startIndex !== -1) {
            const objString = contentInsideBrackets.substring(startIndex, i + 1);
            try {
              successfullyParsedObjects.push(JSON.parse(objString));
            } catch (objParseError) {
              console.warn("Failed to parse extracted object during recovery:", objParseError, "Object string:", objString);
              // If an object fails, we skip it and try to continue with others.
            }
            startIndex = -1; 
          } else if (balance < 0) {
            // Unbalanced braces, likely malformed beyond this simple recovery
            // Reset balance and startIndex to try and find more objects if possible
            console.warn("Unbalanced braces detected during recovery attempt at index " + i);
            balance = 0; 
            startIndex = -1;
          }
        }
      }
      
      if (successfullyParsedObjects.length > 0) {
        console.log(`Recovery successful: Extracted ${successfullyParsedObjects.length} objects from malformed array.`);
        return successfullyParsedObjects as unknown as T; 
      }
    }
    
    console.error("Failed to parse JSON even after attempting recovery. Original text (before any processing):", text);
    return null;
  }
};


export const InteractiveRagDemo: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("Summarize the company's leave policy, including vacation days and approval process.");
  const [expandedQueries, setExpandedQueries] = useState<ExpandedQuery[]>([]);
  const [retrievedContexts, setRetrievedContexts] = useState<RetrievedContext[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<RagStage>(RagStage.IDLE);
  const [error, setError] = useState<string | null>(null);

  const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

  const runRagPipeline = useCallback(async () => {
    if (!ai) {
      setError("Gemini API key not configured. Please set API_KEY in your environment variables.");
      setCurrentStage(RagStage.ERROR);
      return;
    }
    if (!userInput.trim()) {
        setError("Please enter a query.");
        setCurrentStage(RagStage.ERROR);
        return;
    }

    setError(null);
    setExpandedQueries([]);
    setRetrievedContexts([]);
    setFinalAnswer('');

    try {
      // 1. Query Expansion
      setCurrentStage(RagStage.EXPANDING_QUERY);
      const expansionPrompt = `Original Query: "${userInput}"
You are a helpful assistant that expands user queries to improve information retrieval.
Generate 3 diverse but highly relevant alternative queries or related questions that explore different facets of the original query.
Focus on capturing user intent and covering related sub-topics.
Return the queries as a JSON array of strings. For example: ["related query 1", "related query 2", "related query 3"]`;
      
      let expansionResponse;
      try {
        expansionResponse = await ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: expansionPrompt,
          config: { responseMimeType: "application/json" }
        });
      } catch (e: any) {
        throw new Error(`Query Expansion API call failed: ${e.message}`);
      }
      
      const expandedQueryStrings = parseJsonFromGemini<string[]>(expansionResponse.text);
      if (!expandedQueryStrings || !Array.isArray(expandedQueryStrings)) {
        console.error("Parsed expanded queries issue:", expandedQueryStrings);
        throw new Error("Failed to parse expanded queries from Gemini response or response is not a valid array of strings.");
      }
      const newExpandedQueries = expandedQueryStrings.map((q, i) => ({ id: `eq-${i}`, query: q }));
      setExpandedQueries(newExpandedQueries);

      // 2. Simulated Retrieval
      setCurrentStage(RagStage.SIMULATING_RETRIEVAL);
      const retrievalPrompt = `Original Query: "${userInput}"
Expanded Queries: ${JSON.stringify(newExpandedQueries.map(eq => eq.query))}

You are simulating a document retrieval system. Based on the original query and the expanded queries, generate 3-4 distinct, concise text snippets (each 30-70 words) that would be highly relevant if retrieved from a knowledge base about general topics or common company policies.
Each snippet should represent a piece of information that helps answer the original query.
For each snippet, invent a plausible source document and section, like "Source: Employee Handbook, Section: Leave Policy" or "Source: Benefits Guide, Page 5".
Format the output as a JSON array of objects, where each object has "snippet" (the text) and "source" (the invented document reference) keys.
Example: [{"snippet": "Annual leave accrues based on years of service...", "source": "Employee Handbook, Section 3.1"}, {"snippet": "All leave requests must be submitted via the HR portal for manager approval.", "source": "Company Policy Document XYZ, Page 12"}]
Ensure the snippets are diverse and directly address potential aspects of the query.`;

      let retrievalResponse;
      try {
        retrievalResponse = await ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: retrievalPrompt,
          config: { responseMimeType: "application/json" }
        });
      } catch (e: any) {
        throw new Error(`Simulated Retrieval API call failed: ${e.message}`);
      }

      const parsedContexts = parseJsonFromGemini<Array<{snippet: string, source: string}>>(retrievalResponse.text);
       if (!parsedContexts || !Array.isArray(parsedContexts)) {
        console.error("Parsed retrieved contexts issue:", parsedContexts);
        throw new Error("Failed to parse retrieved contexts from Gemini response or response is not a valid array of objects.");
      }
      const newRetrievedContexts = parsedContexts.map((ctx, i) => ({ id: `rc-${i}`, snippet: ctx.snippet, source: ctx.source }));
      setRetrievedContexts(newRetrievedContexts);

      if (newRetrievedContexts.length === 0) {
        setFinalAnswer("No relevant information was retrieved based on the query. Please try rephrasing your question.");
        setCurrentStage(RagStage.DONE);
        return;
      }

      // 3. Answer Generation
      setCurrentStage(RagStage.GENERATING_ANSWER);
      const generationPrompt = `Original Query: "${userInput}"

Retrieved Contexts:
${newRetrievedContexts.map((ctx, i) => `Context Snippet ${i+1} (Source: ${ctx.source}):\n${ctx.snippet}`).join('\n\n')}

You are an AI assistant tasked with answering the user's original query based *only* on the provided retrieved contexts.
Your answer should be concise, accurate, and directly address the query.
If the provided contexts are sufficient, synthesize the information to form a comprehensive answer.
You MUST cite the source for each piece of information you use in your answer, like "[Source: Employee Handbook, Section 3.1]".
If the contexts do not contain enough information to answer the query, or if you are not confident in the answer based *solely* on the provided contexts, you MUST respond with "I'm sorry, but I don't have enough information from the provided contexts to answer your question."
Do not use any external knowledge. Adhere strictly to the provided context.
Focus on answering the original query directly. If the query asks for "vacation days" and "approval process", ensure these are specifically addressed if context allows.
`;
      let generationResponse;
      try {
        generationResponse = await ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: generationPrompt,
        });
      } catch (e: any) {
        throw new Error(`Answer Generation API call failed: ${e.message}`);
      }
      
      setFinalAnswer(generationResponse.text);
      setCurrentStage(RagStage.DONE);

    } catch (err: any) {
      console.error("RAG Pipeline Error:", err);
      setError(err.message || "An unexpected error occurred in the RAG pipeline.");
      setCurrentStage(RagStage.ERROR);
    }
  }, [ai, userInput]);

  const isLoading = [RagStage.EXPANDING_QUERY, RagStage.SIMULATING_RETRIEVAL, RagStage.GENERATING_ANSWER].includes(currentStage);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="userInput" className="block text-sm font-medium text-gray-300 mb-1">
          Enter your query:
        </label>
        <textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., What is the company's policy on remote work?"
          rows={3}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-gray-100 placeholder-gray-400"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={runRagPipeline}
        disabled={isLoading || !ai}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isLoading ? <LoadingSpinner /> : 'Run RAG Pipeline'}
      </button>

      {error && (
        <div className="p-4 bg-red-800/50 border border-red-700 text-red-300 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {currentStage !== RagStage.IDLE && currentStage !== RagStage.ERROR && (
        <div className="space-y-8 mt-8">
          {/* Query Expansion Output */}
          {(currentStage === RagStage.EXPANDING_QUERY || expandedQueries.length > 0 || currentStage === RagStage.SIMULATING_RETRIEVAL || currentStage === RagStage.GENERATING_ANSWER || currentStage === RagStage.DONE) && (
            <div className="p-4 bg-gray-700/70 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary-300 mb-3">1. Query Expansion</h3>
              {currentStage === RagStage.EXPANDING_QUERY && <div className="flex items-center text-gray-400"><LoadingSpinner size="sm"/> <span className="ml-2">Generating expanded queries...</span></div>}
              {expandedQueries.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {expandedQueries.map(item => <li key={item.id}>{item.query}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Simulated Retrieval Output */}
          {(currentStage === RagStage.SIMULATING_RETRIEVAL || retrievedContexts.length > 0 || currentStage === RagStage.GENERATING_ANSWER || currentStage === RagStage.DONE) && (
             <div className="p-4 bg-gray-700/70 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary-300 mb-3">2. Simulated Retrieval</h3>
              {currentStage === RagStage.SIMULATING_RETRIEVAL && <div className="flex items-center text-gray-400"><LoadingSpinner size="sm"/> <span className="ml-2">Simulating document retrieval...</span></div>}
              {retrievedContexts.length > 0 && (
                <div className="space-y-3">
                  {retrievedContexts.map(item => (
                    <div key={item.id} className="p-3 bg-gray-600/50 rounded">
                      <p className="text-sm text-gray-300 leading-relaxed">{item.snippet}</p>
                      <p className="text-xs text-primary-400 mt-1">Source: {item.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Final Answer Output */}
          {(currentStage === RagStage.GENERATING_ANSWER || finalAnswer || currentStage === RagStage.DONE) && (
            <div className="p-4 bg-gray-700/70 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-primary-300 mb-3">3. Generated Answer</h3>
              {currentStage === RagStage.GENERATING_ANSWER && <div className="flex items-center text-gray-400"><LoadingSpinner size="sm"/> <span className="ml-2">Generating final answer...</span></div>}
              {finalAnswer && (
                <div className="prose prose-sm prose-invert max-w-none text-gray-200 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: finalAnswer.replace(/\[Source:.*?\]/g, '<strong class="text-primary-400">$&</strong>') }} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
