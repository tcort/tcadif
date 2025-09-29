'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyStreetField extends Field {

    constructor(value) {
        super(MyStreetField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_STREET';
    }

}

export default MyStreetField;
