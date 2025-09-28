'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyPostalCodeField extends Field {

    constructor(value) {
        super(MyPostalCodeField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_POSTAL_CODE';
    }

}

export default MyPostalCodeField;
