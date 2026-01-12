/**
 * Stock Scanner Service
 * Orchestrates multi-stock scanning with filters and scoring
 */

import { fetchMultiTimeframeData } from './batchFetcher.js';
import { scoreStock } from './scoringEngine.js';
import { getCachedResults, setCachedResults, getCacheInfo } from './cacheManager.js';

/**
 * Scan multiple stocks for trading opportunities
 * @param {string[]} symbols - Array of stock symbols to scan
 * @param {string} direction - 'bullish' or 'bearish' (default: 'bullish')
 * @param {Function} onProgress - Progress callback (current, total, message)
 * @param {boolean} useCache - Use cached results if available (default: true)
 * @returns {Promise<Object>} - { ready: [], watchlist: [], ignore: [], errors: {} }
 */
export async function scanStocks(symbols, direction = 'bullish', onProgress = null, useCache = true) {
    // Check cache first
    if (useCache) {
        const cacheInfo = getCacheInfo();
        if (cacheInfo.valid) {
            console.log(`📦 Using cached results (${cacheInfo.age} min old)`);
            if (onProgress) {
                onProgress(symbols.length, symbols.length, 'Loaded from cache');
            }
            return getCachedResults();
        }
    }

    console.log(`🔍 Scanning ${symbols.length} stocks for ${direction} setups...`);

    // Fetch multi-timeframe data
    const dataProgress = (current, total, symbol, error) => {
        if (onProgress) {
            const step = Math.floor((current / total) * 50); // First 50% is data fetching
            onProgress(step, 100, error ? `Error: ${symbol}` : `Fetching ${symbol}`);
        }
    };

    const { daily, fourH, errors } = await fetchMultiTimeframeData(symbols, dataProgress);

    // Score each stock
    const scored = [];
    let processed = 0;

    for (const symbol of symbols) {
        if (!daily[symbol] || !fourH[symbol]) {
            // Skip if data fetch failed
            processed++;
            continue;
        }

        try {
            const dailyCandles = daily[symbol].candles;
            const candles4H = fourH[symbol].candles;

            const result = scoreStock(symbol, dailyCandles, candles4H, direction);
            scored.push(result);

            processed++;
            if (onProgress) {
                const step = 50 + Math.floor((processed / symbols.length) * 50); // Next 50% is scoring
                onProgress(step, 100, `Analyzed ${symbol}`);
            }
        } catch (error) {
            console.error(`Error scoring ${symbol}:`, error);
            errors[symbol] = error.message;
            processed++;
        }
    }

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    // Categorize results
    const results = {
        ready: scored.filter(s => s.category === 'READY'),
        watchlist: scored.filter(s => s.category === 'WATCHLIST'),
        ignore: scored.filter(s => s.category === 'IGNORE'),
        errors: errors,
        scannedAt: new Date().toISOString(),
        direction: direction,
        totalScanned: symbols.length
    };

    // Cache results
    setCachedResults(results);

    if (onProgress) {
        onProgress(100, 100, 'Scan complete');
    }

    console.log(`✅ Scan complete: ${results.ready.length} READY, ${results.watchlist.length} WATCHLIST, ${results.ignore.length} IGNORE`);

    return results;
}

/**
 * Scan a single stock (no caching, immediate return)
 * @param {string} symbol - Stock symbol
 * @param {Function} fetchFn - Function to fetch candles
 * @param {string} direction - 'bullish' or 'bearish'
 * @returns {Promise<Object>} - Stock analysis result
 */
export async function scanSingleStock(symbol, fetchFn, direction = 'bullish') {
    try {
        console.log(`🔍 Scanning ${symbol}...`);

        const dailyData = await fetchFn(symbol, '1day');
        const fourHData = await fetchFn(symbol, '4h');

        const result = scoreStock(
            symbol,
            dailyData.candles,
            fourHData.candles,
            direction
        );

        console.log(`✅ ${symbol}: ${result.category} (Score: ${result.score})`);
        return result;
    } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
        throw error;
    }
}
