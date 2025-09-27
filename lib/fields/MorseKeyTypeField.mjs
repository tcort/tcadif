'use strict';

import Field from './Field.mjs';
import MorseKeyTypeEnumerationDataType from '../datatypes/MorseKeyTypeEnumerationDataType.mjs';

class MorseKeyTypeField extends Field {

    constructor(value) {
        super(MorseKeyTypeField.fieldName, MorseKeyTypeEnumerationDataType, value);
    }

    static get fieldName() {
        return 'MORSE_KEY_TYPE';
    }

}

export default MorseKeyTypeField;
