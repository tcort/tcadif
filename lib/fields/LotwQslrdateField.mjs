'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class LotwQslrdateField extends Field {

    constructor(value) {
        super(LotwQslrdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'LOTW_QSLRDATE';
    }

}

export default LotwQslrdateField;
