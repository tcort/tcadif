'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class SotaRefDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'string') ? value.toUpperCase() : value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for SotaRefDataType', { value });
        }

        const re = /^[0-9A-Z\/-]+$/i;
        if (!re.test(value)) {
            throw new AdifError('SOTARef does not match pattern', { value, re });
        }

        return true;
    }

}

export default SotaRefDataType;
