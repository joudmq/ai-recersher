import React from "react";
import { ResearchParams } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { 
  BookOpen, User, Building, FileText, Hash, Settings2, 
  Languages, Type, Ruler, ListOrdered, AlignLeft, 
  CheckCircle2, Info, Layout, PenTool
} from "lucide-react";

interface ResearchFormProps {
  onSubmit: (params: ResearchParams) => void;
  isLoading: boolean;
}

const LANGUAGE_ITEMS = [
  { value: "ar", label: "العربية (الأصيلة)" },
  { value: "en", label: "English (Academic)" },
];

const FONT_ITEMS = [
  { value: "Amiri", label: "Amiri (أكاديمي تقليدي)" },
  { value: "Arial", label: "Arial (عصري)" },
  { value: "Times New Roman", label: "Times New Roman (كلاسيكي)" },
];

const CITATION_ITEMS = [
  { value: "APA", label: "APA (الجمعية الأمريكية لعلم النفس)" },
  { value: "MLA", label: "MLA (جمعية اللغات الحديثة)" },
  { value: "Chicago", label: "Chicago (شيكاغو)" },
  { value: "Harvard", label: "Harvard (هارفارد)" },
];

export function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const [activeTab, setActiveTab] = React.useState("identity");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [params, setParams] = React.useState<ResearchParams>({
    title: "",
    researcherName: "",
    recipient: "",
    wordCount: 1000,
    pageCount: 4,
    formattingStyle: "APA",
    language: "ar",
    minReferences: 5,
    maxReferences: 15,
    fontType: "Amiri",
    fontSize: 14,
    lineSpacing: 1.5,
    abstract: "",
    recommendations: "",
    conclusions: "",
    additionalNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.title.trim() || !params.researcherName.trim() || !params.recipient.trim()) {
      setActiveTab("identity");
      setValidationError("يرجى إكمال الحقول الأساسية في تبويب هوية البحث (العنوان، اسم الباحث، الجهة).");
      return;
    }
    setValidationError(null);
    const normalizedMinRefs = Math.max(1, params.minReferences || 1);
    const normalizedMaxRefs = Math.max(normalizedMinRefs, params.maxReferences || normalizedMinRefs);
    onSubmit({
      ...params,
      title: params.title.trim(),
      researcherName: params.researcherName.trim(),
      recipient: params.recipient.trim(),
      wordCount: Math.max(100, params.wordCount || 1000),
      pageCount: Math.max(1, params.pageCount || 1),
      minReferences: normalizedMinRefs,
      maxReferences: normalizedMaxRefs,
      fontSize: Math.min(36, Math.max(8, params.fontSize || 14)),
      lineSpacing: Math.min(3, Math.max(1, params.lineSpacing || 1.5)),
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-stone-200 shadow-lg bg-white/50 backdrop-blur-sm">
      <CardHeader className="text-center border-b border-stone-100 pb-8">
        <div className="mx-auto bg-stone-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <PenTool className="text-white w-6 h-6" />
        </div>
        <CardTitle className="text-3xl font-bold font-serif text-stone-900">بناء البحث الأكاديمي</CardTitle>
        <CardDescription className="text-stone-500 text-lg">قم بتحديد معايير البحث بدقة لضمان أفضل نتيجة بشرية</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {validationError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
              {validationError}
            </div>
          )}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            orientation="vertical"
            className="flex flex-col md:flex-row-reverse gap-8"
          >
            <TabsList className="flex flex-col h-auto p-1.5 bg-stone-100/70 rounded-2xl w-full md:w-64 shrink-0 md:sticky md:top-4">
              <TabsTrigger
                value="identity"
                className="group w-full justify-start py-4 px-5 flex items-center gap-3 rounded-xl transition-all data-active:bg-white data-active:shadow-md data-active:text-stone-900 text-stone-500"
              >
                <div className="bg-stone-200 p-1.5 rounded-lg transition-colors group-data-active:bg-stone-900 group-data-active:text-white">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-bold">هوية البحث</span>
              </TabsTrigger>
              <TabsTrigger
                value="quantity"
                className="group w-full justify-start py-4 px-5 flex items-center gap-3 rounded-xl transition-all data-active:bg-white data-active:shadow-md data-active:text-stone-900 text-stone-500"
              >
                <div className="bg-stone-200 p-1.5 rounded-lg transition-colors group-data-active:bg-stone-900 group-data-active:text-white">
                  <Hash className="w-4 h-4" />
                </div>
                <span className="font-bold">المعايير الكمية</span>
              </TabsTrigger>
              <TabsTrigger
                value="structure"
                className="group w-full justify-start py-4 px-5 flex items-center gap-3 rounded-xl transition-all data-active:bg-white data-active:shadow-md data-active:text-stone-900 text-stone-500"
              >
                <div className="bg-stone-200 p-1.5 rounded-lg transition-colors group-data-active:bg-stone-900 group-data-active:text-white">
                  <Layout className="w-4 h-4" />
                </div>
                <span className="font-bold">الهيكل الأكاديمي</span>
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="group w-full justify-start py-4 px-5 flex items-center gap-3 rounded-xl transition-all data-active:bg-white data-active:shadow-md data-active:text-stone-900 text-stone-500"
              >
                <div className="bg-stone-200 p-1.5 rounded-lg transition-colors group-data-active:bg-stone-900 group-data-active:text-white">
                  <Settings2 className="w-4 h-4" />
                </div>
                <span className="font-bold">التنسيق الفني</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 bg-white/80 p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm min-h-[500px]">
              {/* Tab 1: Identity */}
              <TabsContent value="identity" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                    <User className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif">هوية البحث</h3>
                    <p className="text-sm text-stone-400">المعلومات الأساسية التي ستظهر على غلاف البحث</p>
                  </div>
                </div>
                <Separator className="bg-stone-50" />
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-stone-700 font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-stone-400" />
                      عنوان البحث الرئيسي
                    </Label>
                    <Input
                      id="title"
                      placeholder="أدخل عنوان البحث بدقة..."
                      className="h-14 border-stone-200 focus:ring-stone-500 text-lg rounded-xl"
                      value={params.title}
                      onChange={(e) => setParams({ ...params, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="researcherName" className="text-stone-700 font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-stone-400" />
                        اسم الباحث الكامل
                      </Label>
                      <Input
                        id="researcherName"
                        placeholder="الاسم الكامل..."
                        className="h-12 border-stone-200 focus:ring-stone-500 rounded-xl"
                        value={params.researcherName}
                        onChange={(e) => setParams({ ...params, researcherName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="recipient" className="text-stone-700 font-bold flex items-center gap-2">
                        <Building className="w-4 h-4 text-stone-400" />
                        الجهة المقدم إليها
                      </Label>
                      <Input
                        id="recipient"
                        placeholder="الجامعة أو المؤسسة..."
                        className="h-12 border-stone-200 focus:ring-stone-500 rounded-xl"
                        value={params.recipient}
                        onChange={(e) => setParams({ ...params, recipient: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-stone-700 font-bold flex items-center gap-2">
                      <Languages className="w-4 h-4 text-stone-400" />
                      لغة الكتابة الأساسية
                    </Label>
                    <Select
                      items={LANGUAGE_ITEMS}
                      value={params.language}
                      onValueChange={(v) => {
                        if (v === "ar" || v === "en") {
                          setParams({ ...params, language: v });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-12 border-stone-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Quantity */}
              <TabsContent value="quantity" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                    <Hash className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif">المعايير الكمية</h3>
                    <p className="text-sm text-stone-400">تحديد حجم البحث وعدد المراجع العلمية</p>
                  </div>
                </div>
                <Separator className="bg-stone-50" />
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <Hash className="w-5 h-5 text-stone-400" />
                      حجم المحتوى المستهدف
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm text-stone-600">عدد الكلمات التقريبي</Label>
                        <Input
                          type="number"
                          min={100}
                          value={params.wordCount}
                          onChange={(e) => setParams({ ...params, wordCount: parseInt(e.target.value, 10) || 0 })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-stone-600">عدد الصفحات المتوقع</Label>
                        <Input
                          type="number"
                          min={1}
                          value={params.pageCount}
                          onChange={(e) => setParams({ ...params, pageCount: parseInt(e.target.value, 10) || 0 })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <ListOrdered className="w-5 h-5 text-stone-400" />
                      المراجع العلمية المطلوبة
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm text-stone-600">الحد الأدنى للمراجع</Label>
                        <Input
                          type="number"
                          min={1}
                          value={params.minReferences}
                          onChange={(e) => setParams({ ...params, minReferences: parseInt(e.target.value, 10) || 0 })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-stone-600">الحد الأقصى للمراجع</Label>
                        <Input
                          type="number"
                          min={1}
                          value={params.maxReferences}
                          onChange={(e) => setParams({ ...params, maxReferences: parseInt(e.target.value, 10) || 0 })}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 p-5 rounded-2xl flex items-start gap-4 border border-stone-100 mt-8">
                  <Info className="w-6 h-6 text-stone-400 mt-0.5" />
                  <p className="text-sm text-stone-600 leading-relaxed">
                    سيقوم النظام بتوزيع المحتوى بشكل متوازن على عدد الصفحات المطلوبة مع ضمان كثافة بحثية مناسبة لكل قسم وفقاً للمعايير الأكاديمية العالمية.
                  </p>
                </div>
              </TabsContent>

              {/* Tab 3: Structure */}
              <TabsContent value="structure" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                    <Layout className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif">الهيكل الأكاديمي</h3>
                    <p className="text-sm text-stone-400">تخصيص محتوى الملخص والنتائج والتوصيات</p>
                  </div>
                </div>
                <Separator className="bg-stone-50" />
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-bold flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-stone-400" />
                      الملخص (Abstract)
                    </Label>
                    <Textarea
                      placeholder="اتركه فارغاً ليقوم النظام بكتابته بناءً على العنوان، أو أدخل ملخصك الخاص..."
                      className="min-h-[120px] border-stone-200 rounded-xl p-4 leading-relaxed"
                      value={params.abstract}
                      onChange={(e) => setParams({ ...params, abstract: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">الاستنتاجات والتوصيات</Label>
                    <Textarea
                      placeholder="ما هي النتائج التي ترغب في الوصول إليها؟"
                      className="min-h-[100px] border-stone-200 rounded-xl p-4"
                      value={params.conclusions}
                      onChange={(e) => setParams({ ...params, conclusions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">ملاحظات وتوجيهات إضافية</Label>
                    <Textarea
                      placeholder="أي تفاصيل أخرى تود إضافتها للبحث..."
                      className="min-h-[100px] border-stone-200 rounded-xl p-4"
                      value={params.additionalNotes}
                      onChange={(e) => setParams({ ...params, additionalNotes: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Style */}
              <TabsContent value="style" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                    <Settings2 className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif">التنسيق الفني</h3>
                    <p className="text-sm text-stone-400">إعدادات الخط والمسافات وأسلوب التوثيق</p>
                  </div>
                </div>
                <Separator className="bg-stone-50" />
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                      <Type className="w-4 h-4 text-stone-400" />
                      نوع الخط الأكاديمي
                    </Label>
                    <Select
                      items={FONT_ITEMS}
                      value={params.fontType}
                      onValueChange={(v) => {
                        if (v) setParams({ ...params, fontType: v });
                      }}
                    >
                      <SelectTrigger className="w-full h-12 border-stone-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-stone-400" />
                      إعدادات الخط والمسافات
                    </Label>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="relative">
                        <Input
                          type="number"
                          min={8}
                          max={36}
                          value={params.fontSize}
                          onChange={(e) => setParams({ ...params, fontSize: parseInt(e.target.value, 10) || 12 })}
                          className="h-12 pr-12 rounded-xl"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">حجم</span>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1}
                          max={3}
                          step="0.1"
                          value={params.lineSpacing}
                          onChange={(e) => setParams({ ...params, lineSpacing: parseFloat(e.target.value) || 1 })}
                          className="h-12 pr-12 rounded-xl"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">مسافة</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-stone-400" />
                      أسلوب التوثيق (Citation Style)
                    </Label>
                    <Select
                      items={CITATION_ITEMS}
                      value={params.formattingStyle}
                      onValueChange={(v) => {
                        if (v) setParams({ ...params, formattingStyle: v });
                      }}
                    >
                      <SelectTrigger className="w-full h-12 border-stone-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CITATION_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 text-green-600 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span className="text-sm font-medium">تنسيق متوافق تماماً مع معايير Microsoft Word الأكاديمية</span>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <Separator className="bg-stone-100" />

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-2/3 bg-stone-900 hover:bg-stone-800 text-white py-8 text-xl font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري بناء البحث...
                </div>
              ) : (
                "إنشاء البحث الأكاديمي الآن"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
