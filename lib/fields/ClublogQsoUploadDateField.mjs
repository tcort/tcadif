'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class ClublogQsoUploadDateField extends Field {

    constructor(value) {
        super(ClublogQsoUploadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'CLUBLOG_QSO_UPLOAD_DATE';
    }

}

export default ClublogQsoUploadDateField;
