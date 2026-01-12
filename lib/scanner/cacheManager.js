/**
 * Cache Manager
 * Manages localStorage caching for scanner results
 */

const CACHE_KEY_PREFIX = 'scanner_results';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cache key for today's date
 * @returns {string}
 */
function getCacheKey() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `${CACHE_KEY_PREFIX}_${date}`;
}

/**
 * Get cached scan results if valid
 * @returns {Object|null} - Cached results or null
 */
export function getCachedResults() {
    try {
        const key = getCacheKey();
        const cached = localStorage.getItem(key);

        if (!cached) {
            return null;
        }

        const data = JSON.parse(cached);

        // Check if cache is still valid
        if (isCacheValid(data.timestamp)) {
            return data.results;
        }

        // Cache expired, remove it
        localStorage.removeItem(key);
        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

/**
 * Save scan results to cache
 * @param {Object} results - Scan results to cache
 */
export function setCachedResults(results) {
    try {
        const key = getCacheKey();
        const data = {
            timestamp: Date.now(),
            results: results
        };

        localStorage.setItem(key, JSON.stringify(data));
        console.log('✅ Scan results cached');
    } catch (error) {
        console.error('Error caching results:', error);
    }
}

/**
 * Check if cache timestamp is still valid
 * @param {number} timestamp - Cache timestamp
 * @returns {boolean}
 */
export function isCacheValid(timestamp) {
    if (!timestamp) return false;
    return (Date.now() - timestamp) < CACHE_DURATION_MS;
}

/**
 * Clear all scanner caches
 */
export function clearCache() {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        console.log('🗑️ Scanner cache cleared');
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

/**
 * Get cache info
 * @returns {Object} - { exists: boolean, age: number, expiresIn: number }
 */
export function getCacheInfo() {
    try {
        const key = getCacheKey();
        const cached = localStorage.getItem(key);

        if (!cached) {
            return { exists: false, age: 0, expiresIn: 0 };
        }

        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        const expiresIn = CACHE_DURATION_MS - age;

        return {
            exists: true,
            age: Math.floor(age / 1000 / 60), // minutes
            expiresIn: Math.floor(expiresIn / 1000 / 60), // minutes
            valid: isCacheValid(data.timestamp)
        };
    } catch {
        return { exists: false, age: 0, expiresIn: 0 };
    }
}
