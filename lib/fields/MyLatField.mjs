'use strict';

import Field from './Field.mjs';
import LocationDataType from '../datatypes/LocationDataType.mjs';

class MyLatField extends Field {

    constructor(value) {
        super(MyLatField.fieldName, LocationDataType, value);
    }

    static get fieldName() {
        return 'MY_LAT';
    }

}

export default MyLatField;
