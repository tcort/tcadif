'use strict';

import Field from './Field.mjs';
import QsoUploadStatusEnumerationDataType from '../datatypes/QsoUploadStatusEnumerationDataType.mjs';

class QrzcomQsoUploadStatusField extends Field {

    constructor(value) {
        super(QrzcomQsoUploadStatusField.fieldName, QsoUploadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QRZCOM_QSO_UPLOAD_STATUS';
    }

}

export default QrzcomQsoUploadStatusField;
