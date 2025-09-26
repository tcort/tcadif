'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QsoDateField extends Field {

    constructor(value) {
        super(QsoDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QSO_DATE';
    }

}

export default QsoDateField;
