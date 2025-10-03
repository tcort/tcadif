'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class PrecedenceField extends Field {

    constructor(value) {
        super(PrecedenceField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'PRECEDENCE';
    }

}

export default PrecedenceField;
