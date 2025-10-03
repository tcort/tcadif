'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QslrdateField extends Field {

    constructor(value) {
        super(QslrdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QSLRDATE';
    }

}

export default QslrdateField;
