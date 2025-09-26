'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class WebField extends Field {

    constructor(value) {
        super(WebField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'WEB';
    }

}

export default WebField;
