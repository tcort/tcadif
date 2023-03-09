'use strict';

const FieldDef = require('./FieldDef');

class QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_RCVD;
