'use strict';

import Field from './Field.mjs';
import LocationDataType from '../datatypes/LocationDataType.mjs';

class MyLonField extends Field {

    constructor(value) {
        super(MyLonField.fieldName, LocationDataType, value);
    }

    static get fieldName() {
        return 'MY_LON';
    }

}

export default MyLonField;
