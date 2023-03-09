'use strict';

const FieldDef = require('./FieldDef');

class QSO_DATE_OFF extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_DATE_OFF',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSO_DATE_OFF;
