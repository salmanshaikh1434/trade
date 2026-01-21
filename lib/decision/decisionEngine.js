import { extractFeatures } from '../candles/features';
import { detectPatterns } from '../candles/patterns';
import { getEMATrend } from '../indicators/ema.js';

/**
 * Generate trading signal based on EMA and candlestick patterns
 * @param {Array} candles - Array of raw candles
 * @param {Array} ema30 - EMA-30 values
 * @param {Array} ema50 - EMA-50 values
 * @param {number} buyingPrice - Optional: User's buying price to calculate position-based advice
 * @returns {Object} - Trading signal with score, decision, reasons, and position analysis
 */
export function getSignal(candles, ema30, ema50, buyingPrice = null) {
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

    // Position-based analysis (if buying price provided)
    let positionPL = null;
    let positionPLPercent = null;
    let positionVerdict = 'NO POSITION';
    let currentPrice = null;

    if (buyingPrice && candles.length > 0) {
        currentPrice = candles[candles.length - 1].close;
        positionPL = currentPrice - buyingPrice;
        positionPLPercent = (positionPL / buyingPrice) * 100;

        // Position-based verdict logic
        if (positionPLPercent >= 8) {
            // At or above +8% target
            positionVerdict = 'TAKE PROFIT';
        } else if (positionPLPercent > 0 && signal === 'BUY' && emaTrend === 'bullish') {
            // In profit and trend still strong
            positionVerdict = 'HOLD POSITION';
        } else if (positionPLPercent > 0 && (signal === 'SELL' || emaTrend === 'bearish')) {
            // In profit but trend weakening
            positionVerdict = 'CONSIDER EXIT';
        } else if (positionPLPercent <= -5) {
            // Stop-loss hit (-5%)
            if (signal === 'SELL' || emaTrend === 'bearish') {
                positionVerdict = 'CUT LOSS';
            } else if (signal === 'BUY' && confidence === 'High') {
                // Strong buy signal even at loss
                positionVerdict = 'HOLD/AVERAGE';
            } else {
                positionVerdict = 'REVIEW STOP';
            }
        } else if (positionPLPercent < 0) {
            // Small loss
            if (signal === 'BUY' && emaTrend === 'bullish') {
                positionVerdict = 'HOLD POSITION';
            } else {
                positionVerdict = 'MONITOR CLOSELY';
            }
        }
    }

    return {
        signal,
        score,
        confidence,
        reasons,
        patterns,
        emaTrend,
        // Position tracking fields
        currentPrice,
        buyingPrice,
        positionPL,
        positionPLPercent,
        positionVerdict,
    };
}
