'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import SponsoredAwardEnumerationDataType from './SponsoredAwardEnumerationDataType.mjs';

class SponsoredAwardListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for SponsoredAwardListDataType', { value });
        }

        value.split(',').forEach(item => SponsoredAwardEnumerationDataType.validate(item));

        return true;
    }

}

export default SponsoredAwardListDataType;
