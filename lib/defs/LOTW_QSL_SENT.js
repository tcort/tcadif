'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LOTW_QSL_SENT;
