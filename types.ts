export interface ResearchParams {
  title: string;
  researcherName: string;
  recipient: string;
  wordCount: number;
  pageCount: number;
  formattingStyle: string;
  language: "ar" | "en";
  minReferences: number;
  maxReferences: number;
  fontType: string;
  fontSize: number;
  lineSpacing: number;
  abstract: string;
  recommendations: string;
  conclusions: string;
  additionalNotes: string;
}

export interface ResearchResult {
  content: string;
  abstract: string;
  keywords: string[];
  references: string[];
  images: { url: string; caption: string; explanation: string }[];
  humanScore: number;
  evaluation: {
    grade: string;
    feedback: string;
  };
}
