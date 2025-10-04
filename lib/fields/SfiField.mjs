'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class SfiField extends Field {

    constructor(value) {
        super(SfiField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'SFI';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = 300;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('SFI field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }
}

export default SfiField;
