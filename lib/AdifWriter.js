'use strict';

const Header = require('./Header');
const Timestamper = require('./utils/Timestamper');
const QSO = require('./QSO');
const os = require('os');
const pkg = require('../package.json');
const { Transform } = require('stream');

class AdifWriter extends Transform {

    #header = null;
    #headerWritten = false;
    #options = {};

    constructor(header, options = {}) {
        super({
            writableObjectMode: true,
        });

        this.#header = header ?? {};
        this.#header.ADIF_VER = this.#header.ADIF_VER ?? '3.1.6';
        this.#header.CREATED_TIMESTAMP = this.#header.CREATED_TIMESTAMP ?? Timestamper.CREATED_TIMESTAMP();
        this.#header.PROGRAMID = this.#header.PROGRAMID ?? pkg.name;
        this.#header.PROGRAMVERSION = this.#header.PROGRAMVERSION ?? pkg.version;

        this.#options = options ?? {};
        this.#options.recordDelim = this.#options?.recordDelim ?? `${os.EOL}${os.EOL}`;
    }

    _transform(chunk, encoding, callback) {
        const parts = [];

        if (!this.#headerWritten) {
            parts.push(new Header(this.#header).stringify(this.#options));
            parts.push(os.EOL);
            this.#headerWritten = true;
            parts.push(this.#options.recordDelim);
        }

        parts.push(new QSO(chunk).stringify(this.#options));
        parts.push(this.#options.recordDelim);

        this.push(parts.join(''));
        callback();
    }
}

module.exports = AdifWriter;
