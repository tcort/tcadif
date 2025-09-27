'use strict';

import Field from './Field.mjs';
import QslRcvdEnumerationDataType from '../datatypes/QslRcvdEnumerationDataType.mjs';

class EqslQslRcvdField extends Field {

    constructor(value) {
        super(EqslQslRcvdField.fieldName, QslRcvdEnumerationDataType, value);
    }

    static get fieldName() {
        return 'EQSL_QSL_RCVD';
    }

    get defaultValue() {
        return 'N';
    }

}

export default EqslQslRcvdField;
