'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MsShowerField extends Field {

    constructor(value) {
        super(MsShowerField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MS_SHOWER';
    }

}

export default MsShowerField;
