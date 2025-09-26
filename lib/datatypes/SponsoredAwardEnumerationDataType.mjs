'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import SponsoredAwardEnum from '../enums/SponsoredAwardEnum.mjs';

const enumeration = new SponsoredAwardEnum();

class SponsoredAwardEnumerationDataType extends EnumerationDataType {

    static validate(value) {
        if (!enumeration.values.some(prefix => value.startsWith(prefix))) {
            throw new AdifError('invalid sponsor prefix', { value, validPrefixes: enumeration.values });
        }

        return true;
    }

}

export default SponsoredAwardEnumerationDataType;
