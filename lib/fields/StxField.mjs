'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class StxField extends Field {

    constructor(value) {
        super(StxField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'STX';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = Infinity;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('STX field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }
}

export default StxField;
