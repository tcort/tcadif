'use strict';

const FieldDef = require('./FieldDef');

class QSO_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSO_DATE;
