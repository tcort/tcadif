'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class ProgramversionField extends Field {

    constructor(value) {
        super(ProgramversionField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'PROGRAMVERSION';
    }

}

export default ProgramversionField;
