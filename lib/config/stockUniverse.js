/**
 * Stock Universe Configuration
 * Predefined list of stocks to scan for swing trading opportunities
 */

// NSE Top Stocks by Market Cap and Liquidity
export const NSE_LARGE_CAP = [
    'NSE:RELIANCE',
    'NSE:TCS',
    'NSE:HDFCBANK',
    'NSE:INFY',
    'NSE:ICICIBANK',
    'NSE:HINDUNILVR',
    'NSE:ITC',
    'NSE:SBIN',
    'NSE:BHARTIARTL',
    'NSE:LT'
];

// Sector-wise stocks for sector rotation analysis
export const SECTORS = {
    BANKING: ['NSE:HDFCBANK', 'NSE:ICICIBANK', 'NSE:SBIN', 'NSE:KOTAKBANK', 'NSE:AXISBANK'],
    IT: ['NSE:TCS', 'NSE:INFY', 'NSE:WIPRO', 'NSE:HCLTECH', 'NSE:TECHM'],
    AUTO: ['NSE:MARUTI', 'NSE:M&M', 'NSE:TATAMOTORS', 'NSE:BAJAJ-AUTO', 'NSE:EICHERMOT'],
    PHARMA: ['NSE:SUNPHARMA', 'NSE:DRREDDY', 'NSE:CIPLA', 'NSE:DIVISLAB', 'NSE:AUROPHARMA'],
    FMCG: ['NSE:HINDUNILVR', 'NSE:ITC', 'NSE:NESTLEIND', 'NSE:BRITANNIA', 'NSE:DABUR'],
    METALS: ['NSE:TATASTEEL', 'NSE:HINDALCO', 'NSE:JSWSTEEL', 'NSE:VEDL', 'NSE:HINDZINC'],
    ENERGY: ['NSE:RELIANCE', 'NSE:ONGC', 'NSE:POWERGRID', 'NSE:NTPC', 'NSE:COALINDIA']
};

// Default scan universe (25 stocks - balanced for API limits)
export const DEFAULT_UNIVERSE = [
    // Large Cap Leaders
    'NSE:RELIANCE',
    'NSE:TCS',
    'NSE:HDFCBANK',
    'NSE:INFY',
    'NSE:ICICIBANK',

    // Banking
    'NSE:SBIN',
    'NSE:KOTAKBANK',
    'NSE:AXISBANK',

    // IT
    'NSE:WIPRO',
    'NSE:HCLTECH',

    // Auto
    'NSE:MARUTI',
    'NSE:TATAMOTORS',
    'NSE:M&M',

    // FMCG
    'NSE:HINDUNILVR',
    'NSE:ITC',
    'NSE:BRITANNIA',

    // Pharma
    'NSE:SUNPHARMA',
    'NSE:DRREDDY',

    // Metals
    'NSE:TATASTEEL',
    'NSE:HINDALCO',
    'NSE:HINDZINC',

    // Energy & Infra
    'NSE:ONGC',
    'NSE:NTPC',
    'NSE:LT',
    'NSE:POWERGRID'
];

/**
 * Get stocks by sector
 * @param {string} sector - Sector name (BANKING, IT, etc.)
 * @returns {string[]} - Array of stock symbols
 */
export function getStocksBySector(sector) {
    return SECTORS[sector.toUpperCase()] || [];
}

/**
 * Get all available sectors
 * @returns {string[]} - Array of sector names
 */
export function getAllSectors() {
    return Object.keys(SECTORS);
}

/**
 * Get default scan universe
 * @returns {string[]} - Array of stock symbols
 */
export function getDefaultUniverse() {
    return DEFAULT_UNIVERSE;
}
