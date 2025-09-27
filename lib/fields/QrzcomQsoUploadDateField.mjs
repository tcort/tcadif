'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QrzcomQsoUploadDateField extends Field {

    constructor(value) {
        super(QrzcomQsoUploadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QRZCOM_QSO_UPLOAD_DATE';
    }

}

export default QrzcomQsoUploadDateField;
