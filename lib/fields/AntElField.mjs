'use strict';

import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class AntElField extends Field {

    constructor(value) {
        super(AntElField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'ANT_EL';
    }

    normalize(value) {
        if (!isNaN(parseFloat(value)) && parseFloat(value) > 90) {
            value = parseFloat(value) % 90;
        }
        if (!isNaN(parseFloat(value)) && parseFloat(value) < -90) {
            value = -1 * ((-1 * parseFloat(value)) % 90);
        }
        return super.normalize(value);
    }

    validate(value) {
        super.validate(value);

        const floatValue = parseFloat(value);
        const minValue = -90;
        const maxValue = 90;
        if (!(minValue <= floatValue && floatValue <= maxValue)) {
            throw new AdifError('ANT_EL field value out of range', { value, floatValue, minValue, maxValue });
        }

        return true;
    }

}

export default AntElField;
