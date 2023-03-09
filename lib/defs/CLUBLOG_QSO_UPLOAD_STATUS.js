'use strict';

const FieldDef = require('./FieldDef');

class CLUBLOG_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLUBLOG_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = CLUBLOG_QSO_UPLOAD_STATUS;
