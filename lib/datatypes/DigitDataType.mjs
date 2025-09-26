'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';

class DigitDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'number') ? `${value}` : value;
    }

    static validate(value) {

        const expectedLength = 1;
        const minCharCode = 48;
        const maxCharCode = 57;

        if (typeof value !== 'string') {
            throw new AdifError('type of value not valid for DigitDataType', { value, type: typeof value  });
        }

        const length = value.length;
        if (length !== expectedLength) { 
            throw new AdifError('length of value not valid for DigitDataType', { value, length, expectedLength });
        }

        const charCode = value.charCodeAt(0);
        if (!(minCharCode <= charCode && charCode <= maxCharCode)) {
            throw new AdifError('value not valid for DigitDataType', { value, minCharCode, maxCharCode, charCode });
        }

        return true;
    }

}

export default DigitDataType;
