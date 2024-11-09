'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = DCL_QSL_SENT;
