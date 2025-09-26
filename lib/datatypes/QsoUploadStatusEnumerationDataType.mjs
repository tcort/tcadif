'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import QsoUploadStatusEnum from '../enums/QsoUploadStatusEnum.mjs';

const enumeration = new QsoUploadStatusEnum();

class QsoUploadStatusEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default QsoUploadStatusEnumerationDataType;
