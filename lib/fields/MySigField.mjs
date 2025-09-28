'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MySigField extends Field {

    constructor(value) {
        super(MySigField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_SIG';
    }

}

export default MySigField;
