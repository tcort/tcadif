'use strict';

const FieldDef = require('./FieldDef');

class CLUBLOG_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLUBLOG_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = CLUBLOG_QSO_UPLOAD_DATE;
