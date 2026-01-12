import { EMA } from 'technicalindicators';

/**
 * Calculate Exponential Moving Average
 * @param {number[]} closes - Array of closing prices
 * @param {number} period - EMA period (e.g., 30, 50)
 * @returns {number[]} - Array of EMA values
 */
export function calculateEMA(closes, period) {
    if (!closes || closes.length === 0) {
        return [];
    }

    const emaValues = EMA.calculate({
        period: period,
        values: closes
    });

    return emaValues;
}

/**
 * Calculate both EMA-30 and EMA-50
 * @param {number[]} closes - Array of closing prices
 * @returns {{ ema30: number[], ema50: number[] }} - Object containing ema30 and ema50 arrays
 */
export function calculateEMAs(closes) {
    const ema30 = calculateEMA(closes, 30);
    const ema50 = calculateEMA(closes, 50);

    return { ema30, ema50 };
}

/**
 * Get the current EMA trend
 * @param {number[]} ema30 - EMA-30 values
 * @param {number[]} ema50 - EMA-50 values
 * @returns {string} - "bullish", "bearish", or "neutral"
 */
export function getEMATrend(ema30, ema50) {
    if (!ema30 || !ema50 || ema30.length === 0 || ema50.length === 0) {
        return 'neutral';
    }

    const current30 = ema30[ema30.length - 1];
    const current50 = ema50[ema50.length - 1];

    if (current30 > current50) {
        return 'bullish';
    } else if (current30 < current50) {
        return 'bearish';
    }

    return 'neutral';
}
