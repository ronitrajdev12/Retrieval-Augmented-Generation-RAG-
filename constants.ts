
import { InfoSectionData } from './types';

export const ragInfoSections: InfoSectionData[] = [
  {
    title: "What is RAG?",
    content: "Retrieval-Augmented Generation (RAG) is a hybrid approach that combines the power of pre-trained LLMs with real-time information retrieval from external sources like vector databases, PDFs, or websites. It enables models to generate more accurate, up-to-date, and context-aware responses.",
  },
  {
    title: "How Does RAG Work?",
    content: "RAG typically has three components:",
    subsections: [
      { title: "1. User Query", content: "The question from the user." },
      { title: "2. Retriever", content: "Searches relevant documents using embeddings and vector similarity." },
      { title: "3. Generator (LLM)", content: "Generates an answer based on the query and retrieved content." },
    ],
  },
  {
    title: "Tech Stack (Common Tools Used)",
    content: [
      "Embedding Model: OpenAI Embeddings, HuggingFace Transformers",
      "Vector DB: FAISS, Pinecone, Weaviate, Chroma, Qdrant",
      "LLM: GPT-4, Claude, Mistral, LLaMA, Google Gemini",
      "Frameworks: LangChain, LlamaIndex, Haystack",
      "Frontend: Streamlit, ReactJS, Next.js",
    ],
  },
  {
    title: "Popular Use Cases of RAG",
    content: [
      "Legal Assistants: Query legal documents and case files.",
      "Medical Research: Access up-to-date medical literature and studies.",
      "Enterprise Knowledge Assistants: Answer employee queries using internal documentation.",
      "Educational Tools: Support for thesis, coursework, and study materials.",
      "Customer Support: Real-time support using manuals and knowledge bases.",
    ],
  },
  {
    title: "Why Use RAG Instead of Fine-Tuning?",
    content: [
      "Cost: RAG is cheaper than fine-tuning.",
      "Flexibility: Easily update knowledge base without retraining.",
      "Real-Time Updates: Supported by updating vector DB.",
      "Hallucination Control: RAG provides grounded answers.",
    ],
  },
  {
    title: "Example: End-to-End RAG Workflow",
    content: [
        "1. User Query: \"Summarize the company's leave policy.\"",
        "2. Embedding: Convert the query into a vector.",
        "3. Search DB: Retrieve relevant chunks from company policy.",
        "4. Input to LLM (e.g., GPT-4): Combine query + context.",
        "5. Output: LLM generates a fact-based response.",
    ]
  },
  {
    title: "Advanced RAG Features",
    content: [
        "Smart document chunking strategies.",
        "Multi-turn conversation memory.",
        "Ranking retrieved content using scoring methods (e.g., cross-encoder rerankers).",
        "Hybrid Search: Combine keyword + semantic search.",
    ]
  },
  {
    title: "Key Considerations for RAG Implementation",
    content: [
        "Document Processing: Hierarchical chunking (e.g., 256-token chunks with 15% overlap), metadata preservation (source, section, page).",
        "Enhanced Retrieval: Ensemble retriever (vector + keyword), cross-encoder rerankers, score thresholding (e.g., min 0.65 similarity).",
        "Generation Guardrails: Strict context adherence, ability to say \"I don't know\" for low-confidence answers, source citations in responses.",
        "Evaluation Metrics: Retrieval precision (@k), answer accuracy, hallucination rate, latency.",
    ]
  },
  {
    title: "Final Thoughts",
    content: "RAG is a foundational pattern for building intelligent, accurate, and grounded LLM-powered systems across domains like healthcare, law, research, and business automation.",
  }
];

export const GEMINI_API_KEY = process.env.API_KEY;
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
