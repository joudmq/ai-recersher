import { ResearchParams, ResearchResult } from "../types";

export async function generateResearch(
  params: ResearchParams,
  previousResult?: ResearchResult,
  feedback?: string
): Promise<ResearchResult> {
  const response = await fetch("/api/research/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params, previousResult, feedback }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : "حدث خطأ أثناء إنشاء البحث. يرجى المحاولة مرة أخرى.";
    throw new Error(message);
  }

  return data as ResearchResult;
}
