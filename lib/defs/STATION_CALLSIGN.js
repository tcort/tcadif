'use strict';

const FieldDef = require('./FieldDef');

class STATION_CALLSIGN extends FieldDef {
    constructor() {
        super({
            fieldName: 'STATION_CALLSIGN',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = STATION_CALLSIGN;
