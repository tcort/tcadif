'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class RxPwrField extends Field {

    constructor(value) {
        super(RxPwrField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'RX_PWR';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = Infinity;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('RX_PWR field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }
}

export default RxPwrField;
