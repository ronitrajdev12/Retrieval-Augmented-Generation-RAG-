// FIX: Introduced a new SubsectionData interface for subsections which do not have icons,
// and updated InfoSectionData to use it. This resolves the type error in constants.ts.
export interface SubsectionData {
  title: string;
  content: string | string[];
}

export interface InfoSectionData {
  title: string;
  content: string | string[];
  subsections?: SubsectionData[];
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
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
  PARSING_DOCUMENT = "PARSING_DOCUMENT",
  PARSING_DONE = "PARSING_DONE",
  EXPANDING_QUERY = "EXPANDING_QUERY",
  INITIAL_RETRIEVAL = "INITIAL_RETRIEVAL",
  RE_RANKING_CHUNKS = "RE_RANKING_CHUNKS",
  SYNTHESIZING_ANSWER = "SYNTHESIZING_ANSWER",
  DONE = "DONE",
  ERROR = "ERROR"
}

export interface FinalAnswerData {
  answer: string;
  source_chunks: string[];
  confidence: number;
}


export interface GeminiApiResponseError {
  message: string;
  // Add other relevant fields if the API returns a structured error
}