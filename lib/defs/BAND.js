'use strict';

const FieldDef = require('./FieldDef');

class BAND extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toLowerCase(),
        });
    }
}

module.exports = BAND;
