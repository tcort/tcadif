'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import AwardEnumerationDataType from './AwardEnumerationDataType.mjs';

class AwardListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for AwardListDataType', { value });
        }

        value.split(',').forEach(item => AwardEnumerationDataType.validate(item));

        return true;
    }

}

export default AwardListDataType;
