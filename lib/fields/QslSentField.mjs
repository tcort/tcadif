'use strict';

import Field from './Field.mjs';
import QslSentEnumerationDataType from '../datatypes/QslSentEnumerationDataType.mjs';

class QslSentField extends Field {

    constructor(value) {
        super(QslSentField.fieldName, QslSentEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QSL_SENT';
    }

    get defaultValue() {
        return 'N';
    }
}

export default QslSentField;
