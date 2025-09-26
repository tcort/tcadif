'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CountryField extends Field {

    constructor(value) {
        super(CountryField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'COUNTRY';
    }

}

export default CountryField;
