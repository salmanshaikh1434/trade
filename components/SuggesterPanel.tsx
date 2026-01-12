'use client';

import { useState } from 'react';
import { RefreshCw, LayoutGrid, Eye, EyeOff, AlertCircle } from 'lucide-react';
import StockCard from './StockCard';

interface SuggesterPanelProps {
    results: any;
    onScan: () => void;
    scanning: boolean;
    onViewChart: (symbol: string) => void;
}

export default function SuggesterPanel({ results, onScan, scanning, onViewChart }: SuggesterPanelProps) {
    const [activeTab, setActiveTab] = useState<'ready' | 'watchlist' | 'ignore'>('ready');

    if (!results && !scanning) {
        return (
            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw size={32} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Market Scanner</h2>
                <p className="text-slate-400 mb-8">Scan over 25 NSE stocks using advanced Multi-Timeframe EMA and Structure filters to find high-probability swing trading opportunities.</p>
                <button
                    onClick={onScan}
                    disabled={scanning}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-2xl mx-auto transition-all transform hover:scale-105"
                >
                    <RefreshCw size={20} className={scanning ? 'animate-spin' : ''} />
                    Start Market Scan
                </button>
            </div>
        );
    }

    if (scanning) {
        return (
            <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw size={32} className="text-blue-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Scanning Market...</h2>
                <p className="text-slate-400">Analyzing price structure and momentum on Daily and 4H timeframes using EMA crossovers and quality metrics.</p>
            </div>
        );
    }

    const { ready = [], watchlist = [], ignore = [], scannedAt, totalScanned } = results;

    const tabs = [
        { id: 'ready', label: 'READY TO TRADE', count: ready.length, color: 'emerald', icon: <Eye size={16} /> },
        { id: 'watchlist', label: 'WATCHLIST', count: watchlist.length, color: 'amber', icon: <LayoutGrid size={16} /> },
        { id: 'ignore', label: 'IGNORE', count: ignore.length, color: 'slate', icon: <EyeOff size={16} /> }
    ] as const;

    const getCurrentStocks = () => {
        switch (activeTab) {
            case 'ready': return ready;
            case 'watchlist': return watchlist;
            case 'ignore': return ignore;
            default: return [];
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <LayoutGrid size={28} className="text-blue-500" />
                        Market Insights
                    </h2>
                    {scannedAt && (
                        <p className="text-slate-500 mt-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Analyzed {totalScanned} stocks at {new Date(scannedAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={onScan}
                    disabled={scanning}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all group"
                >
                    <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${scanning ? 'animate-spin' : ''}`} />
                    Run New Scan
                </button>
            </div>

            <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        <span className={`ml-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px]`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {getCurrentStocks().length === 0 ? (
                    <div className="glass border-dashed rounded-3xl py-20 text-center">
                        <AlertCircle size={40} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No stocks found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getCurrentStocks().map((stock: any) => (
                            <StockCard
                                key={stock.symbol}
                                stock={stock}
                                onViewChart={onViewChart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
