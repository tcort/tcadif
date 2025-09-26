'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class ItuzField extends Field {

    constructor(value) {
        super(ItuzField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'ITUZ';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = 90;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('ITUZ field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default ItuzField;
