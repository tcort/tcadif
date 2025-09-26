'use strict';

import Field from './Field.mjs';
import BooleanDataType from '../datatypes/BooleanDataType.mjs';

class SilentKeyField extends Field {

    constructor(value) {
        super(SilentKeyField.fieldName, BooleanDataType, value);
    }

    static get fieldName() {
        return 'SILENT_KEY';
    }

}

export default SilentKeyField;
