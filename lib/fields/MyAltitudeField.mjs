'use strict';

import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class MyAltitudeField extends Field {

    constructor(value) {
        super(MyAltitudeField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'MY_ALTITUDE';
    }

}

export default MyAltitudeField;
