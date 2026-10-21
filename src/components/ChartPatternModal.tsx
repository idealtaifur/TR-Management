import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface ChartPattern {
  id: string;
  nameBn: string;
  nameEn: string;
  category: "reversal" | "candlestick" | "continuation";
  signal: "CALL (UP ↗)" | "PUT (DOWN ↘)" | "BOTH";
  signalType: "bullish" | "bearish" | "neutral";
  accuracy: string;
  timeframe: string;
  summary: string;
  formation: string;
  entryRule: string;
  proTip: string;
  iconType: string;
}

export const CHART_PATTERNS: ChartPattern[] = [
  {
    id: "double-bottom",
    nameBn: "ডাবল বটম (W প্যাটার্ন)",
    nameEn: "Double Bottom Reversal",
    category: "reversal",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৫% - ৯০%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "সাপোর্ট লেভেলে পর পর দুটি সমমানের লো (Low) তৈরি করে 'W' আকৃতি ধারণ করে।",
    formation: "মার্কেট ডাউনট্রেন্ডে এসে প্রথম বটম তৈরি করে বাউন্স করে এবং পুনরায় সেই একই সাপোর্ট লেভেলে এসে দ্বিতীয় বটম গঠন করে।",
    entryRule: "নেকলাইন (মাঝের পিক) ব্রেকআউট হওয়ার পর অথবা নেকলাইন রিটেস্টে বুলিশ ক্যান্ডেল দেখে ১-২ মিনিটের জন্য CALL/UP এন্ট্রি নিন।",
    proTip: "দ্বিতীয় বটমে যদি রিজেকশন উইক (Wick) বা ডাইভারজেন্স থাকে, তবে সিগন্যালের নির্ভুলতা বহুগুণ বেড়ে যায়।",
    iconType: "w-pattern"
  },
  {
    id: "double-top",
    nameBn: "ডাবল টপ (M প্যাটার্ন)",
    nameEn: "Double Top Reversal",
    category: "reversal",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৫% - ৯০%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "রেজিস্ট্যান্স লেভেলে দুটি সমমানের পিক (High) তৈরি করে 'M' আকৃতি গঠন করে।",
    formation: "আপট্রেন্ডে মার্কেট রেজিস্ট্যান্সে প্রথম ধাক্কা খেয়ে নিচে নামে, পুনরায় উঠে একই রেজিস্ট্যান্স টেস্ট করতে ব্যর্থ হয়ে নিচে নামে।",
    entryRule: "নেকলাইন ভেঙে নিচের দিকে রেড ক্যান্ডেল ক্লোজ হলে অথবা রিটেস্টে রিজেকশন দেখে PUT/DOWN এন্ট্রি নিন।",
    proTip: "রেজিস্ট্যান্সে দ্বিতীয় পিকে যদি Shooting Star বা Bearish Pinbar ক্যান্ডেল তৈরি হয়, তবে অত্যন্ত শক্তিশালী সেল সিগন্যাল।",
    iconType: "m-pattern"
  },
  {
    id: "head-and-shoulders",
    nameBn: "হেড অ্যান্ড শোল্ডারস",
    nameEn: "Head and Shoulders",
    category: "reversal",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৮%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "বাম কাঁধ, উঁচু মাথা ও ডান কাঁধ তৈরি করে আপট্রেন্ডকে ডাউনট্রেন্ডে রূপান্তর করে।",
    formation: "একটি পিক (Left Shoulder), তার চেয়ে উঁচু পিক (Head) এবং শেষের দিকে হেড এর চেয়ে নিচু পিক (Right Shoulder) তৈরি হয়।",
    entryRule: "নেকলাইন নিচে ভেঙে ব্রেকআউট ক্যান্ডেল ক্লোজ হলে পরবর্তী ক্যান্ডেলে নিশ্চিত পুট (DOWN) ট্রেড প্লেস করুন।",
    proTip: "ডান কাঁধের ভলিউম ও ক্যান্ডেলের সাইজ সাধারণত হেডের চেয়ে ছোট হয়, যা বায়ারদের দুর্বলতা প্রকাশ করে।",
    iconType: "head-shoulders"
  },
  {
    id: "inverse-head-shoulders",
    nameBn: "ইনভার্স হেড অ্যান্ড শোল্ডারস",
    nameEn: "Inverse Head and Shoulders",
    category: "reversal",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৮%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "ডাউনট্রেন্ডের শেষ মাথায় উল্টো হেড অ্যান্ড শোল্ডার তৈরি হয়ে শক্তিশালী আপট্রেন্ড শুরু হয়।",
    formation: "বটমে তিনটি ডিপ তৈরি হয়, যার মাঝের ডিপটি (Head) অন্য দুটির চেয়ে নিচু থাকে।",
    entryRule: "উপরের নেকলাইন ব্রেকআউট হলে বা রিটেস্টে গ্রিন ক্যান্ডেল কনফার্ম হলে ১-৩ মিনিটের CALL ট্রেড নিন।",
    proTip: "ডান কাঁধে বুলিশ পিনবার বা হ্যামার দেখা দিলে খুব দ্রুত এন্ট্রি নিশ্চিত করা যায়।",
    iconType: "inv-head-shoulders"
  },
  {
    id: "bullish-engulfing",
    nameBn: "বুলিশ এনগালফিং ক্যান্ডেল",
    nameEn: "Bullish Engulfing",
    category: "candlestick",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮২% - ৮৬%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "পূর্ববর্তী ছোট লাল ক্যান্ডেলকে পরবর্তী বড় সবুজ ক্যান্ডেল সম্পূর্ণ গ্রাস (Engulf) করে ফেলে।",
    formation: "সাপোর্ট লেভেলে একটি ছোট বিয়ারিশ ক্যান্ডেলের পর বড় বায়ার্স প্রেসারের গ্রিন ক্যান্ডেল তৈরি হয় যা আগের বডিকে ঢেকে দেয়।",
    entryRule: "এনগালফিং ক্যান্ডেল ক্লোজ হওয়ার ঠিক পর মুহূর্তেই পরবর্তী ১ মিনিটের ক্যান্ডেলের জন্য UP ট্রেড নিন।",
    proTip: "সাপোর্ট লেভেল বা ২০ EMA-এর কাছে তৈরি হলে উইন রেট ৯০% পর্যন্ত হতে পারে।",
    iconType: "engulfing-bull"
  },
  {
    id: "bearish-engulfing",
    nameBn: "বেয়ারিশ এনগালফিং ক্যান্ডেল",
    nameEn: "Bearish Engulfing",
    category: "candlestick",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮২% - ৮৬%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "পূর্ববর্তী ছোট সবুজ ক্যান্ডেলকে পরবর্তী বড় লাল ক্যান্ডেল পুরোপুরি ঢেকে ফেলে নিচে নামে।",
    formation: "রেজিস্ট্যান্স লেভেলে আপট্রেন্ডের শীর্ষে একটি গ্রিন ক্যান্ডেলের পর শক্তিশালী সেলার্স রেড ক্যান্ডেল গঠিত হয়।",
    entryRule: "রেড এনগালফিং ক্যান্ডেল শেষ হলে পরবর্তী ক্যান্ডেলে সরাসরি DOWN/PUT ট্রেড ওপেন করুন।",
    proTip: "ওভারবট (RSI > ৭০) জোনে এই প্যাটার্ন পাওয়া গেলে অত্যন্ত নিখুঁত ফলাফল দেয়।",
    iconType: "engulfing-bear"
  },
  {
    id: "hammer-inverted",
    nameBn: "হ্যামার ও ইনভার্টেড হ্যামার",
    nameEn: "Hammer & Inverted Hammer",
    category: "candlestick",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮০% - ৮৫%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "নিচের দিকে শরীরের দ্বিগুণের চেয়ে বড় শ্যাডো (Wick) দিয়ে ক্রেতাদের তীব্র চাপ নির্দেশ করে।",
    formation: "ডাউনট্রেন্ডের বটমে এসে সেলাররা মার্কেট নামালেও শক্তিশালী বায়ার্স রিজেকশন দিয়ে উপরে ক্লোজ করে।",
    entryRule: "পরবর্তী ক্যান্ডেল যদি হ্যামারের হাই ভেঙে উপরে যায়, তবে অবিলম্বে ১-২ মিনিটের CALL এন্ট্রি নিন।",
    proTip: "হ্যামারের রঙ সবুজ হলে সিগন্যাল আরও শক্তিশালী হয়, তবে সাপোর্ট লেভেলে লাল রঙের হলেও কাজ করে।",
    iconType: "hammer"
  },
  {
    id: "shooting-star",
    nameBn: "শুটিং স্টার ক্যান্ডেল",
    nameEn: "Shooting Star (Bearish Pinbar)",
    category: "candlestick",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৩%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "উপরের দিকে লম্বা উইক এবং নিচের দিকে ছোট বডি তৈরি করে সেলারদের আগ্রাসী উপস্থিতি বোঝায়।",
    formation: "আপট্রেন্ডের শীর্ষে ক্রেতারা মার্কেট উঠালেও রেজিস্ট্যান্সে সেলারদের চাপে নিচে নেমে এসে ক্লোজ দেয়।",
    entryRule: "শুটিং স্টার নিশ্চিত হওয়ার পর পরবর্তী ক্যান্ডেলে ডাউন (PUT) এন্ট্রি নেওয়া আদর্শ।",
    proTip: "উইকটি যত লম্বা হবে, রেজিস্ট্যান্স লেভেলের রিজেকশন তত শক্তিশালী প্রমাণিত হবে।",
    iconType: "shooting-star"
  },
  {
    id: "morning-star",
    nameBn: "মর্নিং স্টার (৩-ক্যান্ডেল রিভার্সাল)",
    nameEn: "Morning Star Trio",
    category: "candlestick",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৯%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "১ম বড় লাল ক্যান্ডেল + ২য় ছোট ডজি/স্পিনিং টপ + ৩য় বড় সবুজ ক্যান্ডেল।",
    formation: "ডাউনট্রেন্ডের নিচে সেলাররা মোমেন্টাম হারায় (ডজি) এবং শক্তিশালী বায়াররা মার্কেট নিজেদের নিয়ন্ত্রণে নেয়।",
    entryRule: "তৃতীয় সবুজ ক্যান্ডেলটি ১ম লাল ক্যান্ডেলের ৫০% এর উপরে ক্লোজ হলে নিশ্চিত CALL ট্রেড নিন।",
    proTip: "বাইনারি অপশনে ৫ মিনিটের টাইমফ্রেমে মর্নিং স্টার প্রায় ৯২% সফলতা দিয়ে থাকে।",
    iconType: "morning-star"
  },
  {
    id: "bullish-flag",
    nameBn: "বুলিশ ফ্ল্যাগ প্যাটার্ন",
    nameEn: "Bullish Flag Continuation",
    category: "continuation",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৫%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "তীব্র আপট্রেন্ডের পর পতাকার মতো ছোট নিচের চ্যানেল তৈরি করে পুনরায় ঊর্ধ্বমুখী ব্রেকআউট।",
    formation: "একটি খাড়া আপ মুভ (Pole) এর পর হালকা নিম্নগামী প্যারালাল চ্যানেল (Flag) গঠন করে।",
    entryRule: "ফ্ল্যাগ চ্যানেলের উপরের ট্রেন্ডলাইন ভেঙে গ্রিন ক্যান্ডেল ক্লোজ হলে ট্রেন্ডের দিকে CALL এন্ট্রি নিন।",
    proTip: "ট্রেন্ডের বিপরীতে কখনও ট্রেড করবেন না। ফ্ল্যাগ প্যাটার্ন ট্রেন্ড ফলোয়িং ট্রেডের জন্য সেরা।",
    iconType: "flag-bull"
  },
  {
    id: "support-resistance-bounce",
    nameBn: "এসএনআর বাউন্স ও রিজেকশন",
    nameEn: "SNR Bounce & Rejection",
    category: "continuation",
    signal: "BOTH",
    signalType: "neutral",
    accuracy: "৮৫%+",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "স্ট্রং সাপোর্ট লেভেলে বাউন্স (CALL) এবং স্ট্রং রেজিস্ট্যান্স লেভেলে রিজেকশন (PUT)।",
    formation: "যে লেভেলে মার্কেট পূর্বে অন্তত ২-৩ বার এসে রিভার্স করেছে, সেখানে ক্যান্ডেল রিজেকশন তৈরি করে।",
    entryRule: "ক্যান্ডেল এসএনআর লাইনে টাচ করার পর উইক (Wick) ছেড়ে রিজেকশন দিলে বিপরীত দিকে ট্রেড নিন।",
    proTip: "ব্রেকআউট হওয়ার পর সেই লাইনটি বিপরীত আচরণ করে (সাপোর্ট ভেঙে গেলে তা রেজিস্ট্যান্সে পরিণত হয়)।",
    iconType: "snr"
  }
];

