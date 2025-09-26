'use strict';

import Field from './Field.mjs';
import BooleanDataType from '../datatypes/BooleanDataType.mjs';

class ForceInitField extends Field {

    constructor(value) {
        super(ForceInitField.fieldName, BooleanDataType, value);
    }

    static get fieldName() {
        return 'FORCE_INIT';
    }

}

export default ForceInitField;
