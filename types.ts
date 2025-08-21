
export interface InfoSectionData {
  title: string;
  content: string | string[];
  subsections?: InfoSectionData[];
}

export interface ExpandedQuery {
  id: string;
  query: string;
}

export interface RetrievedContext {
  id: string;
  snippet: string;
  source: string;
}

export enum RagStage {
  IDLE = "IDLE",
  EXPANDING_QUERY = "EXPANDING_QUERY",
  SIMULATING_RETRIEVAL = "SIMULATING_RETRIEVAL",
  GENERATING_ANSWER = "GENERATING_ANSWER",
  DONE = "DONE",
  ERROR = "ERROR"
}

export interface GeminiApiResponseError {
  message: string;
  // Add other relevant fields if the API returns a structured error
}
