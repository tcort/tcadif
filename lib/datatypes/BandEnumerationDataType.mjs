'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import BandEnum from '../enums/BandEnum.mjs';

const enumeration = new BandEnum();

class BandEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default BandEnumerationDataType;
