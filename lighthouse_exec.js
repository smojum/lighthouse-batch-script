'use strict';
require('shelljs/global');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

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

module.exports = execute;
function execute(options) {
    console.log(options.baseuri)
    launchChromeAndRunLighthouse(options.baseuri, opts).then(results => {
        process.exit(0)
    });
}

function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({
        ignoreDefaultFlags: false,
        chromeFlags: opts.chromeFlags
    }).then(chrome => {
        opts.port = chrome.port;
        return lighthouse(url, opts, config).then(results => {
            let metrics = {
                url: url,
                runTime: results.lhr.fetchTime,
                firstContentfulPaint: results.lhr.audits["first-contentful-paint"].numericValue,
                interactive: results.lhr.audits["interactive"].numericValue,
                speedIndex: results.lhr.audits["speed-index"].numericValue,
            };
            var zip = new require('node-zip')();
            zip.file('lhr.html', results.report);
            metrics.html = zip.generate({base64:true,compression:'DEFLATE'});
            console.log(metrics);
            save(metrics)
            return chrome.kill().then(() => {
                console.log("Finishing up for " + url)
            })
        });
    });
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



