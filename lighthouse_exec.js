'use strict';
require('shelljs/global');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const readline = require('readline');

const opts = {
    output: 'html',
    chromeFlags: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu'
    ],
    logLevel: 'info',
    onlyCategories: ['performance', 'seo'],
    view: true
};
const domains = fs.readFileSync('domains.txt').toString().split('\n');
const links = fs.readFileSync('links.txt').toString().split('\n');

module.exports = execute;

async function execute(options) {
    for (const domain of domains) {
        for (const link of links) {
            if(domain && link){
                console.log("Running url: " + domain + link);
                await runLighthouse(domain, link, opts);
            }
        }
    }
    console.log("Run Complete")
}

async function runLighthouse(domain, path, opts, config = null) {
    try {
        const url = domain + path;
        const chrome = await chromeLauncher.launch({ignoreDefaultFlags: false, chromeFlags: opts.chromeFlags});
        opts.port = chrome.port;
        const results = await lighthouse(url, opts, config);
        let metrics = {
            url: url,
            runTime: results.lhr.fetchTime,
            firstContentfulPaint: results.lhr.audits["first-contentful-paint"].numericValue,
            interactive: results.lhr.audits["interactive"].numericValue,
            speedIndex: results.lhr.audits["speed-index"].numericValue,
        };
        console.log(JSON.stringify(metrics));
        var zip = new require('node-zip')();
        zip.file('lhr.html', results.report);
        metrics.html = zip.generate({base64: true, compression: 'DEFLATE'});
        save(metrics);
        await chrome.kill();
    } catch (error) {
        console.log(error)
    }
}

function save(metrics) {
    const http = require('http');
    const data = JSON.stringify(metrics);
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/metrics',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', (d) => {
            process.stdout.write(d)
        })
    });
    req.on('error', (error) => {
        console.error(error)
    });
    req.write(data);
    req.end()
}



