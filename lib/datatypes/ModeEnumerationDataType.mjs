'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import ModeEnum from '../enums/ModeEnum.mjs';

const enumeration = new ModeEnum();

class ModeEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default ModeEnumerationDataType;
