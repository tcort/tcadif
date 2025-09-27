'use strict';

import Field from './Field.mjs';
import LocationDataType from '../datatypes/LocationDataType.mjs';

class LonField extends Field {

    constructor(value) {
        super(LonField.fieldName, LocationDataType, value);
    }

    static get fieldName() {
        return 'LON';
    }

}

export default LonField;
