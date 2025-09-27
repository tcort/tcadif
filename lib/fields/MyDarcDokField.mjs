'use strict';

import Field from './Field.mjs';
import DarcDokEnumerationDataType from '../datatypes/DarcDokEnumerationDataType.mjs';

class MyDarcDokField extends Field {

    constructor(value) {
        super(MyDarcDokField.fieldName, DarcDokEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MY_DARC_DOK';
    }

}

export default MyDarcDokField;
