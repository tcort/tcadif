'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class HamlogeuQsoUploadDateField extends Field {

    constructor(value) {
        super(HamlogeuQsoUploadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'HAMLOGEU_QSO_UPLOAD_DATE';
    }

}

export default HamlogeuQsoUploadDateField;
