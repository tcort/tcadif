'use strict';

import Field from './Field.mjs';
import QslViaEnumerationDataType from '../datatypes/QslViaEnumerationDataType.mjs';

class QslRcvdViaField extends Field {

    constructor(value) {
        super(QslRcvdViaField.fieldName, QslViaEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QSL_RCVD_VIA';
    }

}

export default QslRcvdViaField;
