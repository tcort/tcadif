'use strict';

import Field from './Field.mjs';
import MorseKeyTypeEnumerationDataType from '../datatypes/MorseKeyTypeEnumerationDataType.mjs';

class MyMorseKeyTypeField extends Field {

    constructor(value) {
        super(MyMorseKeyTypeField.fieldName, MorseKeyTypeEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MY_MORSE_KEY_TYPE';
    }

}

export default MyMorseKeyTypeField;
