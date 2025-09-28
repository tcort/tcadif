'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyNameField extends Field {

    constructor(value) {
        super(MyNameField.fieldMyName, StringDataType, value);
    }

    static get fieldMyName() {
        return 'MY_NAME';
    }

}

export default MyNameField;
