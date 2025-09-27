'use strict';

import Field from './Field.mjs';
import DarcDokEnumerationDataType from '../datatypes/DarcDokEnumerationDataType.mjs';

class DarcDokField extends Field {

    constructor(value) {
        super(DarcDokField.fieldName, DarcDokEnumerationDataType, value);
    }

    static get fieldName() {
        return 'DARC_DOK';
    }

}

export default DarcDokField;
