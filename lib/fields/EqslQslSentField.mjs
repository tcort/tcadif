'use strict';

import Field from './Field.mjs';
import QslSentEnumerationDataType from '../datatypes/QslSentEnumerationDataType.mjs';

class EqslQslSentField extends Field {

    constructor(value) {
        super(EqslQslSentField.fieldName, QslSentEnumerationDataType, value);
    }

    static get fieldName() {
        return 'EQSL_QSL_SENT';
    }

    get defaultValue() {
        return 'N';
    }
}

export default EqslQslSentField;
