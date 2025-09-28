'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class MyCqZoneField extends Field {

    constructor(value) {
        super(MyCqZoneField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'MY_CQ_ZONE';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = 40;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('MY_CQ_ZONE field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default MyCqZoneField;
