'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyUsacaCountiesField extends Field {

    constructor(value) {
        super(MyUsacaCountiesField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_USACA_COUNTIES';
    }

}

export default MyUsacaCountiesField;
