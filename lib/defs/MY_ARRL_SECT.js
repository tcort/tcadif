'use strict';

const FieldDef = require('./FieldDef');

class MY_ARRL_SECT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ARRL_SECT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'ArrlSect',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_ARRL_SECT;
