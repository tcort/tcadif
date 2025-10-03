'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class QrzcomQsoDownloadDateField extends Field {

    constructor(value) {
        super(QrzcomQsoDownloadDateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'QRZCOM_QSO_DOWNLOAD_DATE';
    }

}

export default QrzcomQsoDownloadDateField;
