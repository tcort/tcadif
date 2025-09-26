'use strict';

import Field from './Field.mjs';
import BooleanDataType from '../datatypes/BooleanDataType.mjs';

class SwlField extends Field {

    constructor(value) {
        super(SwlField.fieldName, BooleanDataType, value);
    }

    static get fieldName() {
        return 'SWL';
    }

}

export default SwlField;
