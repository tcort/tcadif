#!/usr/bin/env node

'use strict';

const {
    ADIF,
    AdifReader,
    AdifWriter,
    defs,
    transforms,
} = require('..');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const fs = require('fs');
const moment = require('moment');
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

    case 'filter-timestamp': {
            const ts_after = moment(rest[0]);
            const ts_before = moment(rest[1]);
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter();
            const filter = new transforms.Filter(qso => {
                const timestamp = moment(`${qso.QSO_DATE}${qso.TIME_ON}`, 'YYYYMMDDHHmmss');
                return timestamp.isAfter(ts_after) && timestamp.isBefore(ts_before);
            });
            process.stdin
                .pipe(adifReader)
                .pipe(filter)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;


    case 'filter-skcc': {
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter();
            const filter = new transforms.Filter(qso => qso.SKCC);
            const map = new transforms.Map(qso => {
                if (typeof qso.CONTACTED_OP === 'string' && qso.CONTACTED_OP.length > 0) {
                    qso.CALL = qso.CONTACTED_OP;
                    qso.CONTACTED_OP = '';
                }
                return qso;
            });
            process.stdin
                .pipe(adifReader)
                .pipe(filter)
                .pipe(map)
                .pipe(adifWriter)
                .pipe(process.stdout);
        }
        break;

    case 'expand-notes': {
            const adifReader = new AdifReader();
            const adifWriter = new AdifWriter();
            const map = new transforms.Map(qso => {
                (qso.NOTES ?? '')
                    .split(/\s+/g)
                    .forEach(part => {
                        try {
                            const [ fieldName, value ] = part.split(/=/);
                            const normalizedFieldName = `${fieldName}`.toUpperCase();
                            if (defs.qso[normalizedFieldName]) {
                                const def = new defs.qso[normalizedFieldName]();
                                def.validate(value);
                                qso[normalizedFieldName] = value;
                            }
                        } catch (err) {
                            /* not a valid ADIF field, skip */
                        }
                    });

                return qso;
            });

            process.stdin
                .pipe(adifReader)
                .pipe(map)
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
        console.error('usage: tcadif action');
        break;
}

