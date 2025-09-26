'use strict';

import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class AgeField extends Field {

    constructor(value) {
        super(AgeField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'AGE';
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = 120;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('AGE field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }

}

export default AgeField;
