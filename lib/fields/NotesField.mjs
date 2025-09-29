'use strict';

import Field from './Field.mjs';
import MultilineStringDataType from '../datatypes/MultilineStringDataType.mjs';

class NotesField extends Field {

    constructor(value) {
        super(NotesField.fieldName, MultilineStringDataType, value);
    }

    static get fieldName() {
        return 'NOTES';
    }

}

export default NotesField;
