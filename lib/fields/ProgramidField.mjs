'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class ProgramidField extends Field {

    constructor(value) {
        super(ProgramidField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'PROGRAMID';
    }

}

export default ProgramidField;
