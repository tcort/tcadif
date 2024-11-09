'use strict';

const FieldDef = require('./FieldDef');

class MY_MORSE_KEY_TYPE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_MORSE_KEY_TYPE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'MorseKeyType',
        });
    }
}

module.exports = MY_MORSE_KEY_TYPE;
