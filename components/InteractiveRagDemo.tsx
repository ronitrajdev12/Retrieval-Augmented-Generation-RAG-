import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { GEMINI_API_KEY, GEMINI_MODEL_TEXT } from '../constants';
import { ExpandedQuery, RetrievedContext, RagStage, FinalAnswerData } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { UploadCloudIcon, Sparkles, Search, Star, Brain, SpeakerIcon, SpeakerMuteIcon } from './icons';

interface StageDisplayProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isLoading: boolean;
  show: boolean;
  animationDelay?: string;
  icon?: React.ReactNode;
}

const StageDisplay: React.FC<StageDisplayProps> = ({ title, children, isLoading, show, icon, animationDelay = '0s' }) => {
  if (!show) return null;
  return (
    <div
      className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-fade-in-up"
      style={{ animationDelay }}
    >
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        <div className="flex-grow">{title}</div>
        {isLoading && <LoadingSpinner size="sm" className="ml-3" />}
      </h3>
      {!isLoading && children}
    </div>
  );
};


const InteractiveRagDemo: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [stage, setStage] = useState<RagStage>(RagStage.IDLE);
  const [expandedQueries, setExpandedQueries] = useState<ExpandedQuery[]>([]);
  const [initialContext, setInitialContext] = useState<RetrievedContext[]>([]);
  const [rerankedContext, setRerankedContext] = useState<RetrievedContext[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentChunks, setDocumentChunks] = useState<RetrievedContext[]>([]);

  const ai = useMemo(() => {
    if (GEMINI_API_KEY) {
      return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return null;
  }, []);
  
  const handleStopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const resetState = () => {
    handleStopSpeaking();
    setStage(documentChunks.length > 0 ? RagStage.PARSING_DONE : RagStage.IDLE);
    setExpandedQueries([]);
    setInitialContext([]);
    setRerankedContext([]);
    setFinalAnswer(null);
    setError(null);
  }

  const handleSpeak = useCallback((text: string) => {
      if (!('speechSynthesis' in window)) {
          console.warn("Text-to-speech is not supported in this browser.");
          setError("Text-to-speech is not supported on your browser.");
          return;
      }
      handleStopSpeaking(); // Stop any previous speech before starting new one

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e: Event) => {
          const errorEvent = e as SpeechSynthesisErrorEvent;
          console.error("An error occurred during speech synthesis:", errorEvent.error, errorEvent);
          setError(`Speech synthesis failed: ${errorEvent.error}. This can sometimes happen if the browser's speech engine is busy or unavailable.`);
          setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
  }, [handleStopSpeaking]);
  
  // Effect to automatically read the answer when it's generated
  useEffect(() => {
    if (stage === RagStage.DONE && finalAnswer?.answer) {
        handleSpeak(finalAnswer.answer);
    }
  }, [stage, finalAnswer, handleSpeak]);

  // Effect to handle cleanup on unmount
  useEffect(() => {
    return () => {
        handleStopSpeaking();
    };
  }, [handleStopSpeaking]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
    }

    setUploadedFile(file);
    setError(null);
    setDocumentChunks([]);
    resetState();
    setStage(RagStage.PARSING_DOCUMENT);


    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        }

        if (fullText.trim().length === 0) {
            setError("Could not extract any text from the PDF.");
            setUploadedFile(null);
            setStage(RagStage.ERROR);
            return;
        }

        // Improved sentence-aware chunking
        const sentences = fullText.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
        const chunks: RetrievedContext[] = [];
        const chunkSizeInWords = 150;
        let currentChunk = "";

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;

            const wordsInSentence = trimmedSentence.split(/\s+/).length;
            const wordsInChunk = currentChunk.split(/\s+/).filter(Boolean).length;

            if (wordsInChunk + wordsInSentence > chunkSizeInWords && currentChunk) {
                chunks.push({
                    id: `chunk-${chunks.length + 1}`,
                    snippet: currentChunk.trim(),
                    source: file.name
                });
                currentChunk = "";
            }
            
            currentChunk += " " + trimmedSentence;
        }

        if (currentChunk.trim()) {
            chunks.push({
                id: `chunk-${chunks.length + 1}`,
                snippet: currentChunk.trim(),
                source: file.name
            });
        }

        setDocumentChunks(chunks);
        setStage(RagStage.PARSING_DONE);
    } catch (err) {
        console.error("Error parsing PDF:", err);
        setError("Failed to parse the PDF file. It might be corrupted or in an unsupported format.");
        setUploadedFile(null);
        setStage(RagStage.ERROR);
    }
  };

  const handleQuerySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || documentChunks.length === 0) return;

    if (!ai) {
      setError("Gemini API key is not configured. Please check your environment variables.");
      setStage(RagStage.ERROR);
      return;
    }

    resetState();
    setStage(RagStage.EXPANDING_QUERY);

    try {
      // ===== Step 1: Query Expansion =====
      const expansionPrompt = `Based on the user query "${query}", generate 2 alternative queries to improve search results. The queries should be distinct and cover different angles of the original query. Return the result as a JSON array of strings.`;
      const queryExpansionSchema = { type: Type.ARRAY, items: { type: Type.STRING } };

      const expansionResult: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: expansionPrompt,
        config: { responseMimeType: "application/json", responseSchema: queryExpansionSchema },
      });

      const expandedQueryList: string[] = JSON.parse(expansionResult.text);
      const allQueries = [
        { id: 'q-original', query: query },
        ...expandedQueryList.map((q, i) => ({ id: `q-expanded-${i}`, query: q }))
      ];
      setExpandedQueries(allQueries);
      setStage(RagStage.INITIAL_RETRIEVAL);

      // ===== Step 2: Initial Keyword Retrieval =====
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const context: RetrievedContext[] = [];
      const addedDocs = new Set<string>();
      const searchTerms = allQueries.flatMap(q => q.query.toLowerCase().split(/\s+/)).filter(term => term.length > 3);
      const uniqueTerms = [...new Set(searchTerms)];

      documentChunks.forEach(doc => {
        if(uniqueTerms.some(term => doc.snippet.toLowerCase().includes(term)) && !addedDocs.has(doc.id)) {
            context.push({ id: doc.id, snippet: doc.snippet, source: doc.source });
            addedDocs.add(doc.id);
        }
      });
      
      if(context.length === 0) {
        setInitialContext([]);
        setError("Could not find any relevant information in the document for your query.");
        setStage(RagStage.ERROR);
        return;
      }

      setInitialContext(context);
      setStage(RagStage.RE_RANKING_CHUNKS);

      // ===== Step 3: Re-ranking Chunks =====
      const rerankingPrompt = `From the following document chunks, identify the IDs of the top 3 most relevant chunks for answering the query: "${query}". Return ONLY the IDs in a JSON object. Chunks are provided as a list of JSON objects.

Query: "${query}"

Chunks:
${JSON.stringify(context.map(c => ({ id: c.id, content: c.snippet })), null, 2)}
`;
      const rerankingSchema = {
          type: Type.OBJECT,
          properties: {
              relevant_chunk_ids: {
                  type: Type.ARRAY,
                  description: "IDs of the most relevant chunks, ordered by relevance.",
                  items: { type: Type.STRING }
              }
          }
      };

      const rerankingResult: GenerateContentResponse = await ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: rerankingPrompt,
          config: { responseMimeType: "application/json", responseSchema: rerankingSchema },
      });
      
      const rerankingData = JSON.parse(rerankingResult.text);
      const relevantIds = new Set(rerankingData.relevant_chunk_ids || []);
      let finalContext = context.filter(c => relevantIds.has(c.id));
      
      if (finalContext.length === 0 && context.length > 0) { // Fallback
          finalContext = context.slice(0, 3);
      }

      setRerankedContext(finalContext);
      setStage(RagStage.SYNTHESIZING_ANSWER);
      
      // ===== Step 4: Synthesize Final Answer =====
      const contextString = finalContext.map(c => `Chunk ID: ${c.id}\nContent: ${c.snippet}`).join('\n---\n');
      const finalPrompt = `You are an expert AI assistant. Your task is to synthesize a clear and concise answer to the user's query based ONLY on the provided document chunks.

**Instructions:**
1.  Analyze the following document chunks carefully.
2.  Formulate a direct answer to the user's query: "${query}".
3.  Your answer MUST be grounded in the provided context. Do not add any information from outside sources.
4.  If the context does not contain enough information to answer the query, state that clearly.
5.  Identify the specific 'Chunk IDs' that directly support your answer.
6.  Provide a confidence score (from 0.0 to 1.0) indicating how well the provided context answers the query.
7.  Return your response in a single, valid JSON object, and nothing else.

**User Query:** "${query}"

**Context Chunks:**
${contextString}
`;

      const finalAnswerSchema = {
          type: Type.OBJECT,
          properties: {
              answer: {
                  type: Type.STRING,
                  description: "The synthesized answer to the user's query, based only on the provided context."
              },
              source_chunks: {
                  type: Type.ARRAY,
                  description: "An array of Chunk IDs (e.g., ['chunk-1', 'chunk-5']) that were used to formulate the answer.",
                  items: { type: Type.STRING }
              },
              confidence: {
                  type: Type.NUMBER,
                  description: "A confidence score between 0.0 and 1.0 representing how well the context answers the query."
              }
          },
          required: ["answer", "source_chunks", "confidence"]
      };

      const finalResult: GenerateContentResponse = await ai.models.generateContent({
          model: GEMINI_MODEL_TEXT,
          contents: finalPrompt,
          config: { responseMimeType: "application/json", responseSchema: finalAnswerSchema },
      });

      const finalAnswerObject: FinalAnswerData = JSON.parse(finalResult.text);
      setFinalAnswer(finalAnswerObject);
      
      setStage(RagStage.DONE);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`An error occurred during the RAG process: ${errorMessage}`);
      setStage(RagStage.ERROR);
    }
  }, [query, ai, documentChunks, handleSpeak]);
  
  const isParsing = stage === RagStage.PARSING_DOCUMENT;
  const isQuerying = [RagStage.EXPANDING_QUERY, RagStage.INITIAL_RETRIEVAL, RagStage.RE_RANKING_CHUNKS, RagStage.SYNTHESIZING_ANSWER].includes(stage);
  const isReadyToQuery = documentChunks.length > 0 && !isParsing;

  return (
    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Interactive RAG Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Upload your own PDF to see how RAG works with your data.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Step 1: Provide a Document</h3>
        <label htmlFor="file-upload" className="relative block w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <div className="flex flex-col items-center justify-center">
                <UploadCloudIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2"/>
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {uploadedFile ? uploadedFile.name : 'Click to upload a PDF'}
                </span>
                <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Only .pdf files are supported
                </span>
            </div>
          <input id="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} disabled={isParsing} />
        </label>
        {isParsing && (
            <div className="mt-4 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <LoadingSpinner size="sm" />
            <p className="ml-2">Parsing and chunking PDF...</p>
            </div>
        )}
        {stage === RagStage.PARSING_DONE && (
            <div className="mt-4 text-center p-2 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
                <p>Successfully parsed and split the document into {documentChunks.length} chunks. You can now ask a question.</p>
            </div>
        )}
      </div>

      <div>
        <h3 className={`text-xl font-bold mb-2 ${isReadyToQuery ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>Step 2: Ask a Question</h3>
        <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-2">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isReadyToQuery ? "e.g., What is the main conclusion?" : "Please upload a document first"}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isQuerying || !isReadyToQuery}
            />
            <button
            type="submit"
            disabled={!query || isQuerying || !isReadyToQuery}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
            >
            {isQuerying ? <LoadingSpinner size="sm" className="mx-auto" /> : 'Run Pipeline'}
            </button>
            {stage !== RagStage.IDLE && stage !== RagStage.PARSING_DOCUMENT && stage !== RagStage.PARSING_DONE && (
            <button
                type="button"
                onClick={() => { resetState(); setQuery(''); }}
                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
            >
                Reset
            </button>
            )}
        </form>
      </div>


      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md animate-fade-in">
          <p><span className="font-bold">Error:</span> {error}</p>
        </div>
      )}

      {(stage !== RagStage.IDLE && stage !== RagStage.PARSING_DOCUMENT && stage !== RagStage.PARSING_DONE) && (
        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
            <StageDisplay icon={<Sparkles className="w-6 h-6 text-purple-500" />} title="Step 1: Query Expansion" isLoading={stage === RagStage.EXPANDING_QUERY} show={[RagStage.EXPANDING_QUERY, RagStage.INITIAL_RETRIEVAL, RagStage.RE_RANKING_CHUNKS, RagStage.SYNTHESIZING_ANSWER, RagStage.DONE].includes(stage)}>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">The original query is expanded to cover more possibilities.</p>
                {expandedQueries.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 animate-fade-in">
                    {expandedQueries.map((q) => <li key={q.id}>{q.query}</li>)}
                </ul>
                )}
            </StageDisplay>

            <StageDisplay icon={<Search className="w-6 h-6 text-blue-500" />} title="Step 2: Initial Keyword Retrieval" isLoading={stage === RagStage.INITIAL_RETRIEVAL} show={[RagStage.INITIAL_RETRIEVAL, RagStage.RE_RANKING_CHUNKS, RagStage.SYNTHESIZING_ANSWER, RagStage.DONE].includes(stage)} animationDelay="150ms">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{`A simple keyword search found ${initialContext.length} potentially relevant chunks.`}</p>
                {initialContext.length > 0 && (
                <div className="space-y-2 animate-fade-in max-h-40 overflow-y-auto pr-2">
                    {initialContext.map((c) => (
                    <div key={c.id} className="p-2 border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-700 rounded-r-md">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{c.source} (chunk {c.id.split('-')[1]})</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{c.snippet}</p>
                    </div>
                    ))}
                </div>
                )}
            </StageDisplay>

            <StageDisplay icon={<Star className="w-6 h-6 text-yellow-500" />} title="Step 3: Re-ranking Chunks" isLoading={stage === RagStage.RE_RANKING_CHUNKS} show={[RagStage.RE_RANKING_CHUNKS, RagStage.SYNTHESIZING_ANSWER, RagStage.DONE].includes(stage)} animationDelay="300ms">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{`Gemini re-ranked the initial chunks to find the top ${rerankedContext.length} most relevant ones.`}</p>
                {rerankedContext.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                    {rerankedContext.map((c) => (
                    <div key={c.id} className="p-2 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/50 rounded-r-md">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{c.source} (chunk {c.id.split('-')[1]})</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{c.snippet}</p>
                    </div>
                    ))}
                </div>
                )}
            </StageDisplay>

            <StageDisplay 
                icon={<Brain className="w-6 h-6 text-green-500" />} 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>Step 4: Answer Synthesis & Analysis</span>
                        {finalAnswer && (
                            <button
                                onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(finalAnswer.answer)}
                                className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-4"
                                aria-label={isSpeaking ? "Stop reading" : "Read answer aloud"}
                            >
                                {isSpeaking ? <SpeakerMuteIcon className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                }
                isLoading={stage === RagStage.SYNTHESIZING_ANSWER} 
                show={[RagStage.SYNTHESIZING_ANSWER, RagStage.DONE].includes(stage)} 
                animationDelay="450ms"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Gemini synthesizes the final answer, citing sources and providing a confidence score.</p>
                {finalAnswer && (
                  <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/50 rounded-md text-gray-800 dark:text-gray-200 animate-fade-in">
                    <p className="whitespace-pre-wrap">{finalAnswer.answer}</p>
                    
                    <div className="mt-4 border-t border-green-200 dark:border-green-800 pt-3">
                      <div className="flex items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Confidence:</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${finalAnswer.confidence * 100}%` }}>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 ml-3">
                          {Math.round(finalAnswer.confidence * 100)}%
                        </span>
                      </div>
              
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sources:</p>
                        {finalAnswer.source_chunks.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {finalAnswer.source_chunks.map(chunkId => (
                              <span key={chunkId} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs font-medium rounded-full text-gray-600 dark:text-gray-300">
                                {chunkId}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No specific sources cited.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </StageDisplay>
        </div>
        )}
    </section>
  );
};

export default InteractiveRagDemo;