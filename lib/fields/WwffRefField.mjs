'use strict';

import Field from './Field.mjs';
import WwffRefDataType from '../datatypes/WwffRefDataType.mjs';

class WwffRefField extends Field {

    constructor(value) {
        super(WwffRefField.fieldName, WwffRefDataType, value);
    }

    static get fieldName() {
        return 'WWFF_REF';
    }

}

export default WwffRefField;
