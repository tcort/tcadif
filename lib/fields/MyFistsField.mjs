'use strict';

import AdifError from '../errors/AdifError.mjs';
import Field from './Field.mjs';
import PositiveIntegerDataType from '../datatypes/PositiveIntegerDataType.mjs';

class MyFistsField extends Field {

    constructor(value) {
        super(MyFistsField.fieldName, PositiveIntegerDataType, value);
    }

    static get fieldName() {
        return 'MY_FISTS';
    }

}

export default MyFistsField;
