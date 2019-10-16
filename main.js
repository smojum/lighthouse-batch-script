#!/usr/bin/env node
'use strict'

const program = require('commander')
const execute = require('./lighthouse_exec')
program
    .version(require('./package.json').version)
    .option('-d, --baseuri [homepage]', 'this value will be prefixed to the input file with file option')
    .option('-f, --file [path]', 'an input file with a site uri without the base url per-line to analyze with Lighthouse')
    .parse(process.argv)
execute(program)

