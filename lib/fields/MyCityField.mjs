'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyCityField extends Field {

    constructor(value) {
        super(MyCityField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_CITY';
    }

}

export default MyCityField;
