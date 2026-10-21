import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface CandlestickPattern {
  id: string;
  nameBn: string;
  nameEn: string;
  category: "bullish" | "bearish" | "neutral";
  signal: "CALL (UP ↗)" | "PUT (DOWN ↘)" | "WAIT / CONFIRM";
  signalType: "bullish" | "bearish" | "neutral";
  accuracy: string;
  timeframe: string;
  summary: string;
  formation: string;
  entryRule: string;
  proTip: string;
  iconType: string;
}

export const CANDLESTICK_PATTERNS: CandlestickPattern[] = [
  {
    id: "hammer",
    nameBn: "হ্যামার (Hammer)",
    nameEn: "Hammer Bullish Reversal",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৫% - ৯০%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "ডাউনট্রেন্ডের নিচে হাতুড়ির মতো দেখতে ক্যান্ডেল, যার নিচের শ্যাডো বডির চেয়ে অন্তত ২ গুণ বড়।",
    formation: "সাপোর্ট লেভেলে তীব্র সেলার প্রেসার থাকা সত্ত্বেও বায়াররা নিচ থেকে পুশ করে উপরে ক্লোজ দেয়। ফলে লম্বা লোয়ার উইক ও ছোট বডি তৈরি হয়।",
    entryRule: "হ্যামার ক্লোজ হওয়ার পর পরবর্তী ক্যান্ডেল যদি হ্যামারের হাই ব্রেক করে উপরে যায়, তবে সাথে সাথে ১-২ মিনিটের জন্য CALL/UP এন্ট্রি নিন।",
    proTip: "হ্যামারের বডি সবুজ হলে সিগন্যাল সবচেয়ে শক্তিশালী, তবে স্ট্রং সাপোর্ট জোনে লাল হ্যামার হলেও ভালো উইন রেট দেয়।",
    iconType: "hammer"
  },
  {
    id: "inverted-hammer",
    nameBn: "ইনভার্টেড হ্যামার (Inverted Hammer)",
    nameEn: "Inverted Hammer Reversal",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮২% - ৮৬%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "ডাউনট্রেন্ডের শেষ মাথায় উল্টো হাতুড়ির মতো ক্যান্ডেল, যার উপরের উইক বডির চেয়ে দ্বিগুণের বেশি লম্বা।",
    formation: "সাপোর্টের কাছাকাছি ক্রেতারা মার্কেট অনেকটা উপরে নিয়ে গেলেও কিছুটা রিজেকশন পায়, কিন্তু বায়ার্স উপস্থিতি প্রমাণিত হয়।",
    entryRule: "পরবর্তী কনফার্মেশন ক্যান্ডেলটি গ্রিন ওপেন হয়ে উপরে ছুটলে অবিলম্বে ১ মিনিটের CALL ট্রেড এক্সিকিউট করুন।",
    proTip: "ইনভার্টেড হ্যামারের পর পরবর্তী ক্যান্ডেল যদি গ্রিন হয়ে এর বডি অতিক্রম করে, তবে উইন প্রবাবিলিটি প্রায় ৯০%।",
    iconType: "inverted-hammer"
  },
  {
    id: "bullish-engulfing",
    nameBn: "বুলিশ এনগালফিং (Bullish Engulfing)",
    nameEn: "Bullish Engulfing Pattern",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৮% - ৯২%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "ছোট লাল ক্যান্ডেলকে পরবর্তী বড় সবুজ ক্যান্ডেল সম্পূর্ণ গ্রাস (Engulf) করে ঊর্ধ্বমুখী যাত্রা শুরু করে।",
    formation: "সাপোর্ট লেভেলে সেলাররা দুর্বল হয়ে ছোট রেড ক্যান্ডেল দেয়, এরপর বিশাল বায়ার্স ভলিউমের গ্রিন ক্যান্ডেল তৈরি হয়ে রেড ক্যান্ডেলের সম্পূর্ণ বডিকে ঢেকে দেয়।",
    entryRule: "গ্রিন এনগালফিং ক্যান্ডেল ক্লোজ হওয়া মাত্রই পরবর্তী ক্যান্ডেলে কোনো দ্বিধা ছাড়াই CALL (UP) ট্রেড প্লেস করুন।",
    proTip: "২০ EMA বা গোল্ডেন সাপোর্ট লাইনে বুলিশ এনগালফিং তৈরি হলে বাইনারি ট্রেডারদের জন্য এটি সবচেয়ে নিখুঁত সিউরম্যান শট।",
    iconType: "bullish-engulfing"
  },
  {
    id: "morning-star",
    nameBn: "মর্নিং স্টার (Morning Star 3-Candle)",
    nameEn: "Morning Star Trio Reversal",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৯% - ৯৪%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "১ম বড় রেড ক্যান্ডেল + ২য় ছোট ডজি বা স্পিনিং ক্যান্ডেল + ৩য় বড় গ্রিন ক্যান্ডেল।",
    formation: "ডাউনট্রেন্ডের তলানিতে ১ম ক্যান্ডেল সেলারদের শক্তি দেখায়, ২য় ছোট ক্যান্ডেল বোঝায় সেলাররা মোমেন্টাম হারিয়েছে, ৩য় গ্রিন ক্যান্ডেল বায়ারদের পূর্ণ নিয়ন্ত্রণ প্রতিষ্ঠা করে।",
    entryRule: "৩য় গ্রিন ক্যান্ডেলটি যখন ১ম রেড ক্যান্ডেলের ৫০% বডির উপরে ক্লোজ দেয়, তখন পরবর্তী ক্যান্ডেলে ১-৩ মিনিটের CALL নিন।",
    proTip: "মাঝের ২য় ক্যান্ডেলটি যদি ডোজি বা ড্রাগনফ্লাই ডোজি হয়, তবে রিভার্সালের শক্তি দ্বিগুণ বেড়ে যায়।",
    iconType: "morning-star"
  },
  {
    id: "piercing-line",
    nameBn: "পিয়ার্সিং লাইন (Piercing Line)",
    nameEn: "Piercing Line Pattern",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৪% - ৮৮%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "ডাউনট্রেন্ডের পর গ্রিন ক্যান্ডেল গ্যাপ-ডাউনে খুলে আগের রেড ক্যান্ডেলের ৫০% এর বেশি উপরে ক্লোজ করে।",
    formation: "সেলাররা নিচে নামানোর চেষ্টা করেও ব্যর্থ হয় এবং বায়াররা নিচ থেকে মার্কেট টেনে পূর্ববর্তী ক্যান্ডেলের অর্ধেকের বেশি অংশ কভার করে ফেলে।",
    entryRule: "গ্রিন ক্যান্ডেল পূর্ববর্তী রেড ক্যান্ডেলের মধ্যরেখার (৫০%) উপরে ক্লোজ দিলে পরবর্তী ক্যান্ডেলে সরাসরি UP/CALL ট্রেড নিন।",
    proTip: "সাপোর্ট জোনে পিয়ার্সিং প্যাটার্ন তৈরি হলে পরের ক্যান্ডেল সাধারণত গ্রিন কন্টিনিউ করে।",
    iconType: "piercing-line"
  },
  {
    id: "three-white-soldiers",
    nameBn: "থ্রি হোয়াইট সোলজার্স (Three White Soldiers)",
    nameEn: "Three White Soldiers",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৮%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "পরপর তিনটি শক্তিশালী গ্রিন ক্যান্ডেল যা প্রতিটি আগেরটির চেয়ে উঁচুতে ক্লোজ দেয়।",
    formation: "বটমে দীর্ঘ ডাউনট্রেন্ড শেষ করে বায়াররা একনাগাড়ে ৩টি স্বাস্থ্যবান গ্রিন ক্যান্ডেল তৈরি করে যার শ্যাডো বা উইক অত্যন্ত ছোট।",
    entryRule: "৩য় ক্যান্ডেল শেষ হওয়ার পর ট্রেন্ড কন্টিনিউয়েশনের পক্ষে ১ মিনিটের জন্য CALL এন্ট্রি নিন বা রিটেস্টের অপেক্ষা করুন।",
    proTip: "ক্যান্ডেলগুলোর সাইজ যদি প্রায় সমান হয় তবে ট্রেন্ড সুস্থ; ৩য় ক্যান্ডেল অতিরিক্ত বড় হলে সাময়িক পুলব্যাক আসতে পারে।",
    iconType: "three-soldiers"
  },
  {
    id: "dragonfly-doji",
    nameBn: "ড্রাগনফ্লাই ডজি (Dragonfly Doji)",
    nameEn: "Dragonfly Doji Bullish",
    category: "bullish",
    signal: "CALL (UP ↗)",
    signalType: "bullish",
    accuracy: "৮৬%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "'T' আকৃতির ক্যান্ডেল—ওপেন, হাই ও ক্লোজ একই লেভেলে এবং নিচের দিকে থাকে বিশাল বড় উইক।",
    formation: "সাপোর্টে সেলাররা অনেক নিচে নামিয়েছিল, কিন্তু বায়াররা পুনরায় টেনে একদম ওপেনিং প্রাইসে এনে ক্লোজ করায়। এটি চরম বায়ার্স রিজেকশন।",
    entryRule: "পরের ক্যান্ডেল গ্রিন কালারে রান করা শুরু করলেই সরাসরি ১-২ মিনিটের CALL ট্রেড প্লেস করুন।",
    proTip: "নিচের উইক যত বড় হবে, সাপোর্ট লেভেলের গ্রহণযোগ্যতা ও ট্রেডের উইন রেট তত বেশি নিখুঁত হবে।",
    iconType: "dragonfly-doji"
  },
  {
    id: "shooting-star",
    nameBn: "শুটিং স্টার (Shooting Star)",
    nameEn: "Shooting Star Bearish Pinbar",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৬% - ৯১%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "আপট্রেন্ডের শীর্ষে উল্টো হাতুড়ির মতো ক্যান্ডেল—উপরের উইক বডির দ্বিগুণের বেশি লম্বা ও নিচে ছোট বডি।",
    formation: "রেজিস্ট্যান্সে ক্রেতারা মার্কেট তুলেছিল ঠিকই, কিন্তু বিক্রেতারা প্রবল বিক্রয় চাপে মার্কেট নিচে নামিয়ে এনে সর্বনিম্ন পয়েন্টের কাছে ক্লোজ দেয়।",
    entryRule: "শুটিং স্টার ক্যান্ডেল শেষ হওয়া মাত্রই পরবর্তী ক্যান্ডেলের জন্য ১ মিনিটের PUT/DOWN ট্রেড প্লেস করুন।",
    proTip: "রেজিস্ট্যান্স লাইনে অথবা ওভারবট জোনে (RSI > ৭০) শুটিং স্টার পাওয়া গেলে এটি একটি কনফার্মড সেল সিগন্যাল।",
    iconType: "shooting-star"
  },
  {
    id: "hanging-man",
    nameBn: "হ্যাঙ্গিং ম্যান (Hanging Man)",
    nameEn: "Hanging Man Bearish",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮২% - ৮৫%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "আপট্রেন্ডের শীর্ষে হ্যামারের মতো দেখতে ক্যান্ডেল—নিচে লম্বা উইক কিন্তু এটি বিয়ারিশ রিভার্সাল সিগন্যাল দেয়।",
    formation: "মার্কেটের চূড়ায় সেলাররা হুট করে বিশাল ধাক্কা দিয়ে মার্কেট নামিয়ে দেয়; বায়াররা টেনে তুললেও সেলারদের বড় উপস্থিতি উন্মোচিত হয়।",
    entryRule: "পরবর্তী ক্যান্ডেলটি রেড তৈরি হয়ে হ্যাঙ্গিং ম্যানের লো ব্রেক করলেই নিশ্চিত PUT/DOWN এন্ট্রি নিন।",
    proTip: "হ্যাঙ্গিং ম্যানের রঙ লাল হলে রিভার্সাল পাওয়ার দ্বিগুণ বেশি থাকে।",
    iconType: "hanging-man"
  },
  {
    id: "bearish-engulfing",
    nameBn: "বেয়ারিশ এনগালফিং (Bearish Engulfing)",
    nameEn: "Bearish Engulfing Pattern",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৮% - ৯২%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "ছোট সবুজ ক্যান্ডেলকে পরবর্তী বড় লাল ক্যান্ডেল পুরোপুরি ঢেকে ফেলে প্রবল ডাউনট্রেন্ড শুরু করে।",
    formation: "রেজিস্ট্যান্স লেভেলে বায়াররা ক্ষুদ্র গ্রিন ক্যান্ডেল দেওয়ার পর এক ধাক্কায় সেলারদের বড় রেড ক্যান্ডেল এসে পূর্ববর্তী ক্যান্ডেলের বডি গ্রাস করে।",
    entryRule: "রেড এনগালফিং ক্যান্ডেল ক্লোজ হওয়া মাত্রই পরবর্তী ১-২ মিনিটের জন্য নিশ্চিত PUT (DOWN) ট্রেড ওপেন করুন।",
    proTip: "রেজিস্ট্যান্স জোন ও ডাউনট্রেন্ডের রিটেস্টে তৈরি হলে এর নির্ভুলতা প্রায় ৯০% এর উপরে পৌঁছে যায়।",
    iconType: "bearish-engulfing"
  },
  {
    id: "evening-star",
    nameBn: "ইভনিং স্টার (Evening Star 3-Candle)",
    nameEn: "Evening Star Trio Reversal",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৯০% - ৯৪%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "১ম বড় গ্রিন ক্যান্ডেল + ২য় ছোট ডজি বা স্পিনিং ক্যান্ডেল + ৩য় বড় রেড ক্যান্ডেল।",
    formation: "আপট্রেন্ডের চূড়ায় বায়াররা মোমেন্টাম হারায় (২য় ছোট ক্যান্ডেল), এরপর ৩য় ক্যান্ডেলে বিক্রেতারা মার্কেট নিজেদের পূর্ণ দখলে নিয়ে নেয়।",
    entryRule: "৩য় রেড ক্যান্ডেলটি ১ম গ্রিন ক্যান্ডেলের ৫০% এর নিচে নেমে ক্লোজ হলে পরবর্তী ক্যান্ডেলে সরাসরি DOWN/PUT ট্রেড নিন।",
    proTip: "বাইনারি অপশনে ৫ মিনিটের এক্সপায়ারিতে ইভনিং স্টার সবচেয়ে শক্তিশালী রিভার্সাল রেজাল্ট দেয়।",
    iconType: "evening-star"
  },
  {
    id: "dark-cloud-cover",
    nameBn: "ডার্ক ক্লাউড কভার (Dark Cloud Cover)",
    nameEn: "Dark Cloud Cover",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৪% - ৮৭%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "আপট্রেন্ডে গ্রিন ক্যান্ডেলের পর নতুন রেড ক্যান্ডেল গ্যাপ-আপে ওপেন হয়ে পূর্ববর্তী গ্রিনের ৫০% নিচে ক্লোজ দেয়।",
    formation: "মার্কেটের শীর্ষে কালো মেঘের মতো সেলাররা আক্রমণ করে এবং পূর্বের বায়ারদের সমস্ত শক্তি ম্লান করে নিচে নামিয়ে আনে।",
    entryRule: "রেড ক্যান্ডেল ১ম গ্রিন ক্যান্ডেলের মাঝ বরাবর বা তার নিচে ক্লোজ করার সাথে সাথে পরবর্তী ক্যান্ডেলে PUT ট্রেড নিন।",
    proTip: "পরবর্তী ক্যান্ডেল যদি কনফার্মেশনের জন্য আরও একটি রেড তৈরি করে তবে নিশ্চিত ডাউনট্রেন্ড জারি থাকবে।",
    iconType: "dark-cloud"
  },
  {
    id: "three-black-crows",
    nameBn: "থ্রি ব্ল্যাক ক্রোজ (Three Black Crows)",
    nameEn: "Three Black Crows",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৮%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "পরপর তিনটি শক্তিশালী বড় লাল ক্যান্ডেল যা প্রতিটি আগেরটির লো ভেঙে নিচে ক্লোজ দেয়।",
    formation: "রেজিস্ট্যান্সের পর একাধারে বিক্রেতারা তীব্র আক্রমণ চালিয়ে মার্কেটকে ধসিয়ে দেয়। ক্যান্ডেলগুলোর উইক অত্যন্ত ছোট থাকে।",
    entryRule: "টানা তিনটি রেড ক্যান্ডেল সম্পন্ন হওয়ার পর পরবর্তী পুলব্যাক বা মোমেন্টামের সাথে ১ মিনিটের PUT এন্ট্রি নিন।",
    proTip: "ট্রেডিং ভলিউম বৃদ্ধি পেলে এটি নিশ্চিত দীর্ঘমেয়াদী ডাউনট্রেন্ড সূচনা করে।",
    iconType: "three-crows"
  },
  {
    id: "gravestone-doji",
    nameBn: "গ্রেভস্টোন ডজি (Gravestone Doji)",
    nameEn: "Gravestone Doji Bearish",
    category: "bearish",
    signal: "PUT (DOWN ↘)",
    signalType: "bearish",
    accuracy: "৮৫%",
    timeframe: "১ মিনিট বা যেকোনো",
    summary: "উল্টো 'T' আকৃতির ক্যান্ডেল—ওপেন, লো ও ক্লোজ একই নিচে থাকে এবং উপরে থাকে সুবিশাল উইক।",
    formation: "রেজিস্ট্যান্সে ক্রেতারা প্রাইস অনেক উপরে ঠেলে নিয়েছিল, কিন্তু বিক্রেতাদের প্রবল বাধায় মার্কেট নিচে তলিয়ে ওপেনিং পয়েন্টে ফিরে আসে।",
    entryRule: "গ্রেভস্টোন ডোজি সম্পূর্ণ হওয়ার পর পরবর্তী ক্যান্ডেল রেড দিকে নামা শুরু করলে তাৎক্ষণিক PUT ট্রেড নিন।",
    proTip: "রেজিস্ট্যান্স লাইনের সামান্য উপরে উইক ছুঁয়ে গ্রেভস্টোন তৈরি হলে তা মারাত্মক শক্তিশালী রিভার্সাল নির্দেশ করে।",
    iconType: "gravestone-doji"
  },
  {
    id: "classic-doji",
    nameBn: "নিউট্রাল ডজি (Classic Doji)",
    nameEn: "Classic Cross Doji",
    category: "neutral",
    signal: "WAIT / CONFIRM",
    signalType: "neutral",
    accuracy: "৮০%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "প্লাস '+' চিহ্নের মতো ক্যান্ডেল—ওপেন ও ক্লোজ সম্পূর্ণ এক এবং উপরে-নিচে সমমানের উইক।",
    formation: "মার্কেটে ক্রেতা ও বিক্রেতার শক্তি হুবহু সমান হওয়ায় কেউ প্রাইসকে সরাতে পারেনি। এটি সিদ্ধান্তের অভাব (Indecision) নির্দেশ করে।",
    entryRule: "ডজি চলাকালীন ট্রেড পরিহার করুন! ডজির ঠিক পরবর্তী ক্যান্ডেলটি যেদিকে ব্রেকআউট দিবে, সেদিকে এন্ট্রি নিন।",
    proTip: "একটি দীর্ঘ ট্রেন্ডের পর ডজি দেখা গেলে ট্রেন্ড পরিবর্তনের আগাম সংকেত দেয়। পরবর্তী ক্যান্ডেল দেখে নিশ্চিত হোন।",
    iconType: "classic-doji"
  },
  {
    id: "marubozu",
    nameBn: "মারুবোজু ক্যান্ডেল (Marubozu Momentum)",
    nameEn: "Bullish & Bearish Marubozu",
    category: "neutral",
    signal: "WAIT / CONFIRM",
    signalType: "neutral",
    accuracy: "৮৯%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "কোনো উইক বা শ্যাডো ছাড়া সম্পূর্ণ সলিড পূর্ণ বডির বিশাল ক্যান্ডেল যা একপাক্ষিক শক্তি প্রকাশ করে।",
    formation: "গ্রিন মারুবোজু মানে শুরু থেকে শেষ পর্যন্ত ১০০% বায়ার্স প্রেসার; রেড মারুবোজু মানে সম্পূর্ণ সেলার্স রাজত্ব।",
    entryRule: "গ্রিন মারুবোজু দেখলে পরবর্তী ক্যান্ডেলে CALL এবং রেড মারুবোজু দেখলে পরবর্তী ক্যান্ডেলে ট্রেন্ডের সাথে PUT ট্রেড নিন।",
    proTip: "ব্রেকআউট ক্যান্ডেল যদি মারুবোজু হয়, তবে সেই ব্রেকআউট ১০০% আসল এবং মিথ্যা হওয়ার সম্ভাবনা থাকে না।",
    iconType: "marubozu"
  },
  {
    id: "tweezer-bottom-top",
    nameBn: "টুইজার বটম ও টপ (Tweezer Bottom & Top)",
    nameEn: "Tweezer Reversal Pair",
    category: "neutral",
    signal: "WAIT / CONFIRM",
    signalType: "neutral",
    accuracy: "৮৫%",
    timeframe: "১ মিনিট - ৫ মিনিট",
    summary: "পরপর দুটি ক্যান্ডেলের লো সমান হলে টুইজার বটম (CALL) এবং হাই সমান হলে টুইজার টপ (PUT)।",
    formation: "১ম ও ২য় ক্যান্ডেল হুবহু একই সাপোর্ট বা রেজিস্ট্যান্স পয়েন্টে বারবার বাধা পেয়ে টুইজারের মতো হুবহু এক লেভেলে শ্যাডো তৈরি করে।",
    entryRule: "টুইজার বটমে ২য় ক্যান্ডেল গ্রিন শেষ হলে CALL নিন; টুইজার টপে ২য় ক্যান্ডেল রেড শেষ হলে PUT নিন।",
    proTip: "সাপোর্ট বা রেজিস্ট্যান্স লেভেলে পিনবারের সাথে টুইজার গঠিত হলে উইন প্রবাবিলিটি প্রায় ৯২%।",
    iconType: "tweezer"
  }
];

