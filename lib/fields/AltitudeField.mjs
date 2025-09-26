'use strict';

import Field from './Field.mjs';
import NumberDataType from '../datatypes/NumberDataType.mjs';

class AltitudeField extends Field {

    constructor(value) {
        super(AltitudeField.fieldName, NumberDataType, value);
    }

    static get fieldName() {
        return 'ALTITUDE';
    }

}

export default AltitudeField;
