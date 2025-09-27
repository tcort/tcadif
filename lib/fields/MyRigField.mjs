'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyRigField extends Field {

    constructor(value) {
        super(MyRigField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_RIG';
    }

}

export default MyRigField;
