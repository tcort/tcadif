'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CharacterDataType from './CharacterDataType.mjs';

class PotaRefDataType extends DataType {

    static normalize(value) {
        return (typeof value === 'string') ? value.toUpperCase() : value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for PotaRefDataType', { value });
        }

        const re = /^[0-9A-Z]{1,4}-[0-9A-Z]{4,5}(@[0-9A-Z-]{4,6})?$/i;
        if (!re.test(value)) {
            throw new AdifError('POTARef does not match pattern', { value, re });
        }

        return true;
    }

}

export default PotaRefDataType;
