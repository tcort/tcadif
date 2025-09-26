'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CheckField extends Field {

    constructor(value) {
        super(CheckField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CHECK';
    }

}

export default CheckField;
