'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import ContinentEnum from '../enums/ContinentEnum.mjs';

const enumeration = new ContinentEnum();

class ContinentEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default ContinentEnumerationDataType;
