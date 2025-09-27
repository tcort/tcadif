'use strict';

import Field from './Field.mjs';
import EqslAgEnumerationDataType from '../datatypes/EqslAgEnumerationDataType.mjs';

class EqslAgField extends Field {

    constructor(value) {
        super(EqslAgField.fieldName, EqslAgEnumerationDataType, value);
    }

    static get fieldName() {
        return 'EQSL_AG';
    }

}

export default EqslAgField;
