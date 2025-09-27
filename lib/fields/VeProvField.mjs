'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class VeProvField extends Field {

    constructor(value) {
        super(VeProvField.fieldName, StringDataType, value);
    }

    get importOnly() {
        return true;
    }

    static get fieldName() {
        return 'VE_PROV';
    }

}

export default VeProvField;
