'use strict';

import Field from './Field.mjs';
import QslViaEnumerationDataType from '../datatypes/QslViaEnumerationDataType.mjs';

class QslSentViaField extends Field {

    constructor(value) {
        super(QslSentViaField.fieldName, QslViaEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QSL_SENT_VIA';
    }

}

export default QslSentViaField;
