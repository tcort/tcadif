#!/usr/bin/env node

'use strict';

const fs = require('fs');
const { AdifWriter, QSO } = require('..');

const [ node, script, input, output ] = process.argv;

if (process.argv.length !== 3 && process.argv.length !== 4) {
    console.error('usage: node qle.js INPUT_FILE [OUTPUT_FILE]');
    process.exit(1);
}

const adifWriter = new AdifWriter();

const outputStream = (process.argv.length === 4) ? fs.createWriteStream(process.argv[3]) : process.stdout;
adifWriter.pipe(outputStream);

const qso = {};
fs
    .readFileSync(input)
    .toString()
    .split(/\n/g)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.toUpperCase())
    .forEach(line => {

        // defaults
        qso.RST_SENT = (qso.MODE === 'CW') ? '599' : '59';
        qso.RST_RCVD = (qso.MODE === 'CW') ? '599' : '59';
        delete qso.CALL;

        const parts = line.split(/\s+/g);
        parts.forEach(part => {
            switch (true) {
                case /^(CW|SSB|FM|AM|FT8)$/.test(part):
                    qso.MODE = part;
                    break;
                case /^\d{8}$/.test(part):
                    qso.QSO_DATE = part;
                    break;
                case /^\d{4}$/.test(part):
                    qso.TIME_ON = part;
                    break;
                case /^\d+\.\d+$/.test(part):
                    qso.FREQ = part;
                    break;
                case /^\d+W$/.test(part):
                    qso.TX_PWR = part.replace('W', '');
                    break;
                case /^[1-5][1-9][1-9]?$/.test(part):
                    qso.RST_SENT = qso.RST_RCVD;
                    qso.RST_RCVD = part;
                    break;
                case /^[A-Z0-9/]+$/.test(part):
                    qso.CALL = part;
                    break;
                case /^@[A-Z0-9/]+$/.test(part):
                    qso.STATION_CALLSIGN = part.slice(1);
                    break;
            }
        });

        if (qso.CALL) {
            adifWriter.write(qso);
        }
    });
    
adifWriter.end();
