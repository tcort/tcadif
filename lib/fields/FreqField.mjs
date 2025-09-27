'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class FreqField extends Field {

    constructor(value) {
        super(FreqField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'FREQ';
    }

}

export default FreqField;
