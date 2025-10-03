'use strict';

import Field from './Field.mjs';
import MultilineStringDataType from '../datatypes/MultilineStringDataType.mjs';

class QslmsgRcvdField extends Field {

    constructor(value) {
        super(QslmsgRcvdField.fieldName, MultilineStringDataType, value);
    }

    static get fieldName() {
        return 'QSLMSG_RCVD';
    }

}

export default QslmsgRcvdField;
