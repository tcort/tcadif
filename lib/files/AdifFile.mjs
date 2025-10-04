'use strict';

import HeaderSegment from '../segments/HeaderSegment.mjs';
import RecordSegment from '../segments/RecordSegment.mjs';

class AdifFile {

    #header;
    #records;

    constructor(header = {}, records = []) {
        if (arguments.length === 1 && (header?.hasOwnProperty('HEADER') || header?.hasOwnProperty('RECORDS'))) {
            records = header.RECORDS;
            header = header.HEADER;
        }

        this.#header = new HeaderSegment(header);
        this.#records = records.map(record => new RecordSegment(record));
    }

    static fromADI(s) {
        let i = 0;
        const obj = { HEADER: {}, RECORDS: [] };
        if (s[i] !== '<') { // expect header
            const { segment, charactersConsumed } = HeaderSegment.fromADI(s.slice(i));
            obj.HEADER = segment;
            i += charactersConsumed;
        }

        while (i < s.length) {
            const { segment, charactersConsumed } = RecordSegment.fromADI(s.slice(i));
            if (segment !== null) {
                obj.RECORDS.push(segment);
            }
            i += charactersConsumed;
        }

        return AdifFile.fromObj(obj);
    }

    static fromObj(obj) {
        return new AdifFile(obj);
    }

    static fromJSON(s) {
        return AdifFile.fromObj(JSON.parse(s));
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

export default AdifFile;
