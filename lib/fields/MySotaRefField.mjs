'use strict';

import Field from './Field.mjs';
import SotaRefDataType from '../datatypes/SotaRefDataType.mjs';

class MySotaRefField extends Field {

    constructor(value) {
        super(MySotaRefField.fieldName, SotaRefDataType, value);
    }

    static get fieldName() {
        return 'MY_SOTA_REF';
    }

}

export default MySotaRefField;
