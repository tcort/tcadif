'use strict';

import Field from './Field.mjs';
import TimeDataType from '../datatypes/TimeDataType.mjs';

class TimeOnField extends Field {

    constructor(value) {
        super(TimeOnField.fieldName, TimeDataType, value);
    }

    static get fieldName() {
        return 'TIME_ON';
    }

}

export default TimeOnField;
