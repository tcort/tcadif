'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SatNameField extends Field {

    constructor(value) {
        super(SatNameField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SAT_NAME';
    }

}

export default SatNameField;
