'use strict';

import Field from './Field.mjs';
import TimeDataType from '../datatypes/TimeDataType.mjs';

class TimeOffField extends Field {

    constructor(value) {
        super(TimeOffField.fieldName, TimeDataType, value);
    }

    static get fieldName() {
        return 'TIME_OFF';
    }

}

export default TimeOffField;
