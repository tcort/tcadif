#!/usr/bin/env node

'use strict';

const {
    ADIF,
    AdifReader,
    AdifWriter,
    transforms,
} = require('..');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const fs = require('fs');
const os = require('os');

const [ node, prog, action, ...rest ] = process.argv;

switch (action) {

    case 'combine': {
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
        }
        break;

    case 'format': {
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter();
            process.stdin
                .pipe(adifReader)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;

    case 'format-compact': {
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter({}, { fieldDelim: ' ', recordDelim: `${os.EOL}`, verbosity: 'compact' });
            process.stdin
                .pipe(adifReader)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;

    case 'filter-skcc': {
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter();
            const filter = new transforms.Filter(qso => qso.SKCC);
            process.stdin
                .pipe(adifReader)
                .pipe(filter)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;

    case 'csv2adif': {
            const csvParser = parse({
                columns: true,
            });
            const adifWriter = new AdifWriter();
            process.stdin
                .pipe(csvParser)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;

    case 'adif2csv': {
            const csvStringifier = stringify({
                header: true,
            });
            const adifReader = new AdifReader();
            process.stdin
                .pipe(adifReader)
                .pipe(csvStringifier)
                .pipe(process.stdout);
        }
        break;

    default:
        break;
}
