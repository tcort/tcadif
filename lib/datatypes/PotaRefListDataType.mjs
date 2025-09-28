'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import PotaRefDataType from './PotaRefDataType.mjs';

class PotaRefListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for PotaRefListDataType', { value });
        }

        value.split(',').forEach(item => PotaRefDataType.validate(item));

        return true;
    }

}

export default PotaRefListDataType;
