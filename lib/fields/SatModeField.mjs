'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class SatModeField extends Field {

    constructor(value) {
        super(SatModeField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'SAT_MODE';
    }

}

export default SatModeField;
