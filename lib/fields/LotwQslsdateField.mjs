'use strict';

import Field from './Field.mjs';
import DateDataType from '../datatypes/DateDataType.mjs';

class LotwQslsdateField extends Field {

    constructor(value) {
        super(LotwQslsdateField.fieldName, DateDataType, value);
    }

    static get fieldName() {
        return 'LOTW_QSLSDATE';
    }

}

export default LotwQslsdateField;
