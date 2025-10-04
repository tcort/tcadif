'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class QslViaField extends Field {

    constructor(value) {
        super(QslViaField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'QSL_VIA';
    }

}

export default QslViaField;
