'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class HamqthQsoUploadDateField extends Field {

    constructor(value) {
        super(HamqthQsoUploadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'HAMQTH_QSO_UPLOAD_DATE';
    }

}

export default HamqthQsoUploadDateField;
