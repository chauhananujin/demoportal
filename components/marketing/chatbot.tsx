"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ── Types ───────────────────────────────────────────────── */

type Lang = "en" | "ar";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: Date;
  dir: "ltr" | "rtl";
  suggestions?: string[];
}

/* ── Knowledge base ──────────────────────────────────────── */

const KB = {
  en: {
    greeting: "Hi! Welcome to Ascelios. We specialize in SAP, Cloud, and DevOps managed services for enterprises across the region. How can I help you today?",
    suggestions: ["SAP services", "Cloud services", "DevOps", "How to get started"],

    sap: "**Ascelios SAP Managed Services** covers the full SAP lifecycle:\n\n• **S/4HANA migration & implementation** — Greenfield or brownfield from ECC\n• **Basis operations** — 24/7 system administration, transport management, patching\n• **HANA database management** — Backup, performance tuning, high-availability\n• **Application support** — FI/CO, Supply Chain, SD, MM, PP modules\n• **Cloud hosting** — SAP-certified infrastructure on AWS and Azure\n\nOur certified consultants bring deep regional knowledge and global best practices.",

    cloud: "**Ascelios Cloud Operations** modernises enterprise infrastructure:\n\n• **Cloud migration** — Structured 6-phase journey from assessment to steady state\n• **Multi-cloud management** — AWS, Azure, and GCP under one pane of glass\n• **Infrastructure as Code** — Terraform, Ansible, and GitOps pipelines\n• **FinOps** — Cost visibility, rightsizing, and savings recommendations\n• **Security & compliance** — Continuous posture monitoring and audit readiness\n\nWe handle the complexity so your team can focus on business outcomes.",

    devops: "**Ascelios DevOps as a Service** accelerates software delivery:\n\n• **CI/CD pipelines** — GitHub Actions, GitLab CI, Jenkins on any cloud\n• **Container platforms** — Kubernetes cluster management and microservices\n• **Observability** — Logging, monitoring, alerting with Grafana, Prometheus, ELK\n• **Platform engineering** — Developer portals and self-service infrastructure\n• **SRE-backed support** — Incident management, on-call, and runbooks\n\nReduce time-to-production and eliminate toil for your engineering teams.",

    migration: "Our **Cloud Migration Journey** is a proven 6-phase programme:\n\n1. **Assessment & Discovery** — Inventory, dependency mapping, TCO analysis\n2. **Architecture & Planning** — Target-state design, risk assessment, timeline\n3. **Pilot Migration** — Proof-of-concept with a representative workload\n4. **Full Migration Wave 1** — Core production systems\n5. **Full Migration Wave 2** — Remaining workloads and decommission\n6. **Optimisation & Steady State** — FinOps, security hardening, knowledge transfer\n\nTypical enterprise engagements complete in 12–18 months.",

    engagement: "**Getting started with Ascelios is straightforward:**\n\n1. **Discovery call** — 45-minute intro to understand your environment and goals\n2. **Assessment** — Gap analysis and roadmap (typically 2–3 weeks)\n3. **Proposal** — Fixed-scope statement of work or managed service agreement\n4. **Onboarding** — Dedicated project team, kick-off, and handover plan\n\nWe work with enterprises of all sizes. Ready to start? Visit our **[contact page](/contact)**.",

    contact: "Our team would love to speak with you:\n\n📧 **Email:** hello@ascelios.com\n📞 **Phone:** +971 4 123 4567\n📍 **Office:** Dubai, UAE — with regional coverage across the GCC\n\nOr visit our **[contact page](/contact)** to fill in a brief enquiry — a consultant will respond within one business day.",

    pricing: "Ascelios services are tailored to your environment, scope, and support tier:\n\n• **Managed Service Agreements** — Monthly retainer with defined SLAs\n• **Project-based** — Fixed-price for migrations and implementations\n• **Hybrid** — Project delivery followed by ongoing managed support\n\n[Contact us](/contact) for a proposal — we work within your budget.",

    about: "Ascelios is a managed services provider focused on SAP, cloud, and DevOps for enterprises in the GCC and wider region. Our team combines deep SAP expertise with modern cloud and DevOps capabilities to deliver end-to-end transformation programmes.\n\nWe are SAP-certified, AWS Advanced Partner, and Microsoft Azure Partner. Our clients range from mid-market to large enterprise across manufacturing, retail, utilities, and financial services.",

    fallback: "I can help with information about our SAP, Cloud, and DevOps services, how to engage with us, or pricing. What would you like to know?\n\nYou can also visit our **[contact page](/contact)** to speak directly with our team.",
  },

  ar: {
    greeting: "مرحباً! أهلاً بك في أسيليوس. نحن متخصصون في خدمات SAP والسحابة وDevOps المُدارة للمؤسسات في المنطقة. كيف يمكنني مساعدتك اليوم؟",
    suggestions: ["خدمات SAP", "خدمات السحابة", "خدمات DevOps", "كيفية البدء"],

    sap: "**خدمات SAP المُدارة من أسيليوس** تغطي دورة حياة SAP بالكامل:\n\n• **الهجرة والتنفيذ لـ S/4HANA** — الانتقال من ECC أو تنفيذات جديدة\n• **عمليات Basis** — إدارة النظام على مدار الساعة وإدارة النقل والتصحيحات\n• **إدارة قواعد بيانات HANA** — النسخ الاحتياطي وضبط الأداء والتوافر العالي\n• **دعم التطبيقات** — وحدات FI/CO وسلسلة التوريد وSD وMM وPP\n• **الاستضافة السحابية** — بنية تحتية معتمدة من SAP على AWS وAzure\n\nمستشارونا المعتمدون يجمعون المعرفة الإقليمية العميقة مع أفضل الممارسات العالمية.",

    cloud: "**خدمات العمليات السحابية من أسيليوس** تُحدِّث البنية التحتية للمؤسسات:\n\n• **الهجرة السحابية** — رحلة منظمة من 6 مراحل من التقييم إلى الحالة المستقرة\n• **إدارة السحابة المتعددة** — AWS وAzure وGCP من لوحة تحكم واحدة\n• **البنية التحتية كرمز** — Terraform وAnsible وخطوط GitOps\n• **FinOps** — رؤية التكلفة وإعادة الحجم وتوصيات التوفير\n• **الأمن والامتثال** — مراقبة مستمرة للوضع الأمني واستعداد للتدقيق\n\nنحن نتولى التعقيد حتى يتمكن فريقك من التركيز على نتائج الأعمال.",

    devops: "**خدمة DevOps كخدمة من أسيليوس** تُسرِّع تسليم البرمجيات:\n\n• **خطوط CI/CD** — GitHub Actions وGitLab CI وJenkins على أي سحابة\n• **منصات الحاويات** — إدارة مجموعات Kubernetes والخدمات المصغرة\n• **المراقبة والرصد** — السجلات والمراقبة والتنبيه مع Grafana وPrometheus وELK\n• **هندسة المنصة** — بوابات المطورين والبنية التحتية ذاتية الخدمة\n• **الدعم المدعوم بـ SRE** — إدارة الحوادث والتأهب الميداني وكتب التشغيل\n\nقلل وقت الوصول إلى الإنتاج وتخلص من الأعباء لفرق هندستك.",

    migration: "**رحلة الهجرة السحابية** لدينا هي برنامج مثبت من 6 مراحل:\n\n1. **التقييم والاكتشاف** — الجرد ورسم خرائط التبعيات وتحليل TCO\n2. **الهندسة والتخطيط** — تصميم الحالة المستهدفة وتقييم المخاطر والجدول الزمني\n3. **الهجرة التجريبية** — إثبات المفهوم مع عبء عمل تمثيلي\n4. **موجة الهجرة الكاملة 1** — أنظمة الإنتاج الأساسية\n5. **موجة الهجرة الكاملة 2** — أعباء العمل المتبقية والتوقف عن التشغيل\n6. **التحسين والحالة المستقرة** — FinOps وتقوية الأمن ونقل المعرفة\n\nتستغرق المشاركات المؤسسية النموذجية 12–18 شهراً.",

    engagement: "**البدء مع أسيليوس أمر بسيط:**\n\n1. **مكالمة الاستكشاف** — مقدمة مدتها 45 دقيقة لفهم بيئتك وأهدافك\n2. **التقييم** — تحليل الفجوات وخارطة الطريق (عادةً 2–3 أسابيع)\n3. **المقترح** — بيان عمل محدد النطاق أو اتفاقية خدمة مُدارة\n4. **الإعداد** — فريق مشروع مخصص وخطة إطلاق وتسليم\n\nنعمل مع مؤسسات من جميع الأحجام. مستعد للبدء؟ قم بزيارة **[صفحة الاتصال](/contact)**.",

    contact: "يسعد فريقنا التحدث معك:\n\n📧 **البريد الإلكتروني:** hello@ascelios.com\n📞 **الهاتف:** +971 4 123 4567\n📍 **المكتب:** دبي، الإمارات — مع تغطية إقليمية في منطقة الخليج\n\nأو قم بزيارة **[صفحة الاتصال](/contact)** لملء استمارة استفسار موجزة — سيرد عليك أحد المستشارين خلال يوم عمل واحد.",

    pricing: "تُسعَّر خدمات أسيليوس بناءً على بيئتك المحددة والنطاق ومستوى الدعم:\n\n• **اتفاقيات الخدمة المُدارة** — رسوم شهرية ثابتة مع مستويات خدمة محددة\n• **قائمة على المشروع** — سعر ثابت للهجرات والتنفيذات\n• **هجين** — تسليم المشروع متبوعاً بدعم مُدار مستمر\n\n[تواصل معنا](/contact) للحصول على مقترح مخصص.",

    about: "أسيليوس هي مزود خدمات مُدارة متخصص في SAP والسحابة وDevOps للمؤسسات في منطقة الخليج والمنطقة الأوسع. يجمع فريقنا خبرة SAP العميقة مع قدرات السحابة وDevOps الحديثة لتقديم برامج تحول شاملة.\n\nنحن معتمدون من SAP وشريك AWS المتقدم وشريك Microsoft Azure. يتراوح عملاؤنا من الشركات المتوسطة إلى المؤسسات الكبيرة عبر قطاعات التصنيع والتجزئة والمرافق والخدمات المالية.",

    fallback: "يمكنني مساعدتك في معلومات حول خدمات SAP والسحابة وDevOps لدينا، أو كيفية التعاون معنا، أو التسعير. ماذا تريد أن تعرف؟\n\nيمكنك أيضاً زيارة **[صفحة الاتصال](/contact)** للتحدث مباشرة مع فريقنا.",
  },
};

