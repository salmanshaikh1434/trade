import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Token cache for API Key + Secret authentication
let tokenCache: { token: string | null; expiry: number | null } = {
    token: null,
    expiry: null
};

// Generate checksum for Groww API authentication
function generateChecksum(apiSecret: string, timestamp: string) {
    const message = `${apiSecret}${timestamp}`;
    return crypto.createHash('sha256').update(message).digest('hex');
}

// Generate access token using API Key + Secret
async function generateAccessToken() {
    const GROWW_API_KEY = process.env.GROWW_API_KEY;
    const GROWW_API_SECRET = process.env.GROWW_API_SECRET;

    if (!GROWW_API_KEY || !GROWW_API_SECRET) {
        throw new Error('GROWW_API_KEY and GROWW_API_SECRET are required for token generation');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const checksum = generateChecksum(GROWW_API_SECRET, timestamp);

    const response = await fetch('https://api.groww.in/v1/token/api/access', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROWW_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key_type: 'approval',
            checksum: checksum,
            timestamp: timestamp
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token generation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.token) {
        throw new Error('No token received from Groww API');
    }

    const expiryTime = data.expiry ? new Date(data.expiry).getTime() : Date.now() + (24 * 60 * 60 * 1000);

    tokenCache = {
        token: data.token,
        expiry: expiryTime
    };

    return data.token;
}

// Get valid access token
async function getAccessToken() {
    if (process.env.GROWW_ACCESS_TOKEN) {
        return process.env.GROWW_ACCESS_TOKEN;
    }

    const now = Date.now();
    if (tokenCache.token && tokenCache.expiry && (tokenCache.expiry - now) > 5 * 60 * 1000) {
        return tokenCache.token;
    }

    return await generateAccessToken();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');
        const interval = searchParams.get('interval') || '4h';

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
        }

        let accessToken;
        try {
            accessToken = await getAccessToken();
        } catch (error: any) {
            return NextResponse.json({
                error: 'Authentication failed',
                message: error.message
            }, { status: 500 });
        }

        const [exchange = 'NSE', trading_symbol] = symbol.includes(':')
            ? symbol.split(':')
            : ['NSE', symbol];

        const intervalMap: Record<string, number> = {
            '1h': 60,
            '4h': 240,
            '1day': 1440,
            '1week': 10080
        };

        const interval_in_minutes = intervalMap[interval] || 240;
        const end_time = Math.floor(Date.now() / 1000);
        const candle_duration_seconds = interval_in_minutes * 60;
        const start_time = end_time - (200 * candle_duration_seconds);

        const url = new URL('https://api.groww.in/v1/historical/candle/range');
        url.searchParams.append('trading_symbol', trading_symbol);
        url.searchParams.append('exchange', exchange);
        url.searchParams.append('segment', 'CASH');
        url.searchParams.append('start_time', start_time.toString());
        url.searchParams.append('end_time', end_time.toString());
        url.searchParams.append('interval_in_minutes', interval_in_minutes.toString());

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'X-API-VERSION': '1.0'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groww API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.error || data.status === 'error') {
            return NextResponse.json({ error: data.message || data.error || 'API error' }, { status: 400 });
        }

        const candles = data.payload?.candles;

        if (!candles || !Array.isArray(candles)) {
            return NextResponse.json({ error: 'Invalid response from Groww API' }, { status: 500 });
        }

        const transformedCandles = candles.map((candle: any) => {
            if (Array.isArray(candle)) {
                return {
                    time: candle[0],
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5] || 0)
                };
            } else {
                return {
                    time: candle.time || candle.timestamp,
                    open: parseFloat(candle.open),
                    high: parseFloat(candle.high),
                    low: parseFloat(candle.low),
                    close: parseFloat(candle.close),
                    volume: parseFloat(candle.volume || 0)
                };
            }
        });

        return NextResponse.json({
            symbol: `${exchange}:${trading_symbol}`,
            interval: interval,
            candles: transformedCandles
        });

    } catch (error: any) {
        console.error('Error fetching candles:', error);
        return NextResponse.json({
            error: 'Failed to fetch data from Groww API',
            message: error.message
        }, { status: 500 });
    }
}
