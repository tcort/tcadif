'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class TenTenField extends Field {

    constructor(value) {
        super(TenTenField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'TEN_TEN';
    }

}

export default TenTenField;
