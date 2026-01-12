/**
 * Batch Fetcher with Rate Limit Control
 * Fetches data for multiple stocks with delays to avoid API rate limits
 */

import { fetchCandles } from '../api/marketApi';

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch candles for multiple symbols in batches
 * @param {string[]} symbols - Array of stock symbols
 * @param {string} interval - Time interval (1day, 4h, etc.)
 * @param {Function} onProgress - Progress callback (current, total, symbol)
 * @param {number} batchSize - Number of concurrent requests (default: 2)
 * @param {number} delayMs - Delay between batches in ms (default: 1000)
 * @returns {Promise<Object>} - Map of symbol to candle data
 */
export async function fetchMultipleCandles(
    symbols,
    interval,
    onProgress = null,
    batchSize = 2,
    delayMs = 1000
) {
    const results = {};
    const errors = {};
    let completed = 0;
    const total = symbols.length;

    // Process in batches
    for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);

        // Fetch batch concurrently
        const batchPromises = batch.map(async (symbol) => {
            try {
                const data = await fetchCandles(symbol, interval);
                results[symbol] = data;
                completed++;

                if (onProgress) {
                    onProgress(completed, total, symbol, null);
                }
            } catch (error) {
                errors[symbol] = error.message || 'Failed to fetch';
                completed++;

                if (onProgress) {
                    onProgress(completed, total, symbol, error.message);
                }
            }
        });

        await Promise.all(batchPromises);

        // Delay before next batch (except for last batch)
        if (i + batchSize < symbols.length) {
            await delay(delayMs);
        }
    }

    return { results, errors };
}

/**
 * Fetch both daily and 4H data for multiple symbols
 * @param {string[]} symbols - Array of stock symbols
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - { daily: {...}, fourH: {...}, errors: {...} }
 */
export async function fetchMultiTimeframeData(symbols, onProgress = null) {
    const totalSteps = symbols.length * 2; // Daily + 4H
    let completedSteps = 0;

    const progressCallback = (current, total, symbol, error) => {
        completedSteps++;
        if (onProgress) {
            onProgress(completedSteps, totalSteps, symbol, error);
        }
    };

    // Fetch daily data first
    console.log('Fetching daily data for', symbols.length, 'stocks...');
    const dailyData = await fetchMultipleCandles(
        symbols,
        '1day',
        progressCallback,
        2, // 2 concurrent requests
        1000 // 1 second delay between batches
    );

    // Fetch 4H data
    console.log('Fetching 4H data for', symbols.length, 'stocks...');
    const fourHData = await fetchMultipleCandles(
        symbols,
        '4h',
        progressCallback,
        2,
        1000
    );

    return {
        daily: dailyData.results,
        fourH: fourHData.results,
        errors: { ...dailyData.errors, ...fourHData.errors }
    };
}
