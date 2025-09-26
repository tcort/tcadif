'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import DigitDataType from './DigitDataType.mjs';

class PositiveIntegerDataType extends DataType {

    static normalize(value) {
        value = (typeof value === 'number') ? `${value}` : value;
        if (/^0+/.test(value)) { // strip leading zeros
            value = value.replace(/^0+/, '');
            value = value.length === 0 ? '0' : value;
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for PositiveIntegerDataType', { value });
        }

        value.split('').forEach(ch => DigitDataType.validate(ch));

        const intValue = parseInt(value);
        const minValue = 1;
        if (!(minValue <= intValue)) {
            throw new AdifError('value not valid for PositiveIntegerDataType', { value, minValue });
        }

        return true;
    }

}

export default PositiveIntegerDataType;
