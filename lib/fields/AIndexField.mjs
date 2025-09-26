'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class AIndexField extends Field {

    constructor(value) {
        super(AIndexField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'A_INDEX';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = 400;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('A_INDEX field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }
}

export default AIndexField;
