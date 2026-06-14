import { useState } from "react";
import { downloadHTMLTable } from "../lib/download";

import { enToBn } from "../utils";

export function CalculatorTab() {
  const [balance, setBalance] = useState(100);
  const [dailyPct, setDailyPct] = useState(5);
  const [days, setDays] = useState(30);

  const calculateProjection = () => {
    let curr = balance;
    const data = [];
    for (let i = 1; i <= days; i++) {
      const open = curr;
      const profit = curr * (dailyPct / 100);
      const close = curr + profit;
      data.push({ day: i, open, profit, close });
      curr = close;
    }
    return data;
  };

  const projection = calculateProjection();
  const finalBalance = projection.length ? projection[projection.length - 1].close : balance;
  const totalProfit = finalBalance - balance;

  const handleDownload = () => {
    const tableData = projection.map(row => [
      enToBn(row.day),
      `$${enToBn(row.open.toFixed(2))}`,
      `+$${enToBn(row.profit.toFixed(2))}`,
      `$${enToBn(row.close.toFixed(2))}`
    ]);
    downloadHTMLTable(tableData, ['দিন', 'শুরু', 'লাভ', 'শেষ'], `compound_projection_${days}days`);
  };

  return (
    <div className="flex flex-col pt-4 w-full z-10 px-2 space-y-4 pb-6 flex-1">
      <h2 className="text-xl font-bold text-primary text-center">কম্পাউন্ড ক্যালকুলেটর</h2>
      
      <div className="glass-panel rounded-[2rem] p-5 relative overflow-hidden space-y-4">
        <div className="grid grid-cols-3 gap-2">
           <div>
             <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">ব্যালেন্স ($)</label>
             <input type="number" onFocus={e => e.target.select()} value={balance || ''} onChange={e => setBalance(Number(e.target.value))} className="w-full inner-glass text-slate-900 dark:text-white focus:border-[#a855f7] focus:outline-none rounded-xl px-2 py-2.5 text-center font-mono transition-colors" />
           </div>
           <div>
             <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">ডেইলি (%)</label>
             <input type="number" onFocus={e => e.target.select()} value={dailyPct || ''} onChange={e => setDailyPct(Number(e.target.value))} className="w-full inner-glass text-slate-900 dark:text-white focus:border-[#a855f7] focus:outline-none rounded-xl px-2 py-2.5 text-center font-mono transition-colors" />
           </div>
           <div>
             <label className="text-[10px] text-secondary font-semibold mb-1 block uppercase">দিন</label>
             <input type="number" onFocus={e => e.target.select()} value={days || ''} onChange={e => setDays(Number(e.target.value))} className="w-full inner-glass text-slate-900 dark:text-white focus:border-[#a855f7] focus:outline-none rounded-xl px-2 py-2.5 text-center font-mono transition-colors" />
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-5 relative overflow-hidden">
         <div className="grid grid-cols-2 gap-4 text-center">
            <div>
               <span className="text-[10px] text-secondary uppercase font-bold block mb-1">সর্বমোট ব্যালেন্স</span>
               <span className="text-2xl font-black text-[#00e676]">${enToBn(finalBalance.toFixed(2))}</span>
            </div>
            <div>
               <span className="text-[10px] text-secondary uppercase font-bold block mb-1">মোট লাভ</span>
               <span className="text-2xl font-black text-primary">${enToBn(totalProfit.toFixed(2))}</span>
            </div>
         </div>
         <button onClick={handleDownload} className="w-full mt-5 bg-[#18181b] dark:bg-white text-white dark:text-slate-900 shadow-xl py-3.5 rounded-xl font-bold text-sm tracking-wide hover:opacity-90 transition-all flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            ডাউনলোড রুটিন (HTML)
         </button>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden text-xs font-mono relative">
         <table className="w-full text-center border-collapse">
            <thead className="bg-slate-100 dark:bg-white/5 text-secondary border-b border-slate-200 dark:border-white/5">
               <tr>
                  <th className="py-2.5 font-semibold">দিন</th>
                  <th className="py-2.5 font-semibold">শুরু</th>
                  <th className="py-2.5 font-semibold">লাভ</th>
                  <th className="py-2.5 font-semibold">শেষ</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-900 dark:text-white">
               {projection.map((row) => (
                 <tr key={row.day}>
                    <td className="py-2 text-secondary">{enToBn(row.day)}</td>
                    <td className="py-2">${enToBn(row.open.toFixed(2))}</td>
                    <td className="py-2 text-[#00e676]">+${enToBn(row.profit.toFixed(2))}</td>
                    <td className="py-2">${enToBn(row.close.toFixed(2))}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  );
}
