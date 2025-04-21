'use strict';

const FieldDef = require('./FieldDef');

class QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_SENT;
