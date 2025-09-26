'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class CommentField extends Field {

    constructor(value) {
        super(CommentField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'COMMENT';
    }

}

export default CommentField;
