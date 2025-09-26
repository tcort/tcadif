'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SkccField extends Field {

    constructor(value) {
        super(SkccField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SKCC';
    }

}

export default SkccField;
