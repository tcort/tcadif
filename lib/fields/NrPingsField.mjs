'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import IntegerDataType from '../datatypes/IntegerDataType.mjs';

class NrPingsField extends Field {

    constructor(value) {
        super(NrPingsField.fieldName, IntegerDataType, value);
    }

    static get fieldName() {
        return 'NR_BURSTS';
    }

    validate(value) {
        super.validate(value);

        const intValue = parseInt(value);
        const minValue = 1;
        const maxValue = Infinity;
        if (!(minValue <= intValue && intValue <= maxValue)) {
            throw new AdifError('NR_BURSTS field value out of range', { value, intValue, minValue, maxValue });
        }

        return true;
    }
}

export default NrPingsField;
