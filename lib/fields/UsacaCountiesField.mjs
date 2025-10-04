'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class UsacaCountiesField extends Field {

    constructor(value) {
        super(UsacaCountiesField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'USACA_COUNTIES';
    }

}

export default UsacaCountiesField;
