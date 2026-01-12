/**
 * Detect Bullish Engulfing Pattern
 * @param {Object} prev - Previous candle with features
 * @param {Object} curr - Current candle with features
 * @returns {boolean} - True if pattern detected
 */
export function bullishEngulfing(prev, curr) {
    return (
        prev.isBearish &&
        curr.isBullish &&
        curr.open < prev.close &&
        curr.close > prev.open
    );
}

/**
 * Detect Bearish Engulfing Pattern
 * @param {Object} prev - Previous candle with features
 * @param {Object} curr - Current candle with features
 * @returns {boolean} - True if pattern detected
 */
export function bearishEngulfing(prev, curr) {
    return (
        prev.isBullish &&
        curr.isBearish &&
        curr.open > prev.close &&
        curr.close < prev.open
    );
}

/**
 * Detect Hammer Pattern
 * @param {Object} candle - Candle with features
 * @returns {boolean} - True if pattern detected
 */
export function hammer(candle) {
    return (
        candle.lowerWick > candle.bodySize * 2 &&
        candle.upperWick < candle.bodySize * 0.5 &&
        candle.bodyPercent > 0.1
    );
}

/**
 * Detect Shooting Star Pattern
 * @param {Object} candle - Candle with features
 * @returns {boolean} - True if pattern detected
 */
export function shootingStar(candle) {
    return (
        candle.upperWick > candle.bodySize * 2 &&
        candle.lowerWick < candle.bodySize * 0.5 &&
        candle.bodyPercent > 0.1
    );
}

/**
 * Detect Doji Pattern
 * @param {Object} candle - Candle with features
 * @returns {boolean} - True if pattern detected
 */
export function doji(candle) {
    return candle.isDoji;
}

/**
 * Detect all patterns in the last 2 candles
 * @param {Array} candles - Array of candles with features (at least 2)
 * @returns {Object} - Object with detected patterns
 */
export function detectPatterns(candles) {
    if (candles.length < 2) {
        return { patterns: [], bullish: false, bearish: false };
    }

    const prev = candles[candles.length - 2];
    const curr = candles[candles.length - 1];

    const patterns = [];
    let bullish = false;
    let bearish = false;

    if (bullishEngulfing(prev, curr)) {
        patterns.push('Bullish Engulfing');
        bullish = true;
    }

    if (bearishEngulfing(prev, curr)) {
        patterns.push('Bearish Engulfing');
        bearish = true;
    }

    if (hammer(curr)) {
        patterns.push('Hammer');
        bullish = true;
    }

    if (shootingStar(curr)) {
        patterns.push('Shooting Star');
        bearish = true;
    }

    if (doji(curr)) {
        patterns.push('Doji');
    }

    return { patterns, bullish, bearish };
}
