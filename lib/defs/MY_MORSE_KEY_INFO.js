'use strict';

const FieldDef = require('./FieldDef');

class MY_MORSE_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_MORSE_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_MORSE_KEY_INFO;
