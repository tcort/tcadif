'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CallField extends Field {

    constructor(value) {
        super(CallField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CALL';
    }

}

export default CallField;
