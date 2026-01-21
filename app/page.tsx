'use client';

import { useState, useEffect } from 'react';
import Chart from '@/components/Chart';
import SignalPanel from '@/components/SignalPanel';
import Controls from '@/components/Controls';
import SuggesterPanel from '@/components/SuggesterPanel';
import { fetchCandles } from '@/lib/api/marketApi';
import { calculateEMAs } from '@/lib/indicators/ema';
import { getSignal } from '@/lib/decision/decisionEngine';
import { scanStocks } from '@/lib/scanner/stockScanner';
import { getDefaultUniverse } from '@/lib/config/stockUniverse';
import { initializeDefaultPosition, getPosition } from '@/lib/position/positionManager';
import { TrendingUp, LayoutGrid, Zap, Menu, Bell, User } from 'lucide-react';

export default function Home() {
    const [candles, setCandles] = useState<any[]>([]);
    const [ema30, setEma30] = useState<number[]>([]);
    const [ema50, setEma50] = useState<number[]>([]);
    const [signalData, setSignalData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [symbol, setSymbol] = useState('');
    const [interval, setInterval] = useState('');

    const [view, setView] = useState<'single' | 'scanner'>('single');
    const [scanResults, setScanResults] = useState<any>(null);
    const [scanning, setScanning] = useState(false);

    // Initialize default position on mount
    useEffect(() => {
        initializeDefaultPosition();
    }, []);

    const handleFetch = async (selectedSymbol: string, selectedInterval: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchCandles(selectedSymbol, selectedInterval);
            if (!data.candles || data.candles.length === 0) {
                throw new Error('No candle data received');
            }

            setCandles(data.candles);
            setSymbol(data.symbol);
            setInterval(data.interval);

            const closes = data.candles.map((c: any) => c.close);
            const { ema30: ema30Values, ema50: ema50Values } = calculateEMAs(closes) as { ema30: number[], ema50: number[] };

            setEma30(ema30Values);
            setEma50(ema50Values);

            // Get buying price from localStorage for this symbol
            const position = getPosition(selectedSymbol);
            const buyingPrice = position?.buyingPrice || undefined;

            const signal = getSignal(data.candles, ema30Values, ema50Values, buyingPrice);
            setSignalData(signal);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        setError(null);

        try {
            const universe = getDefaultUniverse();
            const results = await scanStocks(universe, 'bullish', undefined, true);
            setScanResults(results);
        } catch (err: any) {
            setError(err.message || 'Failed to scan market');
        } finally {
            setScanning(false);
        }
    };

    const handleViewChart = (stockSymbol: string) => {
        setView('single');
        handleFetch(stockSymbol, '4h');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 font-sans">
            {/* Sidebar/Navigation placeholder for premium feel */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <TrendingUp size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">TradeNext <span className="text-blue-500">Pro</span></h1>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">Alpha Terminal</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <button
                        onClick={() => setView('single')}
                        className={`hover:text-blue-400 transition-colors ${view === 'single' ? 'text-blue-400' : ''}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setView('scanner')}
                        className={`hover:text-blue-400 transition-colors ${view === 'scanner' ? 'text-blue-400' : ''}`}
                    >
                        Market Scanner
                    </button>
                    <a href="#" className="hover:text-white transition-colors">Portfolio</a>
                    <a href="#" className="hover:text-white transition-colors">Alerts</a>
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 transition-all">
                        <Bell size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                        <User size={20} className="text-slate-300" />
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-12 px-6 md:px-12 max-w-[1600px] mx-auto">
                {error && (
                    <div className="mb-8 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <Zap size={20} className="shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                        <button
                            onClick={() => setView('single')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'single' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <TrendingUp size={16} />
                            Analytics
                        </button>
                        <button
                            onClick={() => setView('scanner')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'scanner' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Scanner
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Live Market Connection Stable
                    </div>
                </div>

                {view === 'single' ? (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <Controls onFetch={handleFetch} loading={loading} />

                        {symbol ? (
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                                <div className="xl:col-span-3 space-y-6">
                                    <div className="flex items-end justify-between px-2">
                                        <div>
                                            <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter">{symbol.split(':')[1]}</h2>
                                            <span className="text-slate-500 font-bold text-sm tracking-widest">{symbol.split(':')[0]} EXCHANGE • {interval}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Candle</p>
                                            <p className="text-2xl font-mono font-bold text-emerald-400">
                                                {candles[candles.length - 1]?.close.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </p>
                                        </div>
                                    </div>

                                    <Chart candles={candles} ema30={ema30} ema50={ema50} />
                                </div>

                                <div className="space-y-8">
                                    <SignalPanel signalData={signalData} symbol={symbol} />

                                    {/* Additional Stats Card */}
                                    <div className="glass rounded-2xl p-6 border-white/5">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Market Stats</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 text-xs text-xs">Volatility</span>
                                                <span className="text-slate-200 text-sm font-bold font-mono">1.24%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 text-xs">Relative Vol</span>
                                                <span className="text-slate-200 text-sm font-bold font-mono">0.8x</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 text-xs">ATR (14)</span>
                                                <span className="text-slate-200 text-sm font-bold font-mono">14.2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass rounded-[3rem] py-32 text-center border-dashed border-white/10">
                                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all duration-[2000ms]">
                                    <TrendingUp size={40} className="text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-100 mb-4 tracking-tight">Ready to analyze the market?</h2>
                                <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
                                    Enter a symbol like <span className="text-blue-400 font-bold">HINDZINC</span> or <span className="text-blue-400 font-bold">NSE:INFY</span> and choose a timeframe to reveal professional grade trading insights.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <SuggesterPanel
                        results={scanResults}
                        onScan={handleScan}
                        scanning={scanning}
                        onViewChart={handleViewChart}
                    />
                )}
            </main>
        </div>
    );
}
