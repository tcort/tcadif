'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQSL_QSL_RCVD;
