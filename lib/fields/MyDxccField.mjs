'use strict';

import Field from './Field.mjs';
import DxccEnumerationDataType from '../datatypes/DxccEnumerationDataType.mjs';

class MyDxccField extends Field {

    constructor(value) {
        super(MyDxccField.fieldName, DxccEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MY_DXCC';
    }

}

export default MyDxccField;
