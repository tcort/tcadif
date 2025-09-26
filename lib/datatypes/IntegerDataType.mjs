'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import DigitDataType from './DigitDataType.mjs';

class IntegerDataType extends DataType {

    static normalize(value) {
        value = (typeof value === 'number') ? `${value}` : value;
        if (/^0+/.test(value)) { // strip leading zeros
            value = value.replace(/^0+/, '');
            value = value.length === 0 ? '0' : value;
        }
        if (/^-0+/.test(value)) { // strip leading zeros
            value = value.replace(/^-0+/, '-');
            value = value === '-' ? '0' : value;
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for IntegerDataType', { value });
        }

        if (value.charCodeAt(0) === 45) { // minus sign
            value = value.slice(1);
        }

        value.split('').forEach(ch => DigitDataType.validate(ch));

        return true;
    }

}

export default IntegerDataType;
