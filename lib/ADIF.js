'use strict';

const Field = require('./Field');
const Header = require('./Header');
const QSO = require('./QSO');
const os = require('os');

class ADIF {

    #header = null;
    #qsos = [];

    constructor(obj = {}) {
        this.#header = obj?.header ?? null;
        this.#qsos = Array.isArray(obj?.qsos) ? obj.qsos.map(qso => qso instanceof QSO ? qso : new QSO(qso)) : [];
    }

    static parse(text = '') {

        let fields = [];

        const adif = {
            header: null,
            qsos: [],
        };

        do {

            const field = Field.parse(text);
            if (field === null) {
                break;
            }

            text = text.slice(field.bytesConsumed);

            if (field.fieldName === 'EOR' || field.fieldName === 'EOH') {
                const entries = fields;
                fields = [];

                const block = Object.fromEntries(entries);
                if (field.fieldName === 'EOH') { // end-of-header
                    adif.header = new Header(block);
                } else { // end-of-record;
                    adif.qsos.push(new QSO(block));
                }
            } else {
                fields.push(field.toEntry());
            }

        } while (true);

        return new ADIF(adif);

    }

    toObject() {
        const adif = { header: null, qsos: [] };

        if (this.#header !== null) {
            adif.header = this.#header.toObject();
        }

        adif.qsos = this.#qsos.map(qso => qso.toObject());

        return adif;
    }

    stringify() {

        const result = [];

        if (this.#header) {
            result.push(this.#header.stringify());
        }

        this.#qsos.forEach(qso => result.push(qso.stringify()));

        return result.join(`${os.EOL}${os.EOL}`);
    }

    get header() {
        return new Header(this.#header.toObject());
    }

    get qsos() {
        return this.#qsos.map(qso => new QSO(qso.toObject()));
    }

}

module.exports = ADIF;
