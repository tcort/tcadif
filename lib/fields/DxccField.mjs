'use strict';

import Field from './Field.mjs';
import DxccEnumerationDataType from '../datatypes/DxccEnumerationDataType.mjs';

class DxccField extends Field {

    constructor(value) {
        super(DxccField.fieldName, DxccEnumerationDataType, value);
    }

    static get fieldName() {
        return 'DXCC';
    }

}

export default DxccField;
