#!/usr/bin/env node

'use strict';

const {
    AdifReader,
    AdifWriter,
} = require('..');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const fs = require('fs');

const [ node, prog, action, ...rest ] = process.argv;

switch (action) {

    case 'csv2adif':
        const csvParser = parse({
            columns: true,
        });
        const adifWriter = new AdifWriter();
        process.stdin
            .pipe(csvParser)
            .pipe(adifWriter)
            .pipe(process.stdout);
        break;

    case 'adif2csv':
        const csvStringifier = stringify({
            header: true,
        });
        const adifReader = new AdifReader();
        process.stdin
            .pipe(adifReader)
            .pipe(csvStringifier)
            .pipe(process.stdout);
        break;

    default:
        break;
}

