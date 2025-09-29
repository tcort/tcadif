'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class WwffRefDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'string') ? value.toUpperCase() : value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for WwffRefDataType', { value });
        }

        const re = /^[0-9A-Z]{1,4}[0-9A-Z]{2}\-[0-9]{4}$/i;
        if (!re.test(value)) {
            throw new AdifError('WWFFRef does not match pattern', { value, re });
        }

        return true;
    }

}

export default WwffRefDataType;
