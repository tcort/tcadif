'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class OwnerCallsignField extends Field {

    constructor(value) {
        super(OwnerCallsignField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'OWNER_CALLSIGN';
    }

}

export default OwnerCallsignField;
