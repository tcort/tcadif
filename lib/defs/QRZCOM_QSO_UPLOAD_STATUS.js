'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = QRZCOM_QSO_UPLOAD_STATUS;
