'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import IntegerDataType from '../datatypes/IntegerDataType.mjs';

class KIndexField extends Field {

    constructor(value) {
        super(KIndexField.fieldName, IntegerDataType, value);
    }

    static get fieldName() {
        return 'K_INDEX';
    }

    validate(value) {
        super.validate(value);

        const length = value.length;
        const expectedLength = 1;
        if (length != expectedLength) {
            throw new AdifError('K_INDEX is not of the expected length', { value, length, expectedLength });
        }

        return true;
    }
}

export default KIndexField;
