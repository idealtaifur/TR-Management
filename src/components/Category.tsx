import { useState, useMemo, useEffect } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useStore } from "../store/useStore";
import { enToBn } from "../utils";

const COLORS = {
  'WIN': '#059669',
  'তাড়াহুড়া করে ট্রেড': '#ff9800',
  'ট্রেন্ডের বিপরীতে ট্রেড': '#ff9800',
  'ইমোশনাল ট্রেড': '#9c27b0',
  'FOMO': '#e91e63',
  'মার্কেট খারাপ': '#3b82f6',
  'এনালাইসিস করিনি': '#607d8b',
  'অন্যান্য': '#9e9e9e',
  'অজানা কারণ': '#424242'
};

export function Category() {
  const { trades, masaniello, dailyTarget } = useStore();
  const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const [activeSegment, setActiveSegment] = useState<{name: string, value: number, color: string} | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkCooldown = () => {
      const masaTime = masaniello.cooldownUntil ? new Date(masaniello.cooldownUntil).getTime() : 0;
      const dailyTime = dailyTarget.cooldownUntil ? new Date(dailyTarget.cooldownUntil).getTime() : 0;
      const targetTime = Math.max(masaTime, dailyTime);
      const now = Date.now();
      
      if (targetTime > now) {
        setTimeLeft(targetTime - now);
      } else {
        setTimeLeft(null);
      }
    };

    checkCooldown();
    const intv = setInterval(checkCooldown, 1000);
    return () => clearInterval(intv);
  }, [masaniello.cooldownUntil, dailyTarget.cooldownUntil]);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const today = new Date();
      
      if (filter === 'Daily') {
         return tradeDate.getDate() === today.getDate() &&
                tradeDate.getMonth() === today.getMonth() &&
                tradeDate.getFullYear() === today.getFullYear();
      } else if (filter === 'Weekly') {
         const day = today.getDay();
         const diff = today.getDate() - day + (day === 0 ? -6 : 1);
         const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diff);
         startOfWeek.setHours(0, 0, 0, 0);
         return tradeDate.getTime() >= startOfWeek.getTime();
      } else {
         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
         startOfMonth.setHours(0, 0, 0, 0);
         return tradeDate.getTime() >= startOfMonth.getTime();
      }
    });
  }, [trades, filter]);

  const stats = filteredTrades.reduce((acc, trade) => {
    if (trade.type === 'WIN') {
      acc['WIN'] = (acc['WIN'] || 0) + trade.amount;
    } else {
      const reason = trade.lossReason || 'অজানা কারণ';
      acc[reason] = (acc[reason] || 0) + trade.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(stats).map(key => ({
    name: key,
    value: stats[key],
    color: COLORS[key as keyof typeof COLORS] || COLORS['অজানা কারণ'],
  })).sort((a, b) => b.value - a.value);

  const totalVol = filteredTrades.reduce((acc, obj) => acc + obj.amount, 0);

  const todayTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const today = new Date();
      return (
        tradeDate.getDate() === today.getDate() &&
        tradeDate.getMonth() === today.getMonth() &&
        tradeDate.getFullYear() === today.getFullYear()
      );
    });
  }, [trades]);

  const todayVol = todayTrades.reduce((acc, obj) => acc + obj.amount, 0);

  return (
    <div className="glass-panel rounded-[1.4rem] px-3.5 py-3 flex flex-col relative z-10 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white/90 text-[11px] tracking-wide">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#059669]/20 to-transparent flex items-center justify-center text-[#059669] border border-[#059669]/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          ট্রেডিং হিস্টোরি
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 auto-cols-auto p-0.5 rounded-full border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-black/20 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none">
          {(['Daily', 'Weekly', 'Monthly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-[9px] outline-none focus:outline-none font-bold px-3.5 py-1.5 rounded-full transition-all duration-300 ${filter === tab ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none border border-slate-200/50 dark:border-transparent'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between flex-1 relative">
        {/* Left: Donut Chart or Stopwatch */}
        <div className="relative w-[90px] h-[90px] flex-shrink-0 -mt-2">
          {timeLeft !== null ? (
            (() => {
              const progress = Math.min(1, Math.max(0, timeLeft / 300000));
              const hue = (1 - progress) * 120;
              const dynamicColor = `hsl(${hue}, 80%, 50%)`;
              return (
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center relative bg-slate-800 dark:bg-black/40 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                   <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 90 90">
                     <circle cx="45" cy="45" r="41" className="stroke-slate-700 dark:stroke-white/10" strokeWidth="4" fill="none" />
                     <circle 
                       cx="45" cy="45" r="41" 
                       strokeWidth="4" 
                       fill="none" 
                       strokeLinecap="round"
                       strokeDasharray={257.6}
                       strokeDashoffset={257.6 * (1 - progress)}
                       style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear', stroke: dynamicColor }}
                     />
                   </svg>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-2 rounded-b-sm z-10" style={{ backgroundColor: dynamicColor }}></div>
                   <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-1.5 z-10" style={{ backgroundColor: dynamicColor, opacity: 0.5 }}></div>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mb-0.5 mt-2 opacity-50 z-10"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                   <span className="text-[12px] font-black font-mono tracking-wider drop-shadow-md z-10" style={{ color: dynamicColor }}>
                     {Math.floor(timeLeft / 60000)}:{(Math.floor(timeLeft / 1000) % 60).toString().padStart(2, '0')}
                   </span>
                   <span className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mt-0.5 z-10">Cooldown</span>
                </div>
              );
            })()
          ) : data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                <PieChart style={{ outline: 'none' }}>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={42}
                    stroke="none"
                    dataKey="value"
                    style={{ outline: 'none' }}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                         key={`cell-${index}`} 
                         fill={entry.color} 
                         style={{ outline: 'none', cursor: 'pointer' }}
                         className="focus:outline-none"
                         onClick={() => setActiveSegment(entry)}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div 
                 className="absolute inset-0 flex flex-col items-center justify-center mt-0.5 pointer-events-none"
              >
                <span className="text-[7px] text-slate-400 font-bold tracking-wide text-center leading-[1.1] max-w-[50px]">
                  {activeSegment ? activeSegment.name : 'Total Vol'}
                </span>
                <span className={`font-black text-[11px] leading-tight my-0.5 ${activeSegment ? '' : 'text-slate-800 dark:text-white'}`} style={activeSegment ? { color: activeSegment.color } : {}}>
                  ${activeSegment ? activeSegment.value.toFixed(2) : totalVol.toFixed(2)}
                </span>
                <span className="text-[7.5px] text-slate-400">
                  {activeSegment ? 'Vol' : `${filteredTrades.length} Trades`}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500">No Trades</span>
            </div>
          )}
        </div>

        {/* Right: Trade List */}
        <div className="flex flex-col flex-1 pl-4 h-[90px] overflow-y-auto overscroll-contain pr-1 py-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filteredTrades.length === 0 && <div className="text-[10px] text-slate-500 text-center mt-6">No records yet</div>}
          {filteredTrades.map((trade, idx) => (
            <div key={trade.id} className="flex flex-col">
              <div className="flex justify-between items-center bg-transparent py-[2px]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shadow-sm ${trade.type === 'WIN' ? 'bg-[#059669]/10 text-[#059669] border-[#059669]/30' : 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30'}`}>
                    {trade.type === 'WIN' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 9.2-9.2M17 17V7H7"/></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7 7.8 16.2M17 17H7V7"/></svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="tracking-wide uppercase text-[9px] font-bold text-slate-800 dark:text-slate-200">{trade.type}</span>
                    <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
                      {new Date(trade.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className={`text-[11px] font-bold drop-shadow-sm ${trade.type === 'WIN' ? 'text-[#059669]' : 'text-[#ff4d4d]'}`}>
                  {trade.type === 'WIN' ? '+' : '-'}${trade.amount.toFixed(2)}
                </div>
              </div>
              {idx !== filteredTrades.length - 1 && (
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-400 dark:via-white/20 to-transparent my-0 opacity-80"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
