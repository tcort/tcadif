'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from './EnumerationDataType.mjs';
import QsoDownloadStatusEnum from '../enums/QsoDownloadStatusEnum.mjs';

const enumeration = new QsoDownloadStatusEnum();

class QsoDownloadStatusEnumerationDataType extends EnumerationDataType {

    static isImportOnly(value) {
        return EnumerationDataType.isImportOnly(value, enumeration);
    }

    static validate(value) {
        return EnumerationDataType.validate(value, enumeration);
    }

}

export default QsoDownloadStatusEnumerationDataType;
