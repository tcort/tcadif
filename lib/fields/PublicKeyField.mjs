'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class PublicKeyField extends Field {

    constructor(value) {
        super(PublicKeyField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'PUBLIC_KEY';
    }

}

export default PublicKeyField;
