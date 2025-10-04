'use strict';

import Field from './Field.mjs';
import RegionEnumerationDataType from '../datatypes/RegionEnumerationDataType.mjs';

class RegionField extends Field {

    constructor(value) {
        super(RegionField.fieldName, RegionEnumerationDataType, value);
    }

    static get fieldName() {
        return 'REGION';
    }

}

export default RegionField;
