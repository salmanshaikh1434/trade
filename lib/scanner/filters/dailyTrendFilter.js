import { calculateEMAs, getEMATrend } from '../../indicators/ema.js';

/**
 * Daily Trend Filter - Elimination Stage
 * Removes stocks with weak or contrary trends
 * 
 * @param {Array} dailyCandles - Daily candlestick data
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} - { passed: boolean, trend: string, slope: number, reasons: string[] }
 */
export function dailyTrendFilter(dailyCandles, direction = 'bullish') {
    if (!dailyCandles || dailyCandles.length < 50) {
        return {
            passed: false,
            trend: 'insufficient_data',
            slope: 0,
            reasons: ['Insufficient daily candle data (need at least 50)']
        };
    }

    const closes = dailyCandles.map(c => c.close);
    const { ema30, ema50 } = calculateEMAs(closes);

    if (!ema30.length || !ema50.length) {
        return {
            passed: false,
            trend: 'calculation_error',
            slope: 0,
            reasons: ['Failed to calculate EMAs']
        };
    }

    const currentPrice = closes[closes.length - 1];
    const current30 = ema30[ema30.length - 1];
    const current50 = ema50[ema50.length - 1];

    const emaTrend = getEMATrend(ema30, ema50);

    // Calculate EMA slope strength (percentage)
    const emaSeparation = Math.abs(current30 - current50);
    const slopePercent = (emaSeparation / currentPrice) * 100;

    const reasons = [];
    let passed = false;

    if (direction === 'bullish') {
        const priceAboveEMA50 = currentPrice > current50;
        const emaAligned = current30 > current50;
        const strongSlope = slopePercent > 0.5; // At least 0.5% separation

        if (emaAligned && priceAboveEMA50) {
            passed = true;
            reasons.push('✓ Daily uptrend confirmed (EMA-30 > EMA-50)');
            reasons.push(`✓ Price above EMA-50`);

            if (strongSlope) {
                reasons.push(`✓ Strong EMA slope (${slopePercent.toFixed(2)}%)`);
            } else {
                reasons.push(`⚠ Weak EMA slope (${slopePercent.toFixed(2)}%)`);
            }
        } else {
            if (!emaAligned) reasons.push('✗ EMA-30 not above EMA-50');
            if (!priceAboveEMA50) reasons.push('✗ Price below EMA-50');
        }
    } else {
        // Bearish trend
        const priceBelowEMA50 = currentPrice < current50;
        const emaAligned = current30 < current50;
        const strongSlope = slopePercent > 0.5;

        if (emaAligned && priceBelowEMA50) {
            passed = true;
            reasons.push('✓ Daily downtrend confirmed (EMA-30 < EMA-50)');
            reasons.push(`✓ Price below EMA-50`);

            if (strongSlope) {
                reasons.push(`✓ Strong EMA slope (${slopePercent.toFixed(2)}%)`);
            } else {
                reasons.push(`⚠ Weak EMA slope (${slopePercent.toFixed(2)}%)`);
            }
        } else {
            if (!emaAligned) reasons.push('✗ EMA-30 not below EMA-50');
            if (!priceBelowEMA50) reasons.push('✗ Price above EMA-50');
        }
    }

    return {
        passed,
        trend: emaTrend,
        slope: slopePercent,
        ema30: current30,
        ema50: current50,
        price: currentPrice,
        reasons
    };
}
