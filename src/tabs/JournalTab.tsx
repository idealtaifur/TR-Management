import { useState } from "react";
import { useStore, Mood } from "../store/useStore";

const MOODS: Mood[] = ['😊 ভালো', '🧘 শান্ত', '🎯 ফোকাসড', '😰 চাপে', '😔 হতাশ'];

export function JournalTab() {
  const { journals, addJournal, deleteJournal } = useStore();
  
  const [selectedMood, setSelectedMood] = useState<Mood>('😊 ভালো');
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!note.trim()) return;
    addJournal({ mood: selectedMood, note });
    setNote("");
  };

  return (
    <div className="flex flex-col pt-4 w-full z-10 px-2 space-y-4 pb-6 flex-1">
      <h2 className="text-xl font-bold text-primary text-center">ট্রেডিং ডায়েরি</h2>
      
      <div className="glass-panel rounded-[2rem] p-5 relative overflow-hidden space-y-4">
        <div>
           <label className="text-[10px] text-secondary font-semibold mb-2 block uppercase">আজকের ট্রেডিং সাইকোলজি কেমন?</label>
           <div className="flex flex-wrap gap-2">
             {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm ${selectedMood === m ? 'bg-[#059669]/20 border-[#059669]/50 text-[#059669]' : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-secondary'}`}
                >
                  {m}
                </button>
             ))}
           </div>
        </div>

        <div>
           <textarea 
             value={note}
             onChange={e => setNote(e.target.value)}
             placeholder="আজ কেন জিতলে/হারলে? কী শিখলে?"
             className="w-full inner-glass text-slate-900 dark:text-white rounded-xl p-3 text-sm min-h-[100px] placeholder-secondary focus:border-[#059669] focus:outline-none transition-colors resize-none relative z-10"
           />
        </div>

        <button onClick={handleSave} className="w-full bg-[#18181b] dark:bg-white text-white dark:text-slate-900 shadow-xl py-3.5 rounded-xl font-bold text-sm tracking-wide hover:opacity-90 transition-all">
          সেভ করুন
        </button>
      </div>

      <div className="space-y-3">
         {journals.length === 0 && (
           <p className="text-center text-secondary text-sm mt-8">এখনো কোনো ডায়েরি লেখা হয়নি।</p>
         )}
         {journals.map((entry) => (
           <div key={entry.id} className="glass-panel rounded-[2rem] p-5 relative overflow-hidden">
              <button 
                onClick={() => deleteJournal(entry.id)}
                className="absolute top-3 right-3 text-red-500/50 hover:text-red-500 transition-colors"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
              <div className="text-[10px] text-secondary font-medium mb-1">
                 {new Date(entry.date).toLocaleString()}
              </div>
              <div className="mb-1.5 flex">
                 <span className="text-[11px] font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 px-2.5 py-1 rounded-md shadow-sm border border-slate-300 dark:border-white/5 tracking-wide">{entry.mood}</span>
              </div>
              <p className="text-sm text-primary/80 leading-relaxed">{entry.note}</p>
           </div>
         ))}
      </div>
    </div>
  );
}
