'use strict';

const FieldDef = require('./FieldDef');

class MORSE_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MORSE_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MORSE_KEY_INFO;
