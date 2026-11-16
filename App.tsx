import React from "react";
import { ResearchForm } from "./components/ResearchForm";
import { ResearchPreview } from "./components/ResearchPreview";
import { ResearchParams, ResearchResult } from "./types";
import { generateResearch } from "./services/geminiService";
import { GraduationCap, Sparkles, History, ShieldCheck, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  const [activeTab, setActiveTab] = React.useState("create");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ResearchResult | null>(null);
  const [currentParams, setCurrentParams] = React.useState<ResearchParams | null>(null);
  const [history, setHistory] = React.useState<{ params: ResearchParams; result: ResearchResult }[]>([]);

  const quotes = [
    "العلم صيد والكتابة قيده..",
    "خير جليس في الزمان كتاب..",
    "اطلبوا العلم من المهد إلى اللحد..",
    "العلم يبني بيوتاً لا عماد لها..",
    "من لم يذق مر التعلم ساعة، تجرع ذل الجهل طول حياته.."
  ];
  const [quoteIdx, setQuoteIdx] = React.useState(0);

  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setQuoteIdx((prev) => (prev + 1) % quotes.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleGenerate = async (params: ResearchParams) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentParams(params);
    try {
      const data = await generateResearch(params);
      setResult(data);
      setHistory((prev) => [{ params, result: data }, ...prev].slice(0, 5));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "حدث خطأ أثناء إنشاء البحث. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (feedback: string, overrideParams?: Partial<ResearchParams>) => {
    if (!currentParams || !result) return;
    const nextParams = overrideParams ? { ...currentParams, ...overrideParams } : currentParams;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateResearch(nextParams, result, feedback);
      setCurrentParams(nextParams);
      setResult(data);
      setHistory((prev) => [{ params: nextParams, result: data }, ...prev].slice(0, 5));
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "حدث خطأ أثناء تعديل البحث. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-16 h-16 border-4 border-stone-400 border-t-white rounded-full animate-spin mb-8"></div>
          <motion.p
            key={quoteIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-serif italic max-w-md"
          >
            "{quotes[quoteIdx]}"
          </motion.p>
          <p className="mt-4 text-stone-400 animate-pulse">جاري صياغة البحث بأسلوب بشري فريد...</p>
        </div>
      )}
      <header className="bg-white border-b border-stone-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-stone-900 p-2 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif tracking-tight">باحث الذكاء الاصطناعي Pro</h1>
              <p className="text-sm text-stone-500">أبحاث بشرية 100% مع توثيق أكاديمي متكامل</p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
            <div className="flex items-center gap-1 text-green-600">
              <ShieldCheck className="w-4 h-4" />
              آمن أكاديمياً
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <Sparkles className="w-4 h-4" />
              Gemini 4
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div
              role="alert"
              className="mb-8 max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed font-medium">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="إغلاق التنبيه"
                className="text-red-500 hover:text-red-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="space-y-12">
            <div className="flex justify-center">
              <TabsList className="bg-stone-200/50 p-1">
                <TabsTrigger value="create" className="px-8">إنشاء بحث جديد</TabsTrigger>
                <TabsTrigger value="history" className="px-8 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  السجل
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="create" className="space-y-12">
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ResearchForm onSubmit={handleGenerate} isLoading={isLoading} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex justify-center mb-8">
                      <button
                        onClick={() => setResult(null)}
                        className="text-stone-500 hover:text-stone-900 flex items-center gap-2 text-sm font-medium"
                      >
                        ← العودة لتعديل البيانات الأساسية
                      </button>
                    </div>
                    <ResearchPreview 
                      result={result} 
                      params={currentParams!} 
                      onRefine={handleRefine}
                      isRefining={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="history">
              <div className="max-w-2xl mx-auto space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-stone-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>لا يوجد أبحاث سابقة في هذا السجل</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg border border-stone-200 flex justify-between items-center hover:border-stone-400 transition-colors cursor-pointer"
                      onClick={() => {
                        setResult(item.result);
                        setCurrentParams(item.params);
                        setActiveTab("create");
                      }}
                    >
                      <div>
                        <h3 className="font-bold font-serif">{item.params.title}</h3>
                        <p className="text-xs text-stone-500">{item.params.researcherName} • {item.params.formattingStyle}</p>
                      </div>
                      <span className="text-xs text-stone-400">عرض البحث</span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="w-6 h-6" />
              <span className="font-bold font-serif">باحث الذكاء الاصطناعي</span>
            </div>
            <p className="text-sm leading-relaxed">
              منصة متطورة تهدف إلى مساعدة الطلاب والباحثين في صياغة أبحاثهم العلمية بدقة واحترافية عالية باستخدام أحدث تقنيات الذكاء الاصطناعي.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">مزايا المنصة</h4>
            <ul className="space-y-2 text-sm">
              <li>توثيق أكاديمي (APA / MLA / Chicago / Harvard)</li>
              <li>تصدير فوري بصيغة Microsoft Word</li>
              <li>دعم كامل للغة العربية والإنجليزية</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">تنبيه قانوني</h4>
            <p className="text-xs leading-relaxed">
              هذا البرنامج أداة مساعدة للبحث العلمي. يجب على المستخدم مراجعة المحتوى والتأكد من دقته العلمية قبل الاعتماد النهائي. نحن غير مسؤولين عن أي سوء استخدام أكاديمي.
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-stone-800 text-center text-xs">
          جميع الحقوق محفوظة © {new Date().getFullYear()} باحث الذكاء الاصطناعي
        </div>
      </footer>
    </div>
  );
}

