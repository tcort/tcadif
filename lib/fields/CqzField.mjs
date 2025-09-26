'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class CqzField extends Field {

    constructor(value) {
        super(CqzField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'CQZ';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = 40;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('CQZ field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default CqzField;
