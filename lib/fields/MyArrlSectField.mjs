'use strict';

import Field from './Field.mjs';
import ArrlSectionEnumerationDataType from '../datatypes/ArrlSectionEnumerationDataType.mjs';

class MyArrlSectField extends Field {

    constructor(value) {
        super(MyArrlSectField.fieldName, ArrlSectionEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MY_ARRL_SECT';
    }

}

export default MyArrlSectField;
