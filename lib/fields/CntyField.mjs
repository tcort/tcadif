'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CntyField extends Field {

    constructor(value) {
        super(CntyField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CNTY';
    }

}

export default CntyField;
