'use strict';

import Field from './Field.mjs';
import BooleanDataType from '../datatypes/BooleanDataType.mjs';

class QsoRandomField extends Field {

    constructor(value) {
        super(QsoRandomField.fieldName, BooleanDataType, value);
    }

    static get fieldName() {
        return 'QSO_RANDOM';
    }

}

export default QsoRandomField;
