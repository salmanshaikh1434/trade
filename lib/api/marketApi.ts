/**
 * Market Data API Client
 * Fetches candlestick data from the Next.js API Routes
 */

/**
 * Fetch candlestick data for a given symbol and interval
 * @param {string} symbol - Trading symbol (e.g., "NSE:RELIANCE")
 * @param {string} interval - Time interval (e.g., "4h", "1day", "1week")
 * @returns {Promise<Object>} - Candlestick data
 */
export async function fetchCandles(symbol: string, interval = '4h') {
    try {
        const response = await fetch(
            `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch candles');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching candles:', error);
        throw error;
    }
}
