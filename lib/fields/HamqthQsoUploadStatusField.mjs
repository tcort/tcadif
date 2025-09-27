'use strict';

import Field from './Field.mjs';
import QsoUploadStatusEnumerationDataType from '../datatypes/QsoUploadStatusEnumerationDataType.mjs';

class HamqthQsoUploadStatusField extends Field {

    constructor(value) {
        super(HamqthQsoUploadStatusField.fieldName, QsoUploadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'HAMQTH_QSO_UPLOAD_STATUS';
    }

}

export default HamqthQsoUploadStatusField;
