'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class FistsCcField extends Field {

    constructor(value) {
        super(FistsCcField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'FISTS_CC';
    }

}

export default FistsCcField;
