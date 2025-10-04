'use strict';

const FieldDef = require('./FieldDef');

class EQSL_AG extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_AG',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'EqslAg',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQSL_AG;
