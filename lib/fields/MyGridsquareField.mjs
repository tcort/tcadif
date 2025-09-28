'use strict';

import Field from './Field.mjs';
import GridSquareDataType from '../datatypes/GridSquareDataType.mjs';

class MyGridsquareField extends Field {

    constructor(value) {
        super(MyGridsquareField.fieldName, GridSquareDataType, value);
    }

    static get fieldName() {
        return 'MY_GRIDSQUARE';
    }

}

export default MyGridsquareField;
