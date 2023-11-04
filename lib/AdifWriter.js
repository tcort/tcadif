'use strict';

const Header = require('./Header');
const QSO = require('./QSO');
const moment = require('moment');
const os = require('os');
const pkg = require('../package.json');
const { Transform } = require('stream');

class AdifWriter extends Transform {

    #header = null;
    #headerWritten = false;

    constructor(header) {
        super({
            writableObjectMode: true,
        });

        this.#header = header ?? {};
        this.#header.ADIF_VER = this.#header.ADIF_VER ?? '3.1.4';
        this.#header.CREATED_TIMESTAMP = this.#header.CREATED_TIMESTAMP ?? moment.utc().format('YYYYMMDD HHmmss');
        this.#header.PROGRAMID = this.#header.PROGRAMID ?? pkg.name;
        this.#header.PROGRAMVERSION = this.#header.PROGRAMVERSION ?? pkg.version;
    }

    _transform(chunk, encoding, callback) {
        const parts = [];

        if (!this.#headerWritten) {
            parts.push(new Header(this.#header).stringify());
            parts.push(os.EOL);
            this.#headerWritten = true;
        }
        parts.push(os.EOL);
        parts.push(new QSO(chunk).stringify());
        parts.push(os.EOL);

        this.push(parts.join(''));
        callback();
    }
}

module.exports = AdifWriter;
