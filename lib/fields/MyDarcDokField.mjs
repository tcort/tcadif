'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyDarcDokField extends Field {

    constructor(value) {
        super(MyDarcDokField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_DARC_DOK';
    }

}

export default MyDarcDokField;
