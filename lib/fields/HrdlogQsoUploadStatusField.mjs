'use strict';

import Field from './Field.mjs';
import QsoUploadStatusEnumerationDataType from '../datatypes/QsoUploadStatusEnumerationDataType.mjs';

class HrdlogQsoUploadStatusField extends Field {

    constructor(value) {
        super(HrdlogQsoUploadStatusField.fieldName, QsoUploadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'HRDLOG_QSO_UPLOAD_STATUS';
    }

}

export default HrdlogQsoUploadStatusField;
