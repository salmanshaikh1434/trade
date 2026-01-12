'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';

interface Candle {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface ChartProps {
    candles: Candle[];
    ema30: number[];
    ema50: number[];
}

export default function Chart({ candles, ema30, ema50 }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
                background: { type: ColorType.Solid, color: '#020617' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: '#334155',
            },
        });

        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderUpColor: '#10b981',
            borderDownColor: '#ef4444',
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        const ema30Series = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 2,
            title: 'EMA-30',
        });

        const ema50Series = chart.addLineSeries({
            color: '#f59e0b',
            lineWidth: 2,
            title: 'EMA-50',
        });

        if (candles && candles.length > 0) {
            const formattedCandles: CandlestickData[] = candles.map(c => ({
                time: c.time as any,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            }));
            candlestickSeries.setData(formattedCandles);
        }

        if (ema30 && ema30.length > 0 && candles.length > 0) {
            const startIndex = candles.length - ema30.length;
            const ema30Data: LineData[] = ema30.map((value, index) => ({
                time: candles[startIndex + index].time as any,
                value: value,
            }));
            ema30Series.setData(ema30Data);
        }

        if (ema50 && ema50.length > 0 && candles.length > 0) {
            const startIndex = candles.length - ema50.length;
            const ema50Data: LineData[] = ema50.map((value, index) => ({
                time: candles[startIndex + index].time as any,
                value: value,
            }));
            ema50Series.setData(ema50Data);
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [candles, ema30, ema50]);

    return (
        <div className="w-full glass rounded-2xl overflow-hidden p-4">
            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
}
