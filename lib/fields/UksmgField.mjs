'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class UksmgField extends Field {

    constructor(value) {
        super(UksmgField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'UKSMG';
    }

}

export default UksmgField;
