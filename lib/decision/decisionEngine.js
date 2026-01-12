import { extractFeatures } from '../candles/features';
import { detectPatterns } from '../candles/patterns';
import { getEMATrend } from '../indicators/ema.js';

/**
 * Generate trading signal based on EMA and candlestick patterns
 * @param {Array} candles - Array of raw candles
 * @param {Array} ema30 - EMA-30 values
 * @param {Array} ema50 - EMA-50 values
 * @returns {Object} - Trading signal with score, decision, and reasons
 */
export function getSignal(candles, ema30, ema50) {
    let score = 0;
    const reasons = [];

    // Extract candle features
    const candlesWithFeatures = extractFeatures(candles);

    // Detect patterns
    const { patterns, bullish: patternBullish, bearish: patternBearish } =
        detectPatterns(candlesWithFeatures);

    // Get EMA trend
    const emaTrend = getEMATrend(ema30, ema50);

    // Scoring system
    // 1. EMA Trend (max 3 points)
    if (emaTrend === 'bullish') {
        score += 3;
        reasons.push('✓ EMA-30 above EMA-50 (Bullish Trend)');
    } else if (emaTrend === 'bearish') {
        score -= 3;
        reasons.push('✗ EMA-30 below EMA-50 (Bearish Trend)');
    } else {
        reasons.push('○ EMA-30 and EMA-50 Neutral');
    }

    // 2. Candlestick Patterns (max 4 points)
    if (patternBullish) {
        score += 4;
        reasons.push(`✓ Bullish Pattern(s): ${patterns.filter(p =>
            p === 'Bullish Engulfing' || p === 'Hammer').join(', ')}`);
    }

    if (patternBearish) {
        score -= 4;
        reasons.push(`✗ Bearish Pattern(s): ${patterns.filter(p =>
            p === 'Bearish Engulfing' || p === 'Shooting Star').join(', ')}`);
    }

    // Add neutral patterns to reasons
    const neutralPatterns = patterns.filter(p => p === 'Doji');
    if (neutralPatterns.length > 0) {
        reasons.push(`○ Neutral Pattern(s): ${neutralPatterns.join(', ')}`);
    }

    // 3. Recent Price Action (max 2 points)
    if (candles.length >= 3) {
        const last3 = candles.slice(-3);
        const upMoves = last3.filter((c, i) => i > 0 && c.close > last3[i - 1].close).length;

        if (upMoves >= 2) {
            score += 2;
            reasons.push('✓ Recent upward momentum');
        } else if (upMoves === 0) {
            score -= 2;
            reasons.push('✗ Recent downward momentum');
        }
    }

    // Determine signal
    let signal;
    let confidence;

    if (score >= 5) {
        signal = 'BUY';
        confidence = 'High';
    } else if (score >= 3) {
        signal = 'BUY';
        confidence = 'Medium';
    } else if (score <= -5) {
        signal = 'SELL';
        confidence = 'High';
    } else if (score <= -3) {
        signal = 'SELL';
        confidence = 'Medium';
    } else {
        signal = 'NO TRADE';
        confidence = 'Low';
    }

    return {
        signal,
        score,
        confidence,
        reasons,
        patterns,
        emaTrend,
    };
}
