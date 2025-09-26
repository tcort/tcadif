'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SigInfoField extends Field {

    constructor(value) {
        super(SigInfoField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SIG_INFO';
    }

}

export default SigInfoField;
