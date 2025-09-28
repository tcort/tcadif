'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyStateField extends Field {

    constructor(value) {
        super(MyStateField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_STATE';
    }

}

export default MyStateField;
