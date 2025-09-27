'use strict';

import Field from './Field.mjs';
import GridSquareExtDataType from '../datatypes/GridSquareExtDataType.mjs';

class GridsquareExtField extends Field {

    constructor(value) {
        super(GridsquareExtField.fieldName, GridSquareExtDataType, value);
    }

    static get fieldName() {
        return 'GRIDSQUARE_EXT';
    }

}

export default GridsquareExtField;
