import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseGeminiError(error: unknown): { status: number; code: string; message: string } {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const statusMatch =
    (typeof error === "object" && error !== null && "status" in error && typeof (error as { status: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined) ??
    (rawMessage.includes("403") || rawMessage.includes("PERMISSION_DENIED")
      ? 403
      : rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED")
        ? 429
        : rawMessage.includes("404") || rawMessage.includes("NOT_FOUND")
          ? 404
          : rawMessage.includes("400") || rawMessage.includes("API_KEY_INVALID")
            ? 400
            : 500);

  if (statusMatch === 403 || rawMessage.includes("PERMISSION_DENIED")) {
    return {
      status: 403,
      code: "PERMISSION_DENIED",
      message:
        "تعذر الوصول إلى Gemini API باستخدام المفتاح الحالي (403). يرجى التحقق من مفتاح API أو تفعيل الفوترة للمشروع في لوحة Settings > Secrets.",
    };
  }
  if (statusMatch === 400 && rawMessage.includes("API_KEY_INVALID")) {
    return {
      status: 400,
      code: "API_KEY_INVALID",
      message: "مفتاح Gemini API غير صالح. يرجى التحقق من المفتاح في لوحة Settings > Secrets.",
    };
  }
  if (statusMatch === 429 || rawMessage.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      code: "RESOURCE_EXHAUSTED",
      message: "تم تجاوز حد الاستخدام المسموح حالياً. يرجى المحاولة لاحقاً أو اختيار مفتاح مدفوع في Settings > Secrets.",
    };
  }
  if (statusMatch === 404 || rawMessage.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "MODEL_NOT_FOUND",
      message: "النموذج المطلوب غير متاح حالياً.",
    };
  }

  return {
    status: 500,
    code: "GENERATION_FAILED",
    message: "حدث خطأ أثناء إنشاء البحث. يرجى المحاولة مرة أخرى.",
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.post("/api/research/generate", async (req, res) => {
    const { params, previousResult, feedback } = req.body ?? {};
    if (!params || !params.title || !params.researcherName || !params.recipient) {
      res.status(400).json({
        error: "يرجى إدخال عنوان البحث واسم الباحث والجهة المقدم إليها.",
        code: "INVALID_INPUT",
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error: "مفتاح Gemini API غير مهيأ. يرجى التحقق من إعداده في لوحة Settings > Secrets.",
        code: "MISSING_API_KEY",
      });
      return;
    }

    const systemInstruction = `
      أنت باحث أكاديمي محترف وخبير في الكتابة البشرية الإبداعية.
      مهمتك هي كتابة بحث أكاديمي يتجنب تماماً كاشفات الذكاء الاصطناعي (AI Detectors) من خلال:
      1. استخدام تراكيب جمل متنوعة (Perplexity).
      2. تنويع طول الجمل وتدفقها (Burstiness).
      3. استخدام تعبيرات بشرية طبيعية ومصطلحات تخصصية دقيقة.
      4. تجنب التكرار النمطي الذي يميز النماذج اللغوية.

      يجب أن يكون البحث باللغة: ${params.language === "ar" ? "العربية" : "الإنجليزية"}.
    `;

    const prompt = `
      ${
        feedback && previousResult
          ? `هذا تعديل على البحث السابق بناءً على الملاحظات التالية: ${feedback}

      البحث السابق:
      الملخص: ${previousResult.abstract || ""}
      المحتوى:
      ${previousResult.content || ""}`
          : "قم بإنشاء بحث جديد"
      }

      المعطيات:
      - العنوان: ${params.title}
      - الباحث: ${params.researcherName}
      - الجهة: ${params.recipient}
      - عدد الكلمات: ${params.wordCount} (ما يعادل ${params.pageCount} صفحة تقريباً)
      - التنسيق: ${params.formattingStyle}
      - عدد المراجع: من ${params.minReferences} إلى ${params.maxReferences}
      - ملخص مسبق (Abstract): ${params.abstract || ""}
      - توصيات مسبقة: ${params.recommendations || ""}
      - استنتاجات مسبقة: ${params.conclusions || ""}
      - ملاحظات إضافية: ${params.additionalNotes || ""}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              abstract: { type: Type.STRING, description: "ملخص البحث الاحترافي" },
              content: {
                type: Type.STRING,
                description: "نص البحث كاملاً بتنسيق Markdown مع مراعاة الفصول والمقدمة والخاتمة والتوصيات",
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "الكلمات المفتاحية للبحث",
              },
              references: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "قائمة المراجع الموثقة وفق أسلوب التوثيق المطلوب",
              },
              images: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    caption: { type: Type.STRING, description: "عنوان الرسم التوضيحي" },
                    explanation: {
                      type: Type.STRING,
                      description: "شرح مفصل لما يجب أن يحتويه الرسم التوضيحي من بيانات ورسوم",
                    },
                  },
                  required: ["caption", "explanation"],
                },
              },
              humanScore: {
                type: Type.NUMBER,
                description: "نسبة الكتابة البشرية المتوقعة من 0 إلى 100",
              },
              evaluation: {
                type: Type.OBJECT,
                properties: {
                  grade: { type: Type.STRING, description: "التقدير الأكاديمي مثل A+" },
                  feedback: { type: Type.STRING, description: "تقييم أكاديمي للبحث ونقاط القوة" },
                },
                required: ["grade", "feedback"],
              },
            },
            required: ["abstract", "content", "keywords", "references", "images", "humanScore", "evaluation"],
          },
        },
      });

      const text = (response.text ?? "{}").trim();
      const parsed = JSON.parse(text);

      const enhancedImages = (parsed.images || []).map(
        (img: { caption?: string; explanation?: string }, index: number) => ({
          url: `https://picsum.photos/seed/${encodeURIComponent(params.title + index + "diagram")}/800/450?grayscale&blur=1`,
          caption: img.caption || "",
          explanation: img.explanation || "",
        })
      );

      res.json({
        abstract: parsed.abstract || "",
        content: parsed.content || "",
        keywords: parsed.keywords || [],
        references: parsed.references || [],
        humanScore: parsed.humanScore || 0,
        evaluation: parsed.evaluation || { grade: "N/A", feedback: "لم يتم توليد تقييم." },
        images: enhancedImages,
      });
    } catch (error) {
      console.error("Error generating research:", error);
      const parsedError = parseGeminiError(error);
      res.status(parsedError.status).json({
        error: parsedError.message,
        code: parsedError.code,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
