'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_DOWNLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_DOWNLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QRZCOM_QSO_DOWNLOAD_DATE;
