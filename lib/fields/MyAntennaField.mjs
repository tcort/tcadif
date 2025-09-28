'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyAntennaField extends Field {

    constructor(value) {
        super(MyAntennaField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_ANTENNA';
    }

}

export default MyAntennaField;
