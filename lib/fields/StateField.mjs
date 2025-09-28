'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class StateField extends Field {

    constructor(value) {
        super(StateField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'STATE';
    }

}

export default StateField;
