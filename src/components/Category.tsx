import { useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useStore } from "../store/useStore";
import { enToBn } from "../utils";

const COLORS = {
  'WIN': '#00e676',
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
  const { trades } = useStore();
  const [filter, setFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const [activeSegment, setActiveSegment] = useState<{name: string, value: number, color: string} | null>(null);

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
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00e676]/20 to-transparent flex items-center justify-center text-[#00e676] border border-[#00e676]/20">
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
        {/* Left: Donut Chart */}
        <div className="relative w-[90px] h-[90px] flex-shrink-0 -mt-2">
          {data.length > 0 ? (
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
                <span className={`font-black text-[11px] leading-tight my-0.5 ${activeSegment ? '' : 'text-white'}`} style={activeSegment ? { color: activeSegment.color } : {}}>
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
        <div className="flex flex-col gap-[1px] flex-1 pl-4 h-[92px] overflow-y-auto pr-1">
          {filteredTrades.length === 0 && <div className="text-xs text-slate-500 text-center mt-8">No records yet</div>}
          {filteredTrades.slice(0, 50).map((trade, idx) => (
            <div key={trade.id} className="flex flex-col">
              <div className="flex justify-between items-center bg-transparent py-[2px]">
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border shadow-sm ${trade.type === 'WIN' ? 'bg-[#00e676]/10 text-[#00e676] border-[#00e676]/30' : 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30'}`}>
                    {trade.type === 'WIN' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 17 9.2-9.2M17 17V7H7"/></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7 7.8 16.2M17 17H7V7"/></svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="tracking-wide uppercase text-[10px] font-bold text-slate-800 dark:text-slate-200">{trade.type}</span>
                    <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
                      {new Date(trade.date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className={`text-[11px] font-black drop-shadow-sm ${trade.type === 'WIN' ? 'text-[#00e676]' : 'text-[#ff4d4d]'}`}>
                  {trade.type === 'WIN' ? '+' : '-'}${trade.amount.toFixed(2)}
                </div>
              </div>
              {idx !== Math.min(filteredTrades.length, 50) - 1 && (
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-400 dark:via-white/40 to-transparent my-0 opacity-80"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
