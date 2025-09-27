'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import QsoCompleteEnum from '../enums/QsoCompleteEnum.mjs';

const enumeration = new QsoCompleteEnum();

class QsoCompleteEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default QsoCompleteEnumerationDataType;
