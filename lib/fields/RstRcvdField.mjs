'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class RstRcvdField extends Field {

    constructor(value) {
        super(RstRcvdField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'RST_RCVD';
    }

}

export default RstRcvdField;
