'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class OperatorField extends Field {

    constructor(value) {
        super(OperatorField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'OPERATOR';
    }

}

export default OperatorField;
