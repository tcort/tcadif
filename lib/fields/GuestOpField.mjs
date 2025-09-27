'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class GuestOpField extends Field {

    constructor(value) {
        super(GuestOpField.fieldName, StringDataType, value);
    }

    get importOnly() {
        return true;
    }

    static get fieldName() {
        return 'GUEST_OP';
    }

}

export default GuestOpField;
