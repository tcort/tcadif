'use strict';

import Field from './Field.mjs';
import StringDataType from '../datatypes/StringDataType.mjs';

class StationCallsignField extends Field {

    constructor(value) {
        super(StationCallsignField.fieldName, StringDataType, value);
    }

    static get fieldName() {
        return 'STATION_CALLSIGN';
    }

}

export default StationCallsignField;
