'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class FreqRxField extends Field {

    constructor(value) {
        super(FreqRxField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'FREQ_RX';
    }

}

export default FreqRxField;
