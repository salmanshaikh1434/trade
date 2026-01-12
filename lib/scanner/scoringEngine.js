import { dailyTrendFilter } from './filters/dailyTrendFilter';
import { structureFilter } from './filters/structureFilter';
import { pullbackFilter } from './filters/pullbackFilter';

/**
 * Scoring Engine
 * Calculates objective score for stock based on multi-timeframe analysis
 * 
 * @param {Object} dailyData - { candles, trendResult, structureResult }
 * @param {Object} data4H - { candles, pullbackResult }
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} - { score, category, reasons, details }
 */
export function calculateScore(dailyData, data4H, direction = 'bullish') {
    let score = 0;
    const reasons = [];
    const details = {};

    // Extract filter results
    const { trendResult, structureResult } = dailyData;
    const { pullbackResult } = data4H;

    // 1. Daily Trend (max +3 points)
    if (trendResult.passed) {
        score += 3;
        reasons.push('Daily trend strong');
        details.dailyTrend = 'strong';

        // Bonus for very strong slope
        if (trendResult.slope > 1.0) {
            score += 1;
            reasons.push('Very strong EMA slope');
        }
    } else {
        details.dailyTrend = 'weak';
    }

    // 2. Structure Quality (max +2 points)
    if (structureResult.quality === 'strong') {
        score += 2;
        reasons.push('Strong structure quality');
        details.structure = 'strong';
    } else if (structureResult.quality === 'moderate') {
        score += 1;
        reasons.push('Moderate structure quality');
        details.structure = 'moderate';
    } else {
        details.structure = 'weak';
    }

    // 3. EMA Slope Strength (max +2 points)
    if (trendResult.slope && trendResult.slope > 0.8) {
        score += 2;
        reasons.push('Strong EMA slope');
    } else if (trendResult.slope && trendResult.slope > 0.5) {
        score += 1;
        reasons.push('Decent EMA slope');
    }

    // 4. 4H Pullback Setup (max +2 points)
    if (pullbackResult.inZone) {
        score += 2;
        reasons.push('Price in EMA zone (4H)');
        details.pullback = 'in_zone';
    } else {
        details.pullback = 'not_ready';
    }

    // 5. Compression Bonus (+1 point)
    if (pullbackResult.compression) {
        score += 1;
        reasons.push('Compression detected');
        details.compression = true;
    }

    // Penalties
    if (!trendResult.passed) {
        score -= 5;
        reasons.push('Against trend or weak trend');
    }

    if (!pullbackResult.passed && pullbackResult.reasons) {
        // Minor penalty for EMA misalignment on 4H
        if (pullbackResult.reasons.some(r => r.includes('not aligned'))) {
            score -= 2;
            reasons.push('4H EMAs misaligned');
        }
    }

    // Determine category
    let category;
    if (score >= 8) {
        category = 'READY';
    } else if (score >= 5) {
        category = 'WATCHLIST';
    } else {
        category = 'IGNORE';
    }

    return {
        score: Math.max(0, score), // Don't go negative
        category,
        direction,
        reasons,
        details,
        trendSlope: trendResult.slope || 0,
        structureQuality: structureResult.quality || 'unknown'
    };
}

/**
 * Score a single stock with full analysis
 * @param {string} symbol - Stock symbol
 * @param {Array} dailyCandles - Daily candlestick data
 * @param {Array} candles4H - 4H candlestick data
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} - Complete stock analysis with score
 */
export function scoreStock(symbol, dailyCandles, candles4H, direction = 'bullish') {
    // Apply filters
    const trendResult = dailyTrendFilter(dailyCandles, direction);
    const structureResult = structureFilter(dailyCandles);
    const pullbackResult = pullbackFilter(candles4H, direction);

    // Calculate score
    const scoreData = calculateScore(
        { candles: dailyCandles, trendResult, structureResult },
        { candles: candles4H, pullbackResult },
        direction
    );

    // Compile all reasons
    const allReasons = [
        ...trendResult.reasons,
        ...structureResult.reasons,
        ...pullbackResult.reasons
    ];

    return {
        symbol,
        ...scoreData,
        allReasons,
        filterResults: {
            dailyTrend: trendResult,
            structure: structureResult,
            pullback4H: pullbackResult
        }
    };
}
