'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyCntyField extends Field {

    constructor(value) {
        super(MyCntyField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_CNTY';
    }

}

export default MyCntyField;
