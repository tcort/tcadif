'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class EqCallField extends Field {

    constructor(value) {
        super(EqCallField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'EQ_CALL';
    }

}

export default EqCallField;
