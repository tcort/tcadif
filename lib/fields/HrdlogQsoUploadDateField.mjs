'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class HrdlogQsoUploadDateField extends Field {

    constructor(value) {
        super(HrdlogQsoUploadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'HRDLOG_QSO_UPLOAD_DATE';
    }

}

export default HrdlogQsoUploadDateField;
