'use strict';

const FieldDef = require('./FieldDef');

class ARRL_SECT extends FieldDef {
    constructor() {
        super({
            fieldName: 'ARRL_SECT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'ArrlSect',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = ARRL_SECT;
