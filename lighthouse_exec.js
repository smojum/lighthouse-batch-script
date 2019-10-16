'use strict';
require('shelljs/global');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

const opts = {
    output: 'html',
    chromeFlags: ['--no-sandbox', '--headless', '--disable-gpu'],
    logLevel: 'info',
    onlyCategories: ['performance'],
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
    return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
        opts.port = chrome.port;
        return lighthouse(url, opts, config).then(results => {
            return chrome.kill().then(() => {
                let metrics = {
                    url: url,
                    runTime: results.lhr.fetchTime,
                    firstContentfulPaint: results.lhr.audits["first-contentful-paint"].numericValue,
                    interactive: results.lhr.audits["interactive"].numericValue,
                    speedIndex: results.lhr.audits["speed-index"].numericValue,
                };
                console.log(metrics)
                let htmlName = Math.random().toString(36).substring(7) + "-lighthouse-report.html";
                fs.writeFile(htmlName, JSON.stringify(results.report), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                save(metrics, htmlName)
            })
        });
    });
}

function save(metrics, htmlName) {
    const http = require('http');
    var AdmZip = require('adm-zip');
    var zip = new AdmZip();
    zip.addLocalFile(htmlName);
    const htmlReport = zip.toBuffer().toString('base64');
    metrics.html = encodeURI(htmlReport);
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



