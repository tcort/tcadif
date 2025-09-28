'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class MorseKeyInfoField extends Field {

    constructor(value) {
        super(MorseKeyInfoField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'MORSE_KEY_INFO';
    }

}

export default MorseKeyInfoField;
