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

    // TODO fromADI() (ADI parser)

    static fromObj(obj) {
        return new File(obj);
    }

    static fromJSON(s) {
        return File.fromObj(JSON.parse(s));
    }

    toADI() {
        return [ '// This is an ADIF File', this.#header.toADI(), ...this.#records.map(record => record.toADI()) ].join('\r\n\r\n');
    }

    toObj() {
        return {
            HEADER: this.#header.toObj(),
            RECORDS: this.#records.map(record => record.toObj()),
        };
    }

    toJSON() {
        return JSON.stringify(this.toObj(), null, 4);
    }
}

export default File;