/* ── Arabic detection ────────────────────────────────────── */

function containsArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}

/* ── Response engine ─────────────────────────────────────── */

function getResponse(text: string, lang: Lang): { reply: string; suggestions?: string[]; replyDir: "ltr" | "rtl" } {
  const m = text.toLowerCase();
  const effectiveLang: Lang = containsArabic(text) ? "ar" : lang;
  const k = KB[effectiveLang];
  const replyDir: "ltr" | "rtl" = effectiveLang === "ar" ? "rtl" : "ltr";

  if (/\bsap\b|s\/4|s4hana|hana|basis|erp|ساب|هانا/.test(m)) return { reply: k.sap, replyDir };
  if (/\bcloud\b|aws|azure|gcp|infra|سحاب|سحابي/.test(m)) return { reply: k.cloud, replyDir };
  if (/devops|ci.?cd|pipeline|kubernetes|k8s|container|ديف.?أوبس/.test(m)) return { reply: k.devops, replyDir };
  if (/migrat|هجرة|انتقال/.test(m)) return { reply: k.migration, replyDir };
  if (/\b(price|cost|pricing|budget|fee|charge|تكلفة|سعر|تسعير|رسوم)\b/.test(m)) return { reply: k.pricing, replyDir };
  if (/\b(contact|reach|email|phone|call|اتصال|تواصل|هاتف|بريد)\b/.test(m)) return { reply: k.contact, replyDir };
  if (/\b(about|who|company|ascelios|من نحن|عن)\b/.test(m)) return { reply: k.about, replyDir };
  if (/\b(start|begin|engage|approach|process|كيف|بدء|الإجراء|الخطوات)\b/.test(m)) return { reply: k.engagement, replyDir };
  if (/\b(hi|hello|hey|مرحب|السلام|أهلا|هاي|مرحبا)\b/.test(m)) return { reply: k.greeting, suggestions: k.suggestions, replyDir };

  return { reply: k.fallback, suggestions: k.suggestions, replyDir };
}

