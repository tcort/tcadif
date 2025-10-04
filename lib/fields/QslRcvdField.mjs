'use strict';

import Field from './Field.mjs';
import QslRcvdEnumerationDataType from '../datatypes/QslRcvdEnumerationDataType.mjs';

class QslRcvdField extends Field {

    constructor(value) {
        super(QslRcvdField.fieldName, QslRcvdEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QSL_RCVD';
    }

    get defaultValue() {
        return 'N';
    }

}

export default QslRcvdField;
