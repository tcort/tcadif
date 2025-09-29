'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class PfxField extends Field {

    constructor(value) {
        super(PfxField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'PFX';
    }

}

export default PfxField;
