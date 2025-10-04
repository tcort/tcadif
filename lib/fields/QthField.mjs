'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class QthField extends Field {

    constructor(value) {
        super(QthField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'QTH';
    }

}

export default QthField;
