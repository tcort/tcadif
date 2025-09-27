'use strict';

import Field from './Field.mjs';
import GridSquareDataType from '../datatypes/GridSquareDataType.mjs';

class GridsquareField extends Field {

    constructor(value) {
        super(GridsquareField.fieldName, GridSquareDataType, value);
    }

    static get fieldName() {
        return 'GRIDSQUARE';
    }

}

export default GridsquareField;
