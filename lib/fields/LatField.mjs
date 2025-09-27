'use strict';

import Field from './Field.mjs';
import LocationDataType from '../datatypes/LocationDataType.mjs';

class LatField extends Field {

    constructor(value) {
        super(LatField.fieldName, LocationDataType, value);
    }

    static get fieldName() {
        return 'LAT';
    }

}

export default LatField;
