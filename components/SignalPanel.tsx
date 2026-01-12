'use client';

interface SignalData {
    signal: 'BUY' | 'SELL' | 'NO TRADE';
    score: number;
    confidence: 'High' | 'Medium' | 'Low';
    reasons: string[];
    patterns: string[];
    emaTrend: 'bullish' | 'bearish' | 'sideways';
}

export default function SignalPanel({ signalData }: { signalData: SignalData | null }) {
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

    return (
        <div className="glass rounded-2xl p-6 h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200">Trading Verdict</h2>
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
