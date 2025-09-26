'use strict';

import HeaderSegment from '../segments/HeaderSegment.mjs';
import RecordSegment from '../segments/RecordSegment.mjs';

class File {

    #header;
    #records;

    constructor(header = {}, records = []) {
        if (header?.hasOwnProperty('HEADER')) {
            records = header.RECORDS;
            header = header.HEADER;
        }

        this.#header = new HeaderSegment(header);
        this.#records = records.map(record => new RecordSegment(record));
    }

    static fromJSON(s) {
        const obj = typeof s === 'string' ? JSON.parse(s) : s;
        return new File(obj);
    }

    toADI() {
        return [ '// This is an ADIF File', this.#header.toADI(), ...this.#records.map(record => record.toADI()) ].join('\r\n\r\n');
    }

    toJSON() {
        return {
            HEADER: this.#header.toJSON(),
            RECORDS: this.#records.map(record => record.toJSON()),
        };
    }
}

export default File;
