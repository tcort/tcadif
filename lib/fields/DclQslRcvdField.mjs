'use strict';

import Field from './Field.mjs';
import QslRcvdEnumerationDataType from '../datatypes/QslRcvdEnumerationDataType.mjs';

class DclQslRcvdField extends Field {

    constructor(value) {
        super(DclQslRcvdField.fieldName, QslRcvdEnumerationDataType, value);
    }

    static get fieldName() {
        return 'DCL_QSL_RCVD';
    }

}

export default DclQslRcvdField;
