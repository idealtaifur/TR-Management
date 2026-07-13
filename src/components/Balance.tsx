import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "../store/useStore";
import { useMemo, useState } from "react";

export function Balance() {
  const { balance, profile, trades, dailyTarget, masaniello } = useStore();
  const [showBalance, setShowBalance] = useState(true);
  
  const startBal = dailyTarget.dayStartBalance || profile.startingBalance;
  
  const profit = Number((balance - startBal).toFixed(2));
  const profitPct = startBal > 0 ? (profit / startBal) * 100 : 0;
  
  // Real trades data
  const [timeRange, setTimeRange] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [showDropdown, setShowDropdown] = useState(false);

  const data = useMemo(() => {
    let filteredTrades = [...trades];
    const now = new Date();
    
    if (timeRange === 'today') {
      const currentDayStr = now.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' });
      filteredTrades = filteredTrades.filter(t => new Date(t.date).toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' }) === currentDayStr);
    } else if (timeRange === 'weekly') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (timeRange === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.date) >= oneMonthAgo);
    }
    
    filteredTrades.reverse();

    // Determine the baseline start balance for the period
    // If today, use dayStartBalance if available. Otherwise, attempt to backtrack from current balance
    let baseline = startBal;
    if (timeRange !== 'today') {
        let backwardsBal = balance;
        for (let t of [...filteredTrades].reverse()) {
            if (t.type === 'WIN') backwardsBal -= t.amount;
            else backwardsBal += t.amount;
        }
        baseline = backwardsBal;
    }

    let currentVal = baseline;
    const chartData = [{ time: "Start", value: baseline }];
    let currentTime = new Date("2024-01-01T12:00:00");
    
    filteredTrades.forEach((t, i) => {
      if (t.type === 'WIN') {
        currentVal += t.amount;
      } else {
        currentVal -= t.amount;
      }
      currentTime.setMinutes(currentTime.getMinutes() + 5);
      const timeStr = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      chartData.push({ time: timeStr, value: currentVal });
    });
    
    while (chartData.length < 9) {
      currentTime.setMinutes(currentTime.getMinutes() + 5);
      const timeStr = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      chartData.push({ time: currentVal === baseline && filteredTrades.length === 0 ? "12:00" : timeStr, value: currentVal });
    }
    
    return chartData;
  }, [trades, startBal, balance, timeRange]);

  const rangeProfit = useMemo(() => {
    if (data.length > 0) {
      return data[data.length - 1].value - data[0].value;
    }
    return 0;
  }, [data]);
  const rangeProfitPct = data.length > 0 && data[0].value > 0 ? (rangeProfit / data[0].value) * 100 : 0;

  const dataMin = Math.min(...data.map((d) => d.value));
  const dataMax = Math.max(...data.map((d) => d.value));

  return (
    <div className="glass-panel-3d rounded-[2rem] flex flex-col relative z-10 w-full mb-3 overflow-hidden min-h-[200px] transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex justify-between items-start p-4 pb-2 relative z-10">
        <div className="flex flex-col">
          <div 
            className="flex items-center gap-1.5 text-secondary font-semibold tracking-wider text-[10px] uppercase mb-1 flex-shrink-0 cursor-pointer transition-colors hover:text-slate-700 dark:hover:text-slate-300"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            )}
            Total Balance
          </div>
          <div className="text-3xl leading-none font-bold text-primary mb-1.5 tracking-tight transition-all duration-300">
             {showBalance ? `$${balance.toFixed(2)}` : '••••••'}
          </div>
          <div className={`${rangeProfit >= 0 ? 'text-[#059669]' : 'text-red-500'} text-xs font-semibold flex items-center gap-1`}>
            {rangeProfit >= 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            )}
             {rangeProfit >= 0 ? '+' : '-'}${Math.abs(rangeProfit).toFixed(2)} ({Math.abs(rangeProfitPct).toFixed(2)}%)
          </div>
        </div>
        
        <div className="relative z-50">
          <button onClick={() => setShowDropdown(!showDropdown)} className="bg-black/5 dark:bg-white/10 text-[10px] flex-shrink-0 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 text-primary border border-slate-200/50 dark:border-white/10 mt-1 hover:bg-black/10 dark:hover:bg-white/20 transition-all">
            {timeRange === 'today' ? 'আজকের' : timeRange === 'weekly' ? 'সাপ্তাহিক' : 'মাসিক'}
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          
          {showDropdown && (
             <div className="absolute top-full right-0 mt-1 bg-white dark:bg-[#0b1621] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1 w-24">
                <button onClick={() => { setTimeRange('today'); setShowDropdown(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${timeRange === 'today' ? 'bg-[#059669]/10 text-[#059669]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>আজকের</button>
                <button onClick={() => { setTimeRange('weekly'); setShowDropdown(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${timeRange === 'weekly' ? 'bg-[#059669]/10 text-[#059669]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>সাপ্তাহিক</button>
                <button onClick={() => { setTimeRange('monthly'); setShowDropdown(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${timeRange === 'monthly' ? 'bg-[#059669]/10 text-[#059669]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>মাসিক</button>
             </div>
          )}
        </div>
      </div>

      <div className="absolute left-0 right-0 bottom-0 top-[75px] z-0 overflow-hidden pointer-events-none">
        <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
            <defs>
              <linearGradient id="colorValueGood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorValueBad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 500 }} 
              dy={-14} 
              height={0}
              interval="preserveStartEnd"
              minTickGap={15}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis 
              hide={true}
              width={0}
              domain={[
                (dataMin: number) => dataMin - Math.max(0.1, (dataMax - dataMin) * 0.15),
                (dataMax: number) => dataMax + Math.max(0.1, (dataMax - dataMin) * 0.2)
              ]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", boxShadow: "0 8px 16px rgba(0,0,0,0.2)", backdropFilter: "blur(8px)", pointerEvents: 'auto' }} 
              itemStyle={{ color: rangeProfit >= 0 ? "#059669" : "#ef4444", fontWeight: "bold" }}
              cursor={{ stroke: "rgba(148, 163, 184, 0.3)", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area 
              type="linear" 
              dataKey="value" 
              stroke={rangeProfit >= 0 ? "#059669" : "#ef4444"} 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill={rangeProfit >= 0 ? "url(#colorValueGood)" : "url(#colorValueBad)"} 
              style={{ outline: 'none' }}
              activeDot={{ outline: 'none', stroke: 'none', fill: rangeProfit >= 0 ? "#059669" : "#ef4444" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
