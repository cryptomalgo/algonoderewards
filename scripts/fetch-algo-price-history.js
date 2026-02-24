import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYMBOL = 'ALGOUSDT';
const INTERVAL = '1d';
const START_DATE = '2019-09-20';
const OUTPUT_FILE = path.join(__dirname, '../src/data/algo-price-history.json');
const MEXC_API = 'https://api.mexc.com/api/v3/klines';

async function fetchKlines(startTime) {
    const url = `${MEXC_API}?symbol=${SYMBOL}&interval=${INTERVAL}&startTime=${startTime}&limit=1000`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
}

async function main() {
    let existingData = {};
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            console.log(`Loaded ${Object.keys(existingData).length} existing entries.`);
        } catch (e) {
            console.error('Error reading existing file, starting fresh.');
        }
    }

    // Ensure src/data exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    let currentStartTime = new Date(START_DATE).getTime();

    // If we have existing data, we can start from the last date + 1 day
    const dates = Object.keys(existingData).sort();
    if (dates.length > 0) {
        const lastDate = dates[dates.length - 1];
        const lastTime = new Date(lastDate).getTime();
        currentStartTime = lastTime + 24 * 60 * 60 * 1000;

        // If lastTime is already today or later, we don't need to fetch
        if (currentStartTime >= today) {
            console.log('Already up to date.');
            return;
        }

        console.log(`Starting/Resuming from ${formatDate(currentStartTime)}`);
    } else {
        console.log(`Starting from scratch: ${START_DATE}`);
    }

    let newDataCount = 0;
    while (currentStartTime < today) {
        console.log(`Fetching from ${formatDate(currentStartTime)}...`);
        const klines = await fetchKlines(currentStartTime);

        if (klines.length === 0) break;

        for (const candle of klines) {
            const openTime = candle[0];
            const closePrice = parseFloat(candle[4]);
            const dateStr = formatDate(openTime);

            if (openTime < today) {
                existingData[dateStr] = closePrice;
                newDataCount++;
            }

            currentStartTime = openTime + 24 * 60 * 60 * 1000;
        }

        // Small delay to avoid aggressive rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (newDataCount > 0) {
        // Sort keys before writing
        const sortedData = {};
        Object.keys(existingData).sort().forEach(key => {
            sortedData[key] = existingData[key];
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedData, null, 2));
        console.log(`Done! Added ${newDataCount} new entries. Total: ${Object.keys(sortedData).length}`);
    } else {
        console.log('Already up to date.');
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
