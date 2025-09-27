'use strict';

import Field from './Field.mjs';
import MultilineStringDataType from '../datatypes/MultilineStringDataType.mjs';

class RigField extends Field {

    constructor(value) {
        super(RigField.fieldName, MultilineStringDataType, value);
    }

    static get fieldName() {
        return 'RIG';
    }

}

export default RigField;
