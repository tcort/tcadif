'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class ClassField extends Field {

    constructor(value) {
        super(ClassField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CLASS';
    }

}

export default ClassField;
