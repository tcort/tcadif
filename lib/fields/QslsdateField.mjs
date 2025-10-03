'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QslsdateField extends Field {

    constructor(value) {
        super(QslsdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QSLSDATE';
    }

}

export default QslsdateField;
