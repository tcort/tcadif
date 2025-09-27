'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class FistsField extends Field {

    constructor(value) {
        super(FistsField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'FISTS';
    }

}

export default FistsField;
