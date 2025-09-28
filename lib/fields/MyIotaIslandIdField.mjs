'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class MyIotaIslandIdFieldField extends Field {

    constructor(value) {
        super(MyIotaIslandIdFieldField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'MY_IOTA_ISLAND_ID';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = 99999999;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('IOTA Island ID field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default MyIotaIslandIdFieldField;
