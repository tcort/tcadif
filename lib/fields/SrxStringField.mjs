'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SrxStringField extends Field {

    constructor(value) {
        super(SrxStringField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SRX_STRING';
    }

}

export default SrxStringField;
