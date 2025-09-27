'use strict';

import Field from './Field.mjs';
import QslSentEnumerationDataType from '../datatypes/QslSentEnumerationDataType.mjs';

class DclQslSentField extends Field {

    constructor(value) {
        super(DclQslSentField.fieldName, QslSentEnumerationDataType, value);
    }

    static get fieldName() {
        return 'DCL_QSL_SENT';
    }

}

export default DclQslSentField;
