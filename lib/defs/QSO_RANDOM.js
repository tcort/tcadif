'use strict';

const FieldDef = require('./FieldDef');

class QSO_RANDOM extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_RANDOM',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = QSO_RANDOM;
