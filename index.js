const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');
const validator = require('html-validator');

async function validateDom(domContent) {
    try {
        const options = {
            data: domContent,
            format: 'json'
        };

        const result = await validator(options);

        if (result.messages.length === 0) {
            return { valid: true, details: 'No errors' };
        }

        const errorDetails = result.messages
            .map(message =>
                `Type: ${message.type}, Line ${message.lastLine}, col ${message.firstColumn}: ${message.message}`
            ).join('; ');

        return { valid: false, details: errorDetails };
    } catch (error) {
        return { valid: false, details: `Validation error: ${error.message}` };
    }
}

async function getDomAndValidate(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const domContent = await page.content();

        const { valid, details } = await validateDom(domContent);
        const status = valid ? 'valid' : 'invalid';

        return { url: url.trim(), status: status.trim(), details: details.trim() };
    } catch (error) {
        return { url: url.trim(), status: 'error', details: error.message.replace(/[\r\n]+/g, ' ').trim() };
    } finally {
        await browser.close();
    }
}

function loadUrlsFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File ${filePath} does not exist.`);
        process.exit(1);
    }
    return fs.readFileSync(filePath, 'utf-8').split('\n').map(url => url.trim()).filter(url => url !== '');
}

function saveResultsToCsv(filePath, results) {
    const fields = ['url', 'status', 'details'];
    const parser = new Parser({ fields });

    let csv = parser.parse(results);

    csv = csv.split('\n').map(line => line.trim()).join('\n') + '\n';

    fs.writeFileSync(filePath, csv, 'utf-8');
    console.log(`Results saved to ${filePath}`);
}

async function processUrlsInBatches(urls, concurrency) {
    const results = [];
    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency).map(url => getDomAndValidate(url));
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
    }
    return results;
}

(async () => {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error('Usage: node index.js <urls.txt> <output.csv> <concurrency>');
        process.exit(1);
    }

    const [urlsFilePath, outputCsvPath, concurrency] = args;

    const urls = loadUrlsFromFile(urlsFilePath);
    const results = await processUrlsInBatches(urls, parseInt(concurrency, 10));
    saveResultsToCsv(outputCsvPath, results);
})();
