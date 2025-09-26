'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';

class CharacterDataType extends DataType {

    static validate(value) {

        const expectedLength = 1;
        const minCharCode = 32;
        const maxCharCode = 126;

        if (typeof value !== 'string') {
            throw new AdifError('type of value not valid for CharacterDataType', { value, type: typeof value  });
        }

        const length = value.length;
        if (length !== expectedLength) { 
            throw new AdifError('length of value not valid for CharacterDataType', { value, length, expectedLength });
        }

        const charCode = value.charCodeAt(0);
        if (!(minCharCode <= charCode && charCode <= maxCharCode)) {
            throw new AdifError('value not valid for CharacterDataType', { value, minCharCode, maxCharCode, charCode });
        }

        return true;
    }

}

export default CharacterDataType;
