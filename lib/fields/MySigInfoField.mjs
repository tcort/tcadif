'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MySigInfoField extends Field {

    constructor(value) {
        super(MySigInfoField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_SIG_INFO';
    }

}

export default MySigInfoField;
