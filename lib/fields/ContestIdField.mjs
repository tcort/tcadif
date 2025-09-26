'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class ContestIdField extends Field {

    constructor(value) {
        super(ContestIdField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CONTEST_ID';
    }

}

export default ContestIdField;
