'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyCountryField extends Field {

    constructor(value) {
        super(MyCountryField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_COUNTRY';
    }

}

export default MyCountryField;
