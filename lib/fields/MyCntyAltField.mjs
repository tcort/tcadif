'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyCntyAltField extends Field {

    constructor(value) {
        super(MyCntyAltField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_CNTY_ALT';
    }

}

export default MyCntyAltField;
