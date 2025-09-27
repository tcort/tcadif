'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import MorseKeyTypeEnum from '../enums/MorseKeyTypeEnum.mjs';

const enumeration = new MorseKeyTypeEnum();

class MorseKeyTypeEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default MorseKeyTypeEnumerationDataType;
