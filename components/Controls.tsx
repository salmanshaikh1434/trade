'use client';

import { useState } from 'react';
import { Search, History, Calendar } from 'lucide-react';

interface ControlsProps {
    onFetch: (symbol: string, interval: string) => void;
    loading: boolean;
}

export default function Controls({ onFetch, loading }: ControlsProps) {
    const [symbol, setSymbol] = useState('NSE:RELIANCE');
    const [interval, setInterval] = useState('4h');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFetch(symbol, interval);
    };

    return (
        <div className="glass rounded-2xl p-6 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 space-y-2 w-full">
                    <label htmlFor="symbol" className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Search size={14} /> Symbol
                    </label>
                    <input
                        type="text"
                        id="symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g., NSE:RELIANCE"
                        disabled={loading}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="w-full md:w-48 space-y-2">
                    <label htmlFor="interval" className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Calendar size={14} /> Interval
                    </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="4h">4 Hours</option>
                        <option value="1day">1 Day</option>
                        <option value="1week">1 Week</option>
                        <option value="1h">1 Hour</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Loading...
                        </>
                    ) : (
                        'Analyze'
                    )}
                </button>
            </form>
        </div>
    );
}
