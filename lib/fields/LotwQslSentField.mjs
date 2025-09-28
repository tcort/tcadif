'use strict';

import Field from './Field.mjs';
import QslSentEnumerationDataType from '../datatypes/QslSentEnumerationDataType.mjs';

class LotwQslSentField extends Field {

    constructor(value) {
        super(LotwQslSentField.fieldName, QslSentEnumerationDataType, value);
    }

    static get fieldName() {
        return 'LOTW_QSL_SENT';
    }

    get defaultValue() {
        return 'N';
    }
}

export default LotwQslSentField;
