'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QsoDateOffField extends Field {

    constructor(value) {
        super(QsoDateOffField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QSO_DATE_OFF';
    }

}

export default QsoDateOffField;
