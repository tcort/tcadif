#!/usr/bin/env node

'use strict';

const {
    ADIF,
    AdifReader,
    AdifWriter,
} = require('..');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const fs = require('fs');

const [ node, prog, action, ...rest ] = process.argv;

switch (action) {

    case 'combine':
        const qsos = rest
                        .map(file => fs.readFileSync(file))
                        .map(content => content.toString())
                        .map(text => ADIF.parse(text))
                        .map(adif => adif.qsos)
                        .reduce((result, qsos) => result.concat(qsos), [])
                        .sort((a, b) => {
                            const ts_a = `${a.QSO_DATE}${a.TIME_ON}`;
                            const ts_b = `${b.QSO_DATE}${b.TIME_ON}`;
                            if (ts_a < ts_b) return -1;
                            if (ts_a > ts_b) return  1;
                            return 0;
                        });

        const adif = new ADIF({ qsos });
        console.log(adif.stringify());

        break;

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

