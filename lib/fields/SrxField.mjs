'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class SrxField extends Field {

    constructor(value) {
        super(SrxField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'SRX';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = Infinity;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('SRX field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }
}

export default SrxField;
