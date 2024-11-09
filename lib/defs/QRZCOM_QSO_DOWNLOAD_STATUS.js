'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_DOWNLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_DOWNLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoDownloadStatus',
        });
    }
}

module.exports = QRZCOM_QSO_DOWNLOAD_STATUS;
