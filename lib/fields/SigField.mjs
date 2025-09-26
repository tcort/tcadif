'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SigField extends Field {

    constructor(value) {
        super(SigField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SIG';
    }

}

export default SigField;
