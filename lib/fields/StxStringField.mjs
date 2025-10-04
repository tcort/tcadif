'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class StxStringField extends Field {

    constructor(value) {
        super(StxStringField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'STX_STRING';
    }

}

export default StxStringField;