/* ── Markdown-lite renderer ──────────────────────────────── */

function renderText(text: string) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*")) return <em key={j} className="not-italic opacity-80">{p.slice(1, -1)}</em>;
      const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) return <a key={j} href={link[2]} className="underline underline-offset-2 opacity-90 hover:opacity-100">{link[1]}</a>;
      return <span key={j}>{p}</span>;
    });
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

/* ── Typing dots ─────────────────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500" style={{ animation: `mktDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

/* ── Time format ─────────────────────────────────────────── */

function fmt(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Component ───────────────────────────────────────────── */

export function MarketingChatbot() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userDir: "ltr" | "rtl" = containsArabic(text) ? "rtl" : "ltr";
    if (containsArabic(text)) setLang("ar");
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: text.trim(), ts: new Date(), dir: userDir };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise(r => setTimeout(r, 400 + Math.random() * 700));

    const { reply, suggestions, replyDir } = getResponse(text.trim(), lang);
    setTyping(false);
    const botMsg: Message = { id: crypto.randomUUID(), role: "bot", text: reply, ts: new Date(), dir: replyDir, suggestions };
    setMessages(prev => [...prev, botMsg]);
    if (!open) setUnread(n => n + 1);
  }, [lang, open]);

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  const isEmpty = messages.length === 0;
  const lastBot = [...messages].reverse().find(m => m.role === "bot");
  const chips = isEmpty ? KB[lang].suggestions : (lastBot?.suggestions ?? []);
  const panelDir = lang === "ar" ? "rtl" : "ltr";

  return (
    <>
      <style>{`
        @keyframes mktDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes mktSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Panel */}
      {open && (
        <div
          dir={panelDir}
          className="fixed bottom-20 right-6 z-[70] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: 380, height: 560, background: "#0d1f2d", border: "1px solid rgba(255,255,255,0.1)", animation: "mktSlideUp 220ms ease-out both" }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-white/8" style={{ background: "#0b1e2e" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
                  <path d="M8 1a6 6 0 1 0 0 12A6 6 0 0 0 8 1Z" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 7c.5-1.5 5-1.5 5 0s-2 3-2.5 3S5 8.5 5.5 7Z" fill="currentColor" opacity=".6"/>
                  <path d="M8 13v2M5 14.5l.5-1.5M11 14.5l-.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Ascelios</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {lang === "ar" ? "متاح الآن" : "Online"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Language toggle */}
              <div className="flex rounded-lg overflow-hidden border border-white/10 text-[10px] font-mono">
                {(["en", "ar"] as Lang[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 transition-colors ${lang === l ? "bg-brand-primary text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" aria-label="Close">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {isEmpty && (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/15 border border-brand-primary/20 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" className="text-brand-accent" aria-hidden="true">
                    <path d="M8 1a6 6 0 1 0 0 12A6 6 0 0 0 8 1Z" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5.5 7c.5-1.5 5-1.5 5 0s-2 3-2.5 3S5 8.5 5.5 7Z" fill="currentColor" opacity=".6"/>
                  </svg>
                </div>
                <p className="text-sm text-white font-medium mb-1">
                  {lang === "ar" ? "مرحباً!" : "Hi there!"}
                </p>
                <p className="text-xs text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  {lang === "ar"
                    ? "أنا مساعد أسيليوس. اسألني عن خدماتنا أو كيفية البدء."
                    : "I'm the Ascelios assistant. Ask me about our services or how to get started."}
                </p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} dir={msg.dir}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-primary text-white rounded-br-sm"
                    : "bg-white/6 border border-white/8 text-slate-300 rounded-bl-sm"
                }`}>
                  <p>{renderText(msg.text)}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-white/50" : "text-slate-600"} ${msg.dir === "rtl" ? "text-left" : "text-right"}`}>{fmt(msg.ts)}</p>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm"><TypingDots /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {chips.length > 0 && !typing && (
            <div className="shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
              {chips.map(s => (
                <button key={s} onClick={() => send(s)} className="px-2.5 py-1 text-[11px] rounded-full border border-brand-primary/40 bg-brand-primary/10 text-brand-accent hover:bg-brand-primary/20 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-white/8">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              dir="auto"
              placeholder={lang === "ar" ? "اكتب سؤالك…" : "Ask anything…"}
              disabled={typing}
              className="flex-1 bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={!input.trim() || typing} className="w-8 h-8 rounded-xl bg-brand-primary hover:bg-brand-accent disabled:opacity-40 flex items-center justify-center transition-colors shrink-0" aria-label="Send">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d={lang === "ar" ? "M2 7l10-5-2 5 2 5L2 7Z" : "M12 7L2 2l2 5-2 5 10-5Z"} fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[70] rounded-full shadow-lg shadow-brand-primary/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ width: 52, height: 52, background: open ? "#1e3a5f" : "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)", border: "1px solid rgba(255,255,255,0.15)" }}
        aria-label={open ? "Close chat" : "Chat with us"}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white" aria-hidden="true">
              <path d="M17.5 12.5A2.5 2.5 0 0 1 15 15H6L2.5 18.5V5A2.5 2.5 0 0 1 5 2.5h10A2.5 2.5 0 0 1 17.5 5v7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M6.5 8h7M6.5 11h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-brand-bg text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
