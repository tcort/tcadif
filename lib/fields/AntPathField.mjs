'use strict';

import Field from './Field.mjs';
import AntPathEnumerationDataType from '../datatypes/AntPathEnumerationDataType.mjs';

class AntPathField extends Field {

    constructor(value) {
        super(AntPathField.fieldName, AntPathEnumerationDataType, value);
    }

    static get fieldName() {
        return 'ANT_PATH';
    }

}

export default AntPathField;
