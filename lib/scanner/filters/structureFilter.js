import { calculateEMAs } from '../../indicators/ema.js';

/**
 * Structure Quality Filter
 * Checks for clean trends vs range-bound choppy markets
 * 
 * @param {Array} dailyCandles - Daily candlestick data (last 20-30 candles)
 * @returns {Object} - { passed: boolean, quality: string, reasons: string[] }
 */
export function structureFilter(dailyCandles) {
    if (!dailyCandles || dailyCandles.length < 20) {
        return {
            passed: false,
            quality: 'insufficient_data',
            reasons: ['Need at least 20 daily candles for structure analysis']
        };
    }

    const closes = dailyCandles.map(c => c.close);
    const highs = dailyCandles.map(c => c.high);
    const lows = dailyCandles.map(c => c.low);

    const { ema30, ema50 } = calculateEMAs(closes);

    const reasons = [];
    let quality = 'weak';
    let passed = false;

    // 1. Check EMA separation consistency
    const closes20 = closes.slice(-20);
    const ema30_20 = ema30.slice(-20);
    const ema50_20 = ema50.slice(-20);

    // Calculate average EMA separation
    let totalSeparation = 0;
    for (let i = 0; i < 20; i++) {
        if (ema30_20[i] && ema50_20[i]) {
            totalSeparation += Math.abs(ema30_20[i] - ema50_20[i]);
        }
    }
    const avgSeparation = totalSeparation / 20;
    const avgSeparationPercent = (avgSeparation / closes20[closes20.length - 1]) * 100;

    // 2. Detect range-bound market (overlapping candles)
    const priceRange = Math.max(...highs.slice(-20)) - Math.min(...lows.slice(-20));
    const avgPrice = closes20.reduce((a, b) => a + b, 0) / 20;
    const rangePercent = (priceRange / avgPrice) * 100;

    // 3. Check trend consistency (EMAs should not cross frequently)
    let crossCount = 0;
    for (let i = 1; i < ema30_20.length; i++) {
        if (ema30_20[i] && ema50_20[i] && ema30_20[i - 1] && ema50_20[i - 1]) {
            // Detect crossover
            const prevAbove = ema30_20[i - 1] > ema50_20[i - 1];
            const currAbove = ema30_20[i] > ema50_20[i];
            if (prevAbove !== currAbove) {
                crossCount++;
            }
        }
    }

    // Scoring
    const hasStrongSeparation = avgSeparationPercent > 0.5;
    const hasGoodRange = rangePercent > 5 && rangePercent < 25; // Not too tight, not too wide
    const hasConsistentTrend = crossCount <= 1; // Max 1 crossover in 20 days

    if (hasStrongSeparation) {
        reasons.push(`✓ Strong EMA separation (${avgSeparationPercent.toFixed(2)}%)`);
    } else {
        reasons.push(`✗ Weak EMA separation (${avgSeparationPercent.toFixed(2)}%)`);
    }

    if (hasGoodRange) {
        reasons.push(`✓ Good price range (${rangePercent.toFixed(1)}%)`);
    } else if (rangePercent <= 5) {
        reasons.push(`✗ Too tight range (${rangePercent.toFixed(1)}%) - choppy`);
    } else {
        reasons.push(`⚠ Wide range (${rangePercent.toFixed(1)}%) - volatile`);
    }

    if (hasConsistentTrend) {
        reasons.push(`✓ Consistent trend (${crossCount} crossover(s))`);
    } else {
        reasons.push(`✗ Inconsistent trend (${crossCount} crossovers) - choppy`);
    }

    // Determine quality
    const score = (hasStrongSeparation ? 1 : 0) + (hasGoodRange ? 1 : 0) + (hasConsistentTrend ? 1 : 0);

    if (score >= 3) {
        quality = 'strong';
        passed = true;
    } else if (score === 2) {
        quality = 'moderate';
        passed = true;
    } else {
        quality = 'weak';
        passed = false;
    }

    return {
        passed,
        quality,
        emaSeparation: avgSeparationPercent,
        rangePercent,
        crossovers: crossCount,
        reasons
    };
}
