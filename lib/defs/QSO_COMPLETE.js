'use strict';

const FieldDef = require('./FieldDef');

class QSO_COMPLETE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_COMPLETE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoComplete',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSO_COMPLETE;
