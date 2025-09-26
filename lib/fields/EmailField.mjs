'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class EmailField extends Field {

    constructor(value) {
        super(EmailField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'EMAIL';
    }

}

export default EmailField;
