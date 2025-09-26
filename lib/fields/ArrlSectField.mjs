'use strict';

import Field from './Field.mjs';
import ArrlSectionEnumerationDataType from '../datatypes/ArrlSectionEnumerationDataType.mjs';

class ArrlSectField extends Field {

    constructor(value) {
        super(ArrlSectField.fieldName, ArrlSectionEnumerationDataType, value);
    }

    static get fieldName() {
        return 'ARRL_SECT';
    }

}

export default ArrlSectField;
