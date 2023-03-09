'use strict';

const Field = require('./Field');
const Header = require('./Header');
const QSO = require('./QSO');
const { Duplex } = require('stream');

class AdifReader extends Duplex {

    #queue = '';
    #fields = [];

    constructor() {
        super({
            readableObjectMode: true,
        });
    }

    appendQueue(chunk) {
        this.#queue = [ this.#queue, chunk.toString() ].join('');
    }

    processFields(endTag) {
        const entries = this.#fields;
        this.#fields = [];

        const block = Object.fromEntries(entries);
        if (endTag === 'EOH') { // end-of-header
            // end-of-record;
            this.emit('header', new Header(block));
            return;
        }

        // end-of-record;
        this.emit('record', new QSO(block));
        this.push(new QSO(block).toObject());
    }

    processQueue() {

        while (this.readableFlowing) { // process as many fields as we can
            const field = Field.parse(this.#queue);
            if (field === null) {
                break;
            }
            this.#queue = this.#queue.slice(field.bytesConsumed);
            this.emit('field', field.toEntry());

            if (field.fieldName === 'EOR' || field.fieldName === 'EOH') {
                this.processFields(field.fieldName);
            } else {
                this.#fields.push(field.toEntry());
            }
        }
    }

    _read(size) {
        this.processQueue();
    }

    _write(chunk, encoding, callback) {
        this.appendQueue(chunk);
        callback(null);        
    }

    _final(callback) {
        this.processQueue();
        callback(null);
    }
}

module.exports = AdifReader;
