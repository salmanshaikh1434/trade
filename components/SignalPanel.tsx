'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import { savePosition, getPosition } from '@/lib/position/positionManager';

interface SignalData {
    signal: 'BUY' | 'SELL' | 'NO TRADE';
    score: number;
    confidence: 'High' | 'Medium' | 'Low';
    reasons: string[];
    patterns: string[];
    emaTrend: 'bullish' | 'bearish' | 'sideways';
    // Position tracking
    currentPrice?: number;
    buyingPrice?: number;
    positionPL?: number;
    positionPLPercent?: number;
    positionVerdict?: string;
}

export default function SignalPanel({ signalData, symbol }: { signalData: SignalData | null; symbol?: string }) {
    if (!signalData) {
        return (
            <div className="glass rounded-2xl p-6 h-full flex items-center justify-center">
                <p className="text-slate-500 italic">No signal data available</p>
            </div>
        );
    }

    const { signal, score, confidence, reasons, patterns, emaTrend } = signalData;

    const getSignalStyles = () => {
        if (signal === 'BUY') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
        if (signal === 'SELL') return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    };

    const getConfidenceStyles = () => {
        if (confidence === 'High') return 'text-emerald-400';
        if (confidence === 'Medium') return 'text-amber-400';
        return 'text-rose-400';
    };

    const getPositionVerdictStyles = (verdict: string) => {
        if (verdict.includes('PROFIT')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
        if (verdict.includes('HOLD')) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        if (verdict.includes('LOSS') || verdict.includes('CUT')) return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
        if (verdict.includes('EXIT')) return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    };

    const hasPosition = signalData?.buyingPrice && signalData?.currentPrice;
    const isProfitable = hasPosition && signalData.positionPL! > 0;

    return (
        <div className="glass rounded-2xl p-6 h-full flex flex-col space-y-6">
            {/* Position Status - Show if user has a position */}
            {hasPosition && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign size={14} />
                            Your Position
                        </h3>
                        <div className={`px-3 py-0.5 rounded-full border text-[10px] font-bold ${getPositionVerdictStyles(signalData.positionVerdict!)}`}>
                            {signalData.positionVerdict}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Buying Price</p>
                            <p className="text-sm font-mono font-bold text-slate-300">₹{signalData.buyingPrice?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Price</p>
                            <p className="text-sm font-mono font-bold text-slate-300">₹{signalData.currentPrice?.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${isProfitable ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <span className="text-xs font-medium text-slate-400">Profit/Loss</span>
                        <div className="text-right">
                            <div className={`flex items-center gap-1 font-mono font-bold text-sm ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfitable ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isProfitable ? '+' : ''}₹{signalData.positionPL?.toFixed(2)}
                            </div>
                            <div className={`text-xs font-bold ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ({isProfitable ? '+' : ''}{signalData.positionPLPercent?.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Signal */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200">Technical Signal</h2>
                <div className={`px-4 py-1 rounded-full border text-sm font-bold ${getSignalStyles()}`}>
                    {signal === 'NO TRADE' ? 'HOLD' : signal}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score</p>
                    <p className="text-xl font-bold text-slate-200">{score}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                    <p className={`text-lg font-bold ${getConfidenceStyles()}`}>{confidence}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trend</p>
                    <p className={`text-lg font-bold text-slate-200 capitalize`}>{emaTrend}</p>
                </div>
            </div>

            {patterns && patterns.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-widest">Detected Patterns</h3>
                    <div className="flex flex-wrap gap-2">
                        {patterns.map((pattern, index) => (
                            <span key={index} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium">
                                {pattern}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-grow">
                <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-widest">Analysis</h3>
                <ul className="space-y-2">
                    {reasons.map((reason, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-300">
                            <span className="text-blue-500 mr-2">•</span>
                            {reason}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                    ⚠️ DISCLAIMER: This is for educational purposes only. Not financial advice. Always perform your own research.
                </p>
            </div>
        </div>
    );
}
