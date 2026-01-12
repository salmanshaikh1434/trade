/**
 * Extract features from a candlestick
 * @param {Object} candle - Candlestick data with open, high, low, close
 * @returns {Object} - Candle with additional features
 */
export function candleFeatures(candle) {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const isBullish = candle.close > candle.open;
    const isBearish = candle.open > candle.close;

    return {
        ...candle,
        bodySize: body,
        upperWick: candle.high - Math.max(candle.open, candle.close),
        lowerWick: Math.min(candle.open, candle.close) - candle.low,
        bodyPercent: range > 0 ? body / range : 0,
        isBullish,
        isBearish,
        isDoji: body < range * 0.1, // Body less than 10% of range
    };
}

/**
 * Extract features from an array of candles
 * @param {Array} candles - Array of candlestick data
 * @returns {Array} - Array of candles with features
 */
export function extractFeatures(candles) {
    return candles.map(candle => candleFeatures(candle));
}
