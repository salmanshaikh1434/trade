import { calculateEMAs } from '../../indicators/ema.js';

/**
 * Pullback Filter - Setup Stage
 * Identifies 4H pullback opportunities into EMA zone
 * 
 * @param {Array} candles4H - 4H candlestick data
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Object} - { passed: boolean, inZone: boolean, compression: boolean, reasons: string[] }
 */
export function pullbackFilter(candles4H, direction = 'bullish') {
    if (!candles4H || candles4H.length < 50) {
        return {
            passed: false,
            inZone: false,
            compression: false,
            reasons: ['Insufficient 4H candle data (need at least 50)']
        };
    }

    const closes = candles4H.map(c => c.close);
    const { ema30, ema50 } = calculateEMAs(closes);

    if (!ema30.length || !ema50.length) {
        return {
            passed: false,
            inZone: false,
            compression: false,
            reasons: ['Failed to calculate 4H EMAs']
        };
    }

    const currentPrice = closes[closes.length - 1];
    const current30 = ema30[ema30.length - 1];
    const current50 = ema50[ema50.length - 1];

    const reasons = [];
    let passed = false;
    let inZone = false;
    let compression = false;

    // Check EMA alignment (should match daily trend direction)
    const emaAlignedBullish = current30 > current50;
    const emaAlignedBearish = current30 < current50;

    if (direction === 'bullish') {
        if (!emaAlignedBullish) {
            reasons.push('✗ 4H EMAs not aligned with bullish trend');
            return { passed: false, inZone: false, compression: false, reasons };
        }
        reasons.push('✓ 4H EMAs aligned (EMA-30 > EMA-50)');

        // Check if price is in EMA zone (between EMA-30 and EMA-50)
        const upper = Math.max(current30, current50);
        const lower = Math.min(current30, current50);

        inZone = currentPrice >= lower && currentPrice <= upper;

        // Also accept price just above EMA-30 (within 1%)
        const nearEMA30 = currentPrice <= current30 * 1.01 && currentPrice >= current30 * 0.99;

        if (inZone) {
            reasons.push('✓ Price in EMA zone (pullback setup)');
            passed = true;
        } else if (nearEMA30) {
            reasons.push('✓ Price near EMA-30 (potential setup)');
            inZone = true;
            passed = true;
        } else if (currentPrice < lower) {
            reasons.push('✗ Price below EMA zone (may be breaking down)');
        } else {
            reasons.push('○ Price above EMA zone (not pulled back yet)');
        }

        // Check for compression (last 3-5 candles tightening)
        const last5 = candles4H.slice(-5);
        const ranges = last5.map(c => c.high - c.low);
        const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
        const lastRange = ranges[ranges.length - 1];

        compression = lastRange < avgRange * 0.8; // Last candle range < 80% of avg

        if (compression) {
            reasons.push('✓ Compression detected (tightening range)');
        }

    } else {
        // Bearish pullback
        if (!emaAlignedBearish) {
            reasons.push('✗ 4H EMAs not aligned with bearish trend');
            return { passed: false, inZone: false, compression: false, reasons };
        }
        reasons.push('✓ 4H EMAs aligned (EMA-30 < EMA-50)');

        const upper = Math.max(current30, current50);
        const lower = Math.min(current30, current50);

        inZone = currentPrice >= lower && currentPrice <= upper;

        const nearEMA30 = currentPrice >= current30 * 0.99 && currentPrice <= current30 * 1.01;

        if (inZone) {
            reasons.push('✓ Price in EMA zone (pullback setup)');
            passed = true;
        } else if (nearEMA30) {
            reasons.push('✓ Price near EMA-30 (potential setup)');
            inZone = true;
            passed = true;
        } else if (currentPrice > upper) {
            reasons.push('✗ Price above EMA zone (may be breaking up)');
        } else {
            reasons.push('○ Price below EMA zone (not pulled back yet)');
        }

        // Compression check
        const last5 = candles4H.slice(-5);
        const ranges = last5.map(c => c.high - c.low);
        const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
        const lastRange = ranges[ranges.length - 1];

        compression = lastRange < avgRange * 0.8;

        if (compression) {
            reasons.push('✓ Compression detected (tightening range)');
        }
    }

    return {
        passed,
        inZone,
        compression,
        ema30: current30,
        ema50: current50,
        price: currentPrice,
        reasons
    };
}
