'use strict';

import Field from './Field.mjs';
import QsoUploadStatusEnumerationDataType from '../datatypes/QsoUploadStatusEnumerationDataType.mjs';

class HamlogeuQsoUploadStatusField extends Field {

    constructor(value) {
        super(HamlogeuQsoUploadStatusField.fieldName, QsoUploadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'HAMLOGEU_QSO_UPLOAD_STATUS';
    }

}

export default HamlogeuQsoUploadStatusField;
