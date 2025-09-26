'use strict';

import Field from './Field.mjs';
import MultilineStringDataType from '../datatypes/MultilineStringDataType.mjs';

class AddressField extends Field {

    constructor(value) {
        super(AddressField.fieldName, MultilineStringDataType, value);
    }

    static get fieldName() {
        return 'ADDRESS';
    }

}

export default AddressField;
