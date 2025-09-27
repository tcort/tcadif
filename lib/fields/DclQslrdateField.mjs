'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class DclQslrdateField extends Field {

    constructor(value) {
        super(DclQslrdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'DCL_QSLRDATE';
    }

}

export default DclQslrdateField;
