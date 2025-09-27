'use strict';

import Field from './Field.mjs';
import QsoCompleteEnumerationDataType from '../datatypes/QsoCompleteEnumerationDataType.mjs';

class QsoCompleteField extends Field {

    constructor(value) {
        super(QsoCompleteField.fieldName, QsoCompleteEnumerationDataType, value);
    }

    static get fieldName() {
        return 'QSO_COMPLETE';
    }

}

export default QsoCompleteField;
