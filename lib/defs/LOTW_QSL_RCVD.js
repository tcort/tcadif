'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LOTW_QSL_RCVD;
