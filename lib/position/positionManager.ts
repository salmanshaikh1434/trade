/**
 * Position Manager - Handle user position tracking in localStorage
 */

export interface Position {
    symbol: string;
    buyingPrice: number;
    quantity?: number;
    timestamp: number;
}

const STORAGE_KEY = 'trade_positions';

/**
 * Save a position for a stock
 */
export function savePosition(symbol: string, buyingPrice: number, quantity?: number): void {
    if (typeof window === 'undefined') return;

    const positions = getAllPositions();
    positions[symbol] = {
        symbol,
        buyingPrice,
        quantity,
        timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

/**
 * Get position for a specific stock
 */
export function getPosition(symbol: string): Position | null {
    if (typeof window === 'undefined') return null;

    const positions = getAllPositions();
    return positions[symbol] || null;
}

/**
 * Get all positions
 */
export function getAllPositions(): Record<string, Position> {
    if (typeof window === 'undefined') return {};

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Failed to load positions:', error);
        return {};
    }
}

/**
 * Remove a position (when user exits)
 */
export function removePosition(symbol: string): void {
    if (typeof window === 'undefined') return;

    const positions = getAllPositions();
    delete positions[symbol];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

/**
 * Clear all positions
 */
export function clearAllPositions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize default position for HINDZINC
 */
export function initializeDefaultPosition(): void {
    if (typeof window === 'undefined') return;

    // Check if HINDZINC already has a position
    const existing = getPosition('NSE:HINDZINC');
    if (!existing) {
        savePosition('NSE:HINDZINC', 660.13);
    }
}
