'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class DclQslsdateField extends Field {

    constructor(value) {
        super(DclQslsdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'DCL_QSLSDATE';
    }

}

export default DclQslsdateField;