export function ChartPatternModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "reversal" | "candlestick" | "continuation">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePattern, setActivePattern] = useState<ChartPattern | null>(null);

  if (!isOpen) return null;

  const filteredPatterns = CHART_PATTERNS.filter((pattern) => {
    const matchesCategory = selectedCategory === "all" || pattern.category === selectedCategory;
    const matchesSearch =
      pattern.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 dark:bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-[#0f172a] rounded-[1.75rem] w-full max-w-lg border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-yellow-400 flex items-center justify-center font-bold shadow-sm border border-amber-500/25">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                ট্রেডিং চার্ট প্যাটার্ন গাইড
              </h3>
              <p className="text-[10px] text-secondary">
                উচ্চ উইন-রেট বিশিষ্ট ক্যান্ডেলস্টিক ও টেকনিক্যাল প্যাটার্ন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 border-b border-slate-200 dark:border-white/5 space-y-2 shrink-0 bg-white dark:bg-[#0f172a]">
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্যাটার্ন খুঁজুন (যেমন: W প্যাটার্ন, হ্যামার, এনগালফিং)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500/50 font-medium"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 text-[11px]">
            {[
              { id: "all", label: "সব প্যাটার্ন" },
              { id: "reversal", label: "রিভার্সাল" },
              { id: "candlestick", label: "ক্যান্ডেলস্টিক" },
              { id: "continuation", label: "ধারাবাহিক" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-[#059669] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern List or Detailed Pattern View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {activePattern ? (
            /* Detailed Pattern View */
            <div className="space-y-3 animate-in fade-in duration-200">
              <button
                onClick={() => setActivePattern(null)}
                className="flex items-center gap-1.5 text-xs text-[#059669] font-bold hover:underline mb-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                <span>তালিকায় ফিরে যান</span>
              </button>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {activePattern.nameBn}
                    </h4>
                    <p className="text-xs text-secondary font-medium">
                      {activePattern.nameEn}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                      activePattern.signalType === "bullish"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : activePattern.signalType === "bearish"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {activePattern.signal}
                  </span>
                </div>

                {/* SVG Visual Illustration of Pattern */}
                <div className="w-full h-32 rounded-xl bg-slate-900 dark:bg-black/60 border border-slate-700/50 flex items-center justify-center p-2 relative overflow-hidden">
                  <PatternSvgDiagram type={activePattern.iconType} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/80 dark:bg-black/40 p-2 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-secondary block text-[10px]">নির্ভুলতা (উইন রেট):</span>
                    <span className="font-bold text-amber-600 dark:text-yellow-400">{activePattern.accuracy}</span>
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-2 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-secondary block text-[10px]">টাইমফ্রেমে কার্যকর:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activePattern.timeframe}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">📐 গঠন ও বৈশিষ্ট্য:</span>
                    <p className="leading-relaxed">{activePattern.formation}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🎯 কখন এন্ট্রি নিবেন:</span>
                    <p className="leading-relaxed">{activePattern.entryRule}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-amber-600 dark:text-yellow-400 block mb-0.5">💡 এক্সপার্ট প্রো টিপ:</span>
                    <p className="leading-relaxed">{activePattern.proTip}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Cards List */
            filteredPatterns.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => setActivePattern(pattern)}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 transition flex items-center justify-between gap-3 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-black/80 flex items-center justify-center p-1.5 shrink-0 border border-slate-700/50">
                    <PatternMiniSvg type={pattern.iconType} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {pattern.nameBn}
                      </h4>
                    </div>
                    <p className="text-[10px] text-secondary line-clamp-1 leading-snug">
                      {pattern.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                      pattern.signalType === "bullish"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : pattern.signalType === "bearish"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {pattern.signal}
                  </span>
                  <span className="text-[9px] text-secondary font-mono font-medium">
                    {pattern.accuracy}
                  </span>
                </div>
              </div>
            ))
          )}

          {filteredPatterns.length === 0 && (
            <div className="text-center py-8 text-secondary text-xs">
              কোনো প্যাটার্ন খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <span className="text-[10px] text-secondary">
            📌 সঠিক মানি ম্যানেজমেন্ট ও প্যাটার্ন কনফার্মেশন মিলিয়ে ট্রেড করুন।
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Mini SVG Icons for Pattern List
function PatternMiniSvg({ type }: { type: string }) {
  if (type === "w-pattern") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full stroke-emerald-400 stroke-2 fill-none stroke-linecap-round stroke-linejoin-round">
        <path d="M4 8 L10 24 L16 14 L22 24 L28 8" />
        <path d="M12 14 L26 14" stroke="#facc15" strokeDasharray="2 2" strokeWidth="1" />
      </svg>
    );
  }
  if (type === "m-pattern") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full stroke-red-400 stroke-2 fill-none stroke-linecap-round stroke-linejoin-round">
        <path d="M4 24 L10 8 L16 18 L22 8 L28 24" />
        <path d="M12 18 L26 18" stroke="#facc15" strokeDasharray="2 2" strokeWidth="1" />
      </svg>
    );
  }
  if (type === "head-shoulders") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full stroke-red-400 stroke-2 fill-none stroke-linecap-round stroke-linejoin-round">
        <path d="M4 22 L8 14 L12 20 L16 6 L20 20 L24 14 L28 22" />
      </svg>
    );
  }
  if (type === "hammer") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="11" y="6" width="10" height="8" rx="1" fill="#10b981" />
        <line x1="16" y1="14" x2="16" y2="28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "shooting-star") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="4" x2="16" y2="18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="18" width="10" height="8" rx="1" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "engulfing-bull") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="7" y="12" width="6" height="10" rx="1" fill="#ef4444" />
        <rect x="17" y="6" width="10" height="20" rx="1" fill="#10b981" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full stroke-amber-400 stroke-2 fill-none stroke-linecap-round stroke-linejoin-round">
      <path d="M4 26 L12 16 L18 22 L28 6" />
    </svg>
  );
}

