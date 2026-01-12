'use client';

import { TrendingUp, TrendingDown, LayoutGrid, ArrowRight } from 'lucide-react';

interface Stock {
    symbol: string;
    direction: 'bullish' | 'bearish';
    score: number;
    category: 'READY' | 'WATCHLIST' | 'IGNORE';
    structureQuality: string;
    trendSlope: number;
    reasons: string[];
}

interface StockCardProps {
    stock: Stock;
    onViewChart: (symbol: string) => void;
}

export default function StockCard({ stock, onViewChart }: StockCardProps) {
    const getCategoryStyles = () => {
        switch (stock.category) {
            case 'READY': return 'border-emerald-500/30 bg-emerald-500/5';
            case 'WATCHLIST': return 'border-amber-500/30 bg-amber-500/5';
            case 'IGNORE': return 'border-slate-500/30 bg-slate-500/5';
            default: return 'border-white/10';
        }
    };

    const getBadgeStyles = () => {
        switch (stock.category) {
            case 'READY': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            case 'WATCHLIST': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
            case 'IGNORE': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
            default: return 'bg-white/10 text-slate-400';
        }
    };

    return (
        <div className={`glass border rounded-2xl p-5 flex flex-col space-y-4 transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-black/20 ${getCategoryStyles()}`}>
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-100">{stock.symbol.split(':')[1] || stock.symbol}</h3>
                    <div className="flex items-center gap-2">
                        {stock.direction === 'bullish' ? (
                            <TrendingUp size={14} className="text-emerald-400" />
                        ) : (
                            <TrendingDown size={14} className="text-rose-400" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${stock.direction === 'bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stock.direction}
                        </span>
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl px-3 py-1 text-center">
                    <span className="text-lg font-bold text-slate-200 leading-tight">{stock.score}</span>
                    <span className="text-[10px] text-slate-500 block">/ 10</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className={`px-3 py-0.5 rounded-full border text-[10px] font-bold ${getBadgeStyles()}`}>
                    {stock.category === 'READY' ? 'BUY' : stock.category === 'WATCHLIST' ? 'WATCH' : 'AVOID'}
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                    {stock.structureQuality}
                </span>
            </div>

            <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Trend Slope</span>
                    <span className="text-slate-200 font-medium">{stock.trendSlope?.toFixed(2)}%</span>
                </div>
                <ul className="space-y-1">
                    {stock.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{reason}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={() => onViewChart(stock.symbol)}
                className="w-full mt-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-medium transition-all group"
            >
                <LayoutGrid size={13} />
                View Details
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
        </div>
    );
}
