'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MyMorseKeyInfoField extends Field {

    constructor(value) {
        super(MyMorseKeyInfoField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MY_MORSE_KEY_INFO';
    }

}

export default MyMorseKeyInfoField;
