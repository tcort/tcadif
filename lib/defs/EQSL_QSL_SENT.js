'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQSL_QSL_SENT;
