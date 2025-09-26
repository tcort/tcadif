'use strict';

import Field from './Field.mjs';
import QsoUploadStatusEnumerationDataType from '../datatypes/QsoUploadStatusEnumerationDataType.mjs';

class ClublogQsoUploadStatusField extends Field {

    constructor(value) {
        super(ClublogQsoUploadStatusField.fieldName, QsoUploadStatusEnumerationDataType, value);
    }

    static get fieldName() {
        return 'CLUBLOG_QSO_UPLOAD_STATUS';
    }

}

export default ClublogQsoUploadStatusField;
