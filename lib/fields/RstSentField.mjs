'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class RstSentField extends Field {

    constructor(value) {
        super(RstSentField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'RST_SENT';
    }

}

export default RstSentField;
