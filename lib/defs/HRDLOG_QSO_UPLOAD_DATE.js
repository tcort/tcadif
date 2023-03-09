'use strict';

const FieldDef = require('./FieldDef');

class HRDLOG_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HRDLOG_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HRDLOG_QSO_UPLOAD_DATE;
