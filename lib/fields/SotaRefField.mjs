'use strict';

import Field from './Field.mjs';
import SotaRefDataType from '../datatypes/SotaRefDataType.mjs';

class SotaRefField extends Field {

    constructor(value) {
        super(SotaRefField.fieldName, SotaRefDataType, value);
    }

    static get fieldName() {
        return 'SOTA_REF';
    }

}

export default SotaRefField;
