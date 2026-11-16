import React from "react";
import ReactMarkdown from "react-markdown";
import { ResearchResult, ResearchParams } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Download, FileText, Image as ImageIcon, Link as LinkIcon, Send, ShieldCheck, Star, Tag, Languages } from "lucide-react";
import { exportToWord } from "../services/wordService";
import { motion } from "motion/react";

interface ResearchPreviewProps {
  result: ResearchResult;
  params: ResearchParams;
  onRefine: (feedback: string, overrideParams?: Partial<ResearchParams>) => void;
  isRefining: boolean;
}

export function ResearchPreview({ result, params, onRefine, isRefining }: ResearchPreviewProps) {
  const [feedback, setFeedback] = React.useState("");

  const handleRefine = () => {
    if (feedback.trim()) {
      onRefine(feedback);
      setFeedback("");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-wrap justify-between items-center sticky top-4 z-10 bg-stone-50/80 backdrop-blur-md p-4 rounded-xl border border-stone-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold font-serif truncate max-w-[300px]">{params.title}</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1">
            <ShieldCheck className="w-3 h-3" />
            بشري: {result.humanScore}%
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex gap-1">
            <Star className="w-3 h-3" />
            التقييم: {result.evaluation?.grade || "N/A"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const nextLanguage = params.language === "ar" ? "en" : "ar";
              onRefine(
                `Translate the entire research, including title, abstract, content, keywords, and evaluation feedback, to ${
                  nextLanguage === "en" ? "English" : "Arabic"
                }`,
                { language: nextLanguage }
              );
            }}
            disabled={isRefining}
            className="gap-2"
          >
            <Languages className="w-4 h-4" />
            {params.language === "ar" ? "ترجمة للإنجليزية" : "Translate to Arabic"}
          </Button>
          <Button
            onClick={() => exportToWord(result, params)}
            className="bg-green-700 hover:bg-green-800 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Word
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="border-stone-200 shadow-sm bg-white">
            <CardHeader className="border-b border-stone-100">
              <CardTitle className="text-lg font-serif">ملخص البحث (Abstract)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 italic text-stone-600 leading-relaxed">
              {result.abstract}
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-8 md:p-12">
              <div
                className="markdown-body"
                dir={params.language === "ar" ? "rtl" : "ltr"}
              >
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm bg-stone-900 text-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Send className="w-5 h-5" />
                تعديل أو تحسين البحث
              </h3>
              <p className="text-sm text-stone-400">أدخل ملاحظاتك أو التعديلات التي ترغب في إجرائها على البحث وسيقوم الذكاء الاصطناعي بإعادة صياغته.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="مثال: أضف فقرة عن كذا، أو غير أسلوب الكتابة ليكون أكثر أكاديمية..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                />
                <Button 
                  onClick={handleRefine} 
                  disabled={isRefining || !feedback.trim()}
                  className="bg-white text-stone-900 hover:bg-stone-200"
                >
                  {isRefining ? "جاري التعديل..." : "تعديل"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold font-serif">
              <Tag className="w-5 h-5 text-stone-500" />
              الكلمات المفتاحية
            </h3>
            <div className="flex flex-wrap gap-2">
              {(result.keywords || []).map((kw, idx) => (
                <Badge key={idx} variant="secondary" className="bg-stone-200 text-stone-700">
                  {kw}
                </Badge>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold font-serif">
              <ImageIcon className="w-5 h-5 text-stone-500" />
              الرسوم التوضيحية
            </h3>
            <div className="space-y-4">
              {(result.images || []).map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-lg overflow-hidden border border-stone-200 bg-white"
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full aspect-video object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-3 space-y-2">
                    <p className="font-bold text-sm">{img.caption}</p>
                    <p className="text-xs text-stone-500 leading-tight">{img.explanation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold font-serif">
              <Star className="w-5 h-5 text-stone-500" />
              التقييم الأكاديمي
            </h3>
            <Card className="border-stone-200 shadow-sm bg-white">
              <CardContent className="p-4 space-y-2">
                <div className="text-3xl font-bold text-stone-900">{result.evaluation?.grade || "N/A"}</div>
                <p className="text-xs text-stone-500 leading-relaxed">{result.evaluation?.feedback || "لا يوجد تقييم متاح حالياً."}</p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold font-serif">
              <LinkIcon className="w-5 h-5 text-stone-500" />
              المراجع ({(result.references || []).length})
            </h3>
            <Card className="border-stone-200 shadow-sm bg-white">
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {(result.references || []).map((ref, idx) => (
                    <li key={idx} className="text-xs text-stone-700 flex gap-2">
                      <span className="text-stone-400 font-mono">[{idx + 1}]</span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
