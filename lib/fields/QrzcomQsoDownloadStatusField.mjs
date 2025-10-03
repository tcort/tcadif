'use strict';

import Field from './Field.mjs';
import QsoDownloadStatusEnumerationDataType from '../datatypes/QsoDownloadStatusEnumerationDataType.mjs';

class QrzcomQsoDownloadStatusField extends Field {

    constructor(value) {
        super(QrzcomQsoDownloadStatusField.fieldName, QsoDownloadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QRZCOM_QSO_DOWNLOAD_STATUS';
    }

}

export default QrzcomQsoDownloadStatusField;
