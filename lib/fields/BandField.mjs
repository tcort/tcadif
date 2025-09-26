'use strict';

import Field from './Field.mjs';
import BandEnumerationDataType from '../datatypes/BandEnumerationDataType.mjs';

class BandField extends Field {

    constructor(value) {
        super(BandField.fieldName, BandEnumerationDataType, value);
    }

    static get fieldName() {
        return 'BAND';
    }

}

export default BandField;
