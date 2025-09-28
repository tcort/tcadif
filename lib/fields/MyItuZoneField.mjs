'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class MyItuZoneField extends Field {

    constructor(value) {
        super(MyItuZoneField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'MY_ITU_ZONE';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = 90;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('MY_ITU_ZONE field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default MyItuZoneField;
