'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = DCL_QSL_RCVD;
