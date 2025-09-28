'use strict';

import Field from './Field.mjs';
import QslRcvdEnumerationDataType from '../datatypes/QslRcvdEnumerationDataType.mjs';

class LotwQslRcvdField extends Field {

    constructor(value) {
        super(LotwQslRcvdField.fieldName, QslRcvdEnumerationDataType, value);
    }

    static get fieldName() {
        return 'LOTW_QSL_RCVD';
    }

    get defaultValue() {
        return 'N';
    }

}

export default LotwQslRcvdField;
