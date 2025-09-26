'use strict';

import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class AntAzField extends Field {

    constructor(value) {
        super(AntAzField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'ANT_AZ';
    }

    normalize(value) {
        if (!isNaN(parseFloat(value)) && parseFloat(value) > 360) {
            value = parseFloat(value) % 360;
        }
        return super.normalize(value);
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = 0;
        const maxValue = 360;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('ANT_AZ field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }

}

export default AntAzField;
