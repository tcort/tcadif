'use strict';

import Field from './Field.mjs';
import GridSquareExtDataType from '../datatypes/GridSquareExtDataType.mjs';

class MyGridsquareExtField extends Field {

    constructor(value) {
        super(MyGridsquareExtField.fieldName, GridSquareExtDataType, value);
    }

    static get fieldName() {
        return 'MY_GRIDSQUARE_EXT';
    }

}

export default MyGridsquareExtField;