export function CandlestickPatternModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "bullish" | "bearish" | "neutral">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePattern, setActivePattern] = useState<CandlestickPattern | null>(null);

  if (!isOpen) return null;

  const filteredPatterns = CANDLESTICK_PATTERNS.filter((pattern) => {
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
              {/* Candlestick Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="2" x2="8" y2="22" stroke="#10b981" strokeWidth="1.5" />
                <rect x="5.5" y="6" width="5" height="10" rx="0.5" fill="#10b981" stroke="#10b981" />
                <line x1="16" y1="2" x2="16" y2="22" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="13.5" y="8" width="5" height="9" rx="0.5" fill="#ef4444" stroke="#ef4444" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>ক্যান্ডেলস্টিক প্যাটার্ন গাইড</span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
              </h3>
              <p className="text-[10px] text-secondary">
                বাইনারি ও ফরেক্স ট্রেডিংয়ের সবচেয়ে সফল ক্যান্ডেলস্টিক সেটআপ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition active:scale-95 cursor-pointer"
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
              placeholder="ক্যান্ডেল খুঁজুন (যেমন: হ্যামার, এনগালফিং, শুটিং স্টার)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500/50 font-medium"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 text-[11px]">
            {[
              { id: "all", label: "সব ক্যান্ডেলস্টিক" },
              { id: "bullish", label: "বুলিশ (CALL ↗)" },
              { id: "bearish", label: "বেয়ারিশ (PUT ↘)" },
              { id: "neutral", label: "ডজি ও মোমেন্টাম" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setActivePattern(null);
                }}
                className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition active:scale-95 cursor-pointer ${
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

        {/* Pattern List or Detailed Candlestick View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {activePattern ? (
            /* Detailed Candlestick Pattern View */
            <div className="space-y-3 animate-in fade-in duration-200">
              <button
                onClick={() => setActivePattern(null)}
                className="flex items-center gap-1.5 text-xs text-[#059669] font-bold hover:underline mb-1 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                <span>ক্যান্ডেলস্টিক তালিকায় ফিরে যান</span>
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
                        : "bg-amber-500/15 text-amber-600 dark:text-yellow-400 border-amber-500/30"
                    }`}
                  >
                    {activePattern.signal}
                  </span>
                </div>

                {/* Candlestick SVG Visual Diagram */}
                <div className="w-full h-36 rounded-xl bg-slate-950 dark:bg-black/80 border border-slate-700/50 flex items-center justify-center p-2 relative overflow-hidden">
                  <CandleSvgDiagram type={activePattern.iconType} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/80 dark:bg-black/40 p-2 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-secondary block text-[10px]">নির্ভুলতা (উইন রেট):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activePattern.accuracy}</span>
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-2 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-secondary block text-[10px]">কার্যকর টাইমফ্রেম:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activePattern.timeframe}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-0.5">🕯️ ক্যান্ডেলের গঠন ও সাইকোলজি:</span>
                    <p className="leading-relaxed">{activePattern.formation}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🎯 এন্ট্রি পয়েন্ট ও এক্সপায়ারি:</span>
                    <p className="leading-relaxed">{activePattern.entryRule}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-amber-600 dark:text-yellow-400 block mb-0.5">💡 সিক্রেট প্রো-টিপ:</span>
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
                  <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-black/90 flex items-center justify-center p-1 shrink-0 border border-slate-700/60 shadow-inner">
                    <CandleMiniSvg type={pattern.iconType} />
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
                        : "bg-amber-500/15 text-amber-600 dark:text-yellow-400 border-amber-500/30"
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
              কোনো ক্যান্ডেলস্টিক প্যাটার্ন খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <span className="text-[10px] text-secondary">
            🕯️ সবসময় সাপোর্ট ও রেজিস্ট্যান্স লেভেলে ক্যান্ডেল রিজেকশন দেখে এন্ট্রি নিবেন।
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Mini SVG Icons for Candlestick List
function CandleMiniSvg({ type }: { type: string }) {
  if (type === "hammer") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="12" x2="16" y2="28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="6" width="10" height="7" rx="1" fill="#10b981" />
      </svg>
    );
  }
  if (type === "inverted-hammer") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="4" x2="16" y2="20" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="19" width="10" height="7" rx="1" fill="#10b981" />
      </svg>
    );
  }
  if (type === "bullish-engulfing") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Red small candle */}
        <line x1="9" y1="11" x2="9" y2="22" stroke="#ef4444" strokeWidth="1" />
        <rect x="6.5" y="13" width="5" height="7" rx="0.5" fill="#ef4444" />
        {/* Green large candle */}
        <line x1="20" y1="5" x2="20" y2="27" stroke="#10b981" strokeWidth="1.5" />
        <rect x="16" y="8" width="8" height="16" rx="1" fill="#10b981" />
      </svg>
    );
  }
  if (type === "morning-star") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Red */}
        <line x1="6" y1="8" x2="6" y2="22" stroke="#ef4444" strokeWidth="1" />
        <rect x="4" y="10" width="4" height="10" rx="0.5" fill="#ef4444" />
        {/* Doji in middle */}
        <line x1="16" y1="18" x2="16" y2="27" stroke="#eab308" strokeWidth="1" />
        <line x1="14" y1="23" x2="18" y2="23" stroke="#eab308" strokeWidth="1.5" />
        {/* Green */}
        <line x1="26" y1="6" x2="26" y2="22" stroke="#10b981" strokeWidth="1" />
        <rect x="24" y="9" width="4" height="11" rx="0.5" fill="#10b981" />
      </svg>
    );
  }
  if (type === "piercing-line") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="10" y1="6" x2="10" y2="24" stroke="#ef4444" strokeWidth="1" />
        <rect x="7.5" y="8" width="5" height="13" rx="0.5" fill="#ef4444" />
        <line x1="20" y1="10" x2="20" y2="28" stroke="#10b981" strokeWidth="1" />
        <rect x="17.5" y="14" width="5" height="12" rx="0.5" fill="#10b981" />
      </svg>
    );
  }
  if (type === "three-soldiers") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="5" y="18" width="4" height="8" rx="0.5" fill="#10b981" />
        <rect x="13" y="12" width="4" height="9" rx="0.5" fill="#10b981" />
        <rect x="21" y="6" width="4" height="10" rx="0.5" fill="#10b981" />
      </svg>
    );
  }
  if (type === "dragonfly-doji") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="8" x2="16" y2="28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="8" x2="24" y2="8" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "shooting-star") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="4" x2="16" y2="20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="19" width="10" height="7" rx="1" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "hanging-man") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="12" x2="16" y2="28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <rect x="11" y="6" width="10" height="7" rx="1" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "bearish-engulfing") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Green small candle */}
        <line x1="9" y1="11" x2="9" y2="22" stroke="#10b981" strokeWidth="1" />
        <rect x="6.5" y="13" width="5" height="7" rx="0.5" fill="#10b981" />
        {/* Red large candle */}
        <line x1="20" y1="5" x2="20" y2="27" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="16" y="8" width="8" height="16" rx="1" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "evening-star") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Green */}
        <line x1="6" y1="10" x2="6" y2="24" stroke="#10b981" strokeWidth="1" />
        <rect x="4" y="12" width="4" height="10" rx="0.5" fill="#10b981" />
        {/* Doji top */}
        <line x1="16" y1="5" x2="16" y2="14" stroke="#eab308" strokeWidth="1" />
        <line x1="14" y1="9" x2="18" y2="9" stroke="#eab308" strokeWidth="1.5" />
        {/* Red */}
        <line x1="26" y1="10" x2="26" y2="26" stroke="#ef4444" strokeWidth="1" />
        <rect x="24" y="11" width="4" height="11" rx="0.5" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "dark-cloud") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="10" y1="8" x2="10" y2="26" stroke="#10b981" strokeWidth="1" />
        <rect x="7.5" y="11" width="5" height="12" rx="0.5" fill="#10b981" />
        <line x1="20" y1="4" x2="20" y2="22" stroke="#ef4444" strokeWidth="1" />
        <rect x="17.5" y="7" width="5" height="13" rx="0.5" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "three-crows") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="5" y="6" width="4" height="8" rx="0.5" fill="#ef4444" />
        <rect x="13" y="11" width="4" height="9" rx="0.5" fill="#ef4444" />
        <rect x="21" y="17" width="4" height="10" rx="0.5" fill="#ef4444" />
      </svg>
    );
  }
  if (type === "gravestone-doji") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="4" x2="16" y2="24" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="24" x2="24" y2="24" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "classic-doji") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <line x1="16" y1="6" x2="16" y2="26" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="16" x2="25" y2="16" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "marubozu") {
    return (
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <rect x="7" y="6" width="8" height="20" rx="1" fill="#10b981" />
        <rect x="18" y="6" width="8" height="20" rx="1" fill="#ef4444" />
      </svg>
    );
  }
  // tweezer
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <line x1="10" y1="8" x2="10" y2="26" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="7.5" y="10" width="5" height="10" rx="0.5" fill="#ef4444" />
      <line x1="20" y1="8" x2="20" y2="26" stroke="#10b981" strokeWidth="1.5" />
      <rect x="17.5" y="12" width="5" height="10" rx="0.5" fill="#10b981" />
      <line x1="6" y1="26" x2="24" y2="26" stroke="#facc15" strokeDasharray="1 1" strokeWidth="1" />
    </svg>
  );
}

// Detailed Candlestick Diagram with Levels and Labels
function CandleSvgDiagram({ type }: { type: string }) {
  if (type === "hammer") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        {/* Support Line */}
        <line x1="20" y1="75" x2="220" y2="75" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="25" y="90" fill="#60a5fa" fontSize="9" fontWeight="bold">Strong Support Level</text>
        
        {/* Downtrend red candles */}
        <line x1="45" y1="20" x2="45" y2="52" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="39" y="26" width="12" height="22" rx="1" fill="#ef4444" />
        
        <line x1="75" y1="35" x2="75" y2="68" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="69" y="42" width="12" height="20" rx="1" fill="#ef4444" />
        
        {/* Hammer Candle */}
        <line x1="115" y1="46" x2="115" y2="82" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="108" y="44" width="14" height="13" rx="1.5" fill="#10b981" stroke="#34d399" strokeWidth="1" />
        <text x="96" y="36" fill="#34d399" fontSize="10" fontWeight="bold">Hammer</text>
        <text x="118" y="92" fill="#9ca3af" fontSize="8">2x Lower Wick</text>
        
        {/* Confirmation Green Candle */}
        <line x1="160" y1="25" x2="160" y2="60" stroke="#10b981" strokeWidth="1.5" />
        <rect x="153" y="30" width="14" height="26" rx="1.5" fill="#10b981" />
        
        {/* Call arrow */}
        <path d="M 185 55 L 205 30" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <circle cx="170" cy="42" r="4" fill="#f59e0b" />
        <text x="180" y="24" fill="#34d399" fontSize="10" fontWeight="black">CALL ↗ (1 Min)</text>
      </svg>
    );
  }

  if (type === "bullish-engulfing") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        <line x1="20" y1="78" x2="220" y2="78" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="25" y="92" fill="#60a5fa" fontSize="9" fontWeight="bold">Support Zone</text>
        
        {/* Prior Red Candle */}
        <line x1="85" y1="40" x2="85" y2="72" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="79" y="47" width="12" height="20" rx="1" fill="#ef4444" />
        <text x="68" y="42" fill="#f87171" fontSize="8">Small Body</text>
        
        {/* Bullish Engulfing Candle */}
        <line x1="125" y1="28" x2="125" y2="76" stroke="#10b981" strokeWidth="2" />
        <rect x="117" y="34" width="16" height="38" rx="1.5" fill="#10b981" stroke="#34d399" strokeWidth="1" />
        <text x="108" y="22" fill="#34d399" fontSize="10" fontWeight="bold">Engulfing Body</text>
        
        {/* Next Call Entry */}
        <line x1="165" y1="18" x2="165" y2="55" stroke="#10b981" strokeWidth="1.5" />
        <rect x="158" y="24" width="14" height="26" rx="1.5" fill="#10b981" />
        <circle cx="150" cy="40" r="4" fill="#f59e0b" />
        <text x="175" y="32" fill="#34d399" fontSize="10" fontWeight="black">CALL ↗ Next</text>
      </svg>
    );
  }

  if (type === "morning-star") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        <line x1="20" y1="80" x2="220" y2="80" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* 1st Bearish */}
        <line x1="60" y1="25" x2="60" y2="72" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="53" y="32" width="14" height="34" rx="1" fill="#ef4444" />
        <text x="46" y="22" fill="#ef4444" fontSize="8" fontWeight="bold">1. Large Red</text>
        
        {/* 2nd Star / Doji */}
        <line x1="100" y1="62" x2="100" y2="84" stroke="#eab308" strokeWidth="1.5" />
        <line x1="94" y1="73" x2="106" y2="73" stroke="#eab308" strokeWidth="2" />
        <text x="86" y="93" fill="#facc15" fontSize="8" fontWeight="bold">2. Star</text>
        
        {/* 3rd Bullish */}
        <line x1="140" y1="28" x2="140" y2="74" stroke="#10b981" strokeWidth="1.5" />
        <rect x="133" y="36" width="14" height="32" rx="1" fill="#10b981" />
        <text x="126" y="22" fill="#10b981" fontSize="8" fontWeight="bold">3. Large Green</text>
        
        <circle cx="160" cy="45" r="4" fill="#f59e0b" />
        <text x="168" y="48" fill="#34d399" fontSize="10" fontWeight="black">CALL ↗ (BUY)</text>
      </svg>
    );
  }

  if (type === "shooting-star") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        {/* Resistance Line */}
        <line x1="20" y1="28" x2="220" y2="28" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="25" y="20" fill="#f87171" fontSize="9" fontWeight="bold">Strong Resistance Level</text>
        
        {/* Uptrend green candles */}
        <line x1="50" y1="45" x2="50" y2="82" stroke="#10b981" strokeWidth="1.5" />
        <rect x="44" y="50" width="12" height="24" rx="1" fill="#10b981" />
        
        <line x1="85" y1="30" x2="85" y2="68" stroke="#10b981" strokeWidth="1.5" />
        <rect x="79" y="38" width="12" height="22" rx="1" fill="#10b981" />
        
        {/* Shooting Star Candle */}
        <line x1="125" y1="22" x2="125" y2="58" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="118" y="47" width="14" height="12" rx="1.5" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
        <text x="105" y="72" fill="#f87171" fontSize="10" fontWeight="bold">Shooting Star</text>
        <text x="115" y="16" fill="#9ca3af" fontSize="8">Rejection Wick</text>
        
        {/* Confirmation Red Candle */}
        <line x1="165" y1="48" x2="165" y2="85" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="158" y="52" width="14" height="26" rx="1.5" fill="#ef4444" />
        
        <circle cx="152" cy="62" r="4" fill="#f59e0b" />
        <text x="178" y="66" fill="#ef4444" fontSize="10" fontWeight="black">PUT ↘ (1 Min)</text>
      </svg>
    );
  }

  if (type === "bearish-engulfing") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        <line x1="20" y1="26" x2="220" y2="26" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="25" y="18" fill="#f87171" fontSize="9" fontWeight="bold">Resistance Zone</text>
        
        {/* Prior Green */}
        <line x1="85" y1="34" x2="85" y2="68" stroke="#10b981" strokeWidth="1.5" />
        <rect x="79" y="39" width="12" height="20" rx="1" fill="#10b981" />
        <text x="68" y="34" fill="#34d399" fontSize="8">Small Green</text>
        
        {/* Bearish Engulfing Candle */}
        <line x1="125" y1="24" x2="125" y2="76" stroke="#ef4444" strokeWidth="2" />
        <rect x="117" y="30" width="16" height="40" rx="1.5" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
        <text x="108" y="85" fill="#ef4444" fontSize="10" fontWeight="bold">Engulfing Red</text>
        
        {/* Next Red */}
        <line x1="165" y1="45" x2="165" y2="85" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="158" y="50" width="14" height="26" rx="1.5" fill="#ef4444" />
        <circle cx="150" cy="60" r="4" fill="#f59e0b" />
        <text x="175" y="65" fill="#ef4444" fontSize="10" fontWeight="black">PUT ↘ Next</text>
      </svg>
    );
  }

  if (type === "evening-star") {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-full select-none">
        <line x1="20" y1="24" x2="220" y2="24" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* 1st Bullish */}
        <line x1="60" y1="30" x2="60" y2="78" stroke="#10b981" strokeWidth="1.5" />
        <rect x="53" y="36" width="14" height="34" rx="1" fill="#10b981" />
        <text x="46" y="88" fill="#10b981" fontSize="8" fontWeight="bold">1. Large Green</text>
        
        {/* 2nd Star / Doji at top */}
        <line x1="100" y1="18" x2="100" y2="38" stroke="#eab308" strokeWidth="1.5" />
        <line x1="94" y1="26" x2="106" y2="26" stroke="#eab308" strokeWidth="2" />
        <text x="88" y="14" fill="#facc15" fontSize="8" fontWeight="bold">2. Star</text>
        
        {/* 3rd Bearish */}
        <line x1="140" y1="30" x2="140" y2="78" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="133" y="38" width="14" height="34" rx="1" fill="#ef4444" />
        <text x="126" y="88" fill="#ef4444" fontSize="8" fontWeight="bold">3. Large Red</text>
        
        <circle cx="160" cy="55" r="4" fill="#f59e0b" />
        <text x="168" y="58" fill="#ef4444" fontSize="10" fontWeight="black">PUT ↘ (SELL)</text>
      </svg>
    );
  }

  // Generic Candlestick Pattern Diagram with clear support/resistance
  return (
    <svg viewBox="0 0 240 100" className="w-full h-full select-none">
      <line x1="20" y1="50" x2="220" y2="50" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="25" y="45" fill="#facc15" fontSize="8" fontWeight="bold">Key Pivot Level (S/R)</text>
      
      {/* Candle 1 */}
      <line x1="70" y1="30" x2="70" y2="70" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="64" y="38" width="12" height="24" rx="1" fill="#ef4444" />
      
      {/* Candle 2 - Reversal Pin / Pattern */}
      <line x1="110" y1="25" x2="110" y2="75" stroke="#10b981" strokeWidth="2" />
      <rect x="103" y="42" width="14" height="16" rx="1" fill="#10b981" />
      
      {/* Candle 3 - Confirmation */}
      <line x1="150" y1="20" x2="150" y2="60" stroke="#10b981" strokeWidth="1.5" />
      <rect x="143" y="26" width="14" height="26" rx="1" fill="#10b981" />
      
      <circle cx="170" cy="36" r="4" fill="#f59e0b" />
      <text x="178" y="40" fill="#34d399" fontSize="10" fontWeight="black">Confirm & Trade ↗</text>
    </svg>
  );
}
