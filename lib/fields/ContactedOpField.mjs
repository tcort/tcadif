'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class ContactedOpField extends Field {

    constructor(value) {
        super(ContactedOpField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CONTACTED_OP';
    }

}

export default ContactedOpField;
