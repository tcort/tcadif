'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class NameField extends Field {

    constructor(value) {
        super(NameField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'NAME';
    }

}

export default NameField;
