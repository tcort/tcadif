'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class StringDataType extends DataType {

    static get dataTypeIndicator() {
        return 'S';
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for StringDataType', { value });
        }

        value.split('').forEach(ch => CharacterDataType.validate(ch));

        return true;
    }

}

export default StringDataType;
