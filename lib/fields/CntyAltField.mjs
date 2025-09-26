'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CntyAltField extends Field {

    constructor(value) {
        super(CntyAltField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'CNTY_ALT';
    }

}

export default CntyAltField;
