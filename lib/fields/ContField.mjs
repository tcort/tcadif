'use strict';

import Field from './Field.mjs';
import ContinentEnumerationDataType from '../datatypes/ContinentEnumerationDataType.mjs';

class ContField extends Field {

    constructor(value) {
        super(ContField.fieldName, ContinentEnumerationDataType, value);
    }

    static get fieldName() {
        return 'CONT';
    }

}

export default ContField;