// Full SVG Visual Diagram for Details
function PatternSvgDiagram({ type }: { type: string }) {
  if (type === "w-pattern") {
    return (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        <line x1="20" y1="45" x2="180" y2="45" stroke="#facc15" strokeDasharray="4 4" strokeWidth="1.5" />
        <text x="182" y="48" fill="#facc15" fontSize="8" fontWeight="bold">Neckline</text>
        <path d="M 30 20 L 60 70 L 95 45 L 130 70 L 165 25" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="70" r="4" fill="#10b981" />
        <text x="50" y="83" fill="#10b981" fontSize="8" fontWeight="bold">1st Bottom</text>
        <circle cx="130" cy="70" r="4" fill="#10b981" />
        <text x="120" y="83" fill="#10b981" fontSize="8" fontWeight="bold">2nd Bottom</text>
        <circle cx="145" cy="45" r="5" fill="#f59e0b" />
        <text x="145" y="36" fill="#f59e0b" fontSize="9" fontWeight="black">CALL Entry ↗</text>
      </svg>
    );
  }
  if (type === "m-pattern") {
    return (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        <line x1="20" y1="45" x2="180" y2="45" stroke="#facc15" strokeDasharray="4 4" strokeWidth="1.5" />
        <text x="182" y="48" fill="#facc15" fontSize="8" fontWeight="bold">Neckline</text>
        <path d="M 30 70 L 60 20 L 95 45 L 130 20 L 165 70" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="20" r="4" fill="#ef4444" />
        <text x="50" y="14" fill="#ef4444" fontSize="8" fontWeight="bold">1st Peak</text>
        <circle cx="130" cy="20" r="4" fill="#ef4444" />
        <text x="120" y="14" fill="#ef4444" fontSize="8" fontWeight="bold">2nd Peak</text>
        <circle cx="145" cy="45" r="5" fill="#ef4444" />
        <text x="145" y="60" fill="#ef4444" fontSize="9" fontWeight="black">PUT Entry ↘</text>
      </svg>
    );
  }
  if (type === "hammer") {
    return (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        <line x1="30" y1="65" x2="170" y2="65" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="35" y="78" fill="#3b82f6" fontSize="9" fontWeight="bold">Strong Support Zone</text>
        {/* Previous Red Candle */}
        <line x1="70" y1="20" x2="70" y2="60" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="64" y="28" width="12" height="24" rx="1" fill="#ef4444" />
        {/* Hammer Candle */}
        <line x1="105" y1="35" x2="105" y2="75" stroke="#10b981" strokeWidth="2" />
        <rect x="98" y="32" width="14" height="15" rx="1.5" fill="#10b981" />
        <text x="92" y="24" fill="#10b981" fontSize="9" fontWeight="bold">Hammer</text>
        {/* Confirmation Green Candle */}
        <line x1="140" y1="15" x2="140" y2="50" stroke="#10b981" strokeWidth="1.5" />
        <rect x="133" y="20" width="14" height="25" rx="1.5" fill="#10b981" />
        <text x="150" y="33" fill="#10b981" fontSize="9" fontWeight="black">BUY ↗</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 90" className="w-full h-full">
      <path d="M 30 70 L 70 30 L 100 50 L 140 20 L 175 10" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="140" cy="20" r="5" fill="#f59e0b" />
      <text x="110" y="15" fill="#f59e0b" fontSize="9" fontWeight="bold">Strong Signal</text>
    </svg>
  );
}
