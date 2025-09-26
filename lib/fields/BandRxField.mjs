'use strict';

import Field from './Field.mjs';
import BandEnumerationDataType from '../datatypes/BandEnumerationDataType.mjs';

class BandRxField extends Field {

    constructor(value) {
        super(BandRxField.fieldName, BandEnumerationDataType, value);
    }

    static get fieldName() {
        return 'BAND_RX';
    }

}

export default BandRxField;
