'use strict';

import Field from './Field.mjs';
import MultilineStringDataType from '../datatypes/MultilineStringDataType.mjs';

class QslmsgField extends Field {

    constructor(value) {
        super(QslmsgField.fieldName, MultilineStringDataType, value);
    }

    static get fieldName() {
        return 'QSLMSG';
    }

}

export default QslmsgField;
