'use strict';

const FieldDef = require('./FieldDef');

class MORSE_KEY_TYPE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MORSE_KEY_TYPE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'MorseKeyType',
        });
    }
}

module.exports = MORSE_KEY_TYPE;
