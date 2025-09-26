'use strict';

import Field from './Field.mjs';
import ModeEnumerationDataType from '../datatypes/ModeEnumerationDataType.mjs';

class ModeField extends Field {

    constructor(value) {
        super(ModeField.fieldName, ModeEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MODE';
    }

}

export default ModeField;
