'use strict';

import Field from './Field.mjs';
import SubmodeEnumerationDataType from '../datatypes/SubmodeEnumerationDataType.mjs';

class SubmodeField extends Field {

    constructor(value) {
        super(SubmodeField.fieldName, SubmodeEnumerationDataType, value);
    }

    static get fieldName() {
        return 'SUBMODE';
    }

}

export default SubmodeField;
